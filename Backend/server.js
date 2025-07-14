const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3004;

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'postgres', // Docker service name or actual IP if not in Docker
  database: 'employee_portal',
  password: 'admin234',
  port: 5432,
});

// Middleware
app.use(cors()); // Enables CORS for all origins, consider restricting in production
app.use(express.json()); // Parses incoming JSON requests

// Valid months array
const VALID_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to normalize and validate month input
function normalizeMonth(month) {
  if (typeof month !== 'string') {
    throw new Error('Month must be a string');
  }
  const formatted = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  if (!VALID_MONTHS.includes(formatted)) {
    throw new Error(`Invalid month name: "${month}". Must be one of ${VALID_MONTHS.join(', ')}.`);
  }
  return formatted;
}

// Global Error Handler Middleware
// This should be the last app.use() after all routes
const errorHandler = (err, req, res, next) => {
  console.error('❌ Global Server Error:', err.stack); // Log the full stack trace for debugging
  // You might want to send different messages for different error types in production
  if (err.message.includes('Invalid month name') || err.message.includes('Invalid numeric values') || err.message.includes('Invalid Employee ID format')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Something went wrong on the server!' });
};

// --- ROUTES ---

// Health Check / Root Route
app.get('/', (req, res) => {
  res.status(200).send('HR Panel Backend is running!');
});

// GET employee record (for duplicate check and fetching existing data)
// Expected URL: /api/employee/:employeeId/:month/:year
app.get('/api/employee/:employeeId/:month/:year', async (req, res, next) => {
  try {
    let { employeeId, month, year } = req.params;

    // Input validation and normalization
    const normalizedMonth = normalizeMonth(month); // Uses the helper function
    const yearAsInt = parseInt(year, 10);
    if (isNaN(yearAsInt) || yearAsInt < 1900 || yearAsInt > 2100) { // Add year range validation
      return res.status(400).json({ error: 'Invalid year format. Year must be a valid number (e.g., 2025).' });
    }

    const query = `
      SELECT employee_id, employee_name, department, position, month, year, current_salary,
             increment_percentage, bonus_amount, new_salary, comments, created_at
      FROM employee_records
      WHERE UPPER(employee_id) = UPPER($1) -- Case-insensitive employee ID lookup
        AND month = $2
        AND year = $3
    `;

    const result = await pool.query(query, [employeeId, normalizedMonth, yearAsInt]);

    if (result.rows.length === 0) {
      // This 404 is intentional for "no record found" from the server's perspective
      // The frontend should interpret this as a valid non-duplicate state.
      return res.status(404).json({ error: 'No record found for the given employee, month, and year.' });
    }

    // Respond with the found record (first one if multiple, though unique constraint should prevent this)
    // Convert numeric strings from DB to floats for consistency with frontend
    const record = result.rows[0];
    res.json({
      ...record,
      current_salary: parseFloat(record.current_salary),
      increment_percentage: parseFloat(record.increment_percentage),
      bonus_amount: parseFloat(record.bonus_amount),
      new_salary: parseFloat(record.new_salary)
    });

  } catch (err) {
    // Pass error to the global error handler
    next(err);
  }
});

// POST new employee record (from HR panel form submission)
// Expected Body: { employeeId, employeeName, department, position, month, year,
//                   currentSalary, incrementPercentage, bonusAmount, comments }
app.post('/api/employee', async (req, res, next) => {
  try {
    // Destructure and defensively convert/validate inputs
    const {
      employeeId, employeeName, department, position, month, year,
      comments
    } = req.body;

    let { currentSalary, incrementPercentage, bonusAmount } = req.body;

    // --- Input Validation and Normalization ---

    // 1. Basic presence and type checks
    if (!employeeId || !employeeName || !month || !year || currentSalary === undefined || incrementPercentage === undefined || bonusAmount === undefined) {
      return res.status(400).json({ error: 'Missing required fields: employeeId, employeeName, month, year, currentSalary, incrementPercentage, bonusAmount.' });
    }

    // 2. Employee ID format validation
    if (typeof employeeId !== 'string' || !employeeId.match(/^ATS0(?!000)\d{3}$/)) {
      return res.status(400).json({ error: 'Invalid Employee ID format. Must be like ATS0XXX (e.g., ATS0123).' });
    }

    // 3. Normalize and validate month
    const normalizedMonth = normalizeMonth(month);

    // 4. Validate and parse year
    const yearAsInt = parseInt(year, 10);
    if (isNaN(yearAsInt) || yearAsInt < 1900 || yearAsInt > 2100) {
      return res.status(400).json({ error: 'Invalid year. Must be a valid number (e.g., 2025).' });
    }

    // 5. Numeric value validation and parsing (CRITICAL for preventing NaN/type errors)
    currentSalary = parseFloat(currentSalary);
    incrementPercentage = parseFloat(incrementPercentage);
    bonusAmount = parseFloat(bonusAmount);

    if (isNaN(currentSalary) || isNaN(incrementPercentage) || isNaN(bonusAmount)) {
      return res.status(400).json({ error: 'Salary, increment, and bonus must be valid numbers.' });
    }
    if (currentSalary < 0 || currentSalary > 1000000) {
      return res.status(400).json({ error: 'Current Salary must be between 0 and 1,000,000.' });
    }
    if (incrementPercentage < 0 || incrementPercentage > 100) {
      return res.status(400).json({ error: 'Increment Percentage must be between 0 and 100.' });
    }
    if (bonusAmount < 0 || bonusAmount > 1000000) {
      return res.status(400).json({ error: 'Bonus Amount must be between 0 and 1,000,000.' });
    }

    // --- Duplicate Check (Server-side defense against race conditions / direct API calls) ---
    const duplicateQuery = `
      SELECT 1 FROM employee_records
      WHERE UPPER(employee_id) = UPPER($1) AND month = $2 AND year = $3
    `;
    const duplicateResult = await pool.query(duplicateQuery, [employeeId, normalizedMonth, yearAsInt]);

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({ error: `Record for Employee ID ${employeeId} already exists for ${normalizedMonth}, ${yearAsInt}.` });
    }

    // --- Business Logic Calculation ---
    const incrementAmount = currentSalary * (incrementPercentage / 100);
    const newSalary = currentSalary + incrementAmount;

    // --- Database Insertion ---
    const insertQuery = `
      INSERT INTO employee_records (
        employee_id, employee_name, department, position, month, year,
        current_salary, increment_percentage, bonus_amount, new_salary, comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING * -- Return the inserted row
    `;

    const insertResult = await pool.query(insertQuery, [
      employeeId, employeeName, department, position, normalizedMonth, yearAsInt,
      currentSalary, incrementPercentage, bonusAmount, newSalary, comments
    ]);

    const newRecord = insertResult.rows[0];

    // Respond with the newly created record, ensuring numeric values are parsed correctly
    res.status(201).json({ // 201 Created status for successful resource creation
      message: 'Employee record saved successfully!',
      record: {
        ...newRecord,
        current_salary: parseFloat(newRecord.current_salary),
        increment_percentage: parseFloat(newRecord.increment_percentage),
        bonus_amount: parseFloat(newRecord.bonus_amount),
        new_salary: parseFloat(newRecord.new_salary)
      }
    });

  } catch (err) {
    // Pass unexpected errors to the global error handler
    next(err);
  }
});

// Use the global error handler as the last middleware
app.use(errorHandler);

// Start server
pool.connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL database');
    app.listen(port, () => {
      console.log(`🚀 HR Panel Backend server running on http://13.201.36.187:${port}`);
      console.log(`📡 Use http://13.201.36.187:${port} for local access (if port forwarding is set up)`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    console.error('Is the PostgreSQL container running and accessible on the "postgres" host?');
    process.exit(1); // Exit if DB connection fails
  });