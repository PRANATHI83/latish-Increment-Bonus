const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3004;

// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres',
    host: 'postgres',
    database: 'employee_portal',
    password: 'admin234',
    port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
};

// Get employee details (Employee Portal)
app.get('/api/employee/:employeeId/:month/:year', async (req, res, next) => {
    try {
        const { employeeId, month, year } = req.params;
        console.log('Step 1 - Received parameters:', { employeeId, month, year });

        const yearAsInt = parseInt(year, 10);
        if (isNaN(yearAsInt)) {
            console.log('Step 2 - Invalid year format:', year);
            return res.status(400).json({ error: 'Invalid year format' });
        }
        console.log('Step 2 - Converted year to integer:', yearAsInt);

        const queryText = `
            SELECT employee_id, employee_name, month, year, current_salary,
                   increment_percentage, bonus_amount, new_salary, comments
            FROM employee_records
            WHERE UPPER(employee_id) = UPPER($1) 
              AND UPPER(month) = UPPER($2) 
              AND year = $3
        `;
        console.log('Step 3 - Executing query:', queryText);
        console.log('Step 4 - Query parameters:', [employeeId, month, yearAsInt]);

        const result = await pool.query(queryText, [employeeId, month, yearAsInt]);
        console.log('Step 5 - Query result:', result.rows);

        if (result.rows.length === 0) {
            const allRecords = await pool.query(
                'SELECT employee_id, month, year FROM employee_records WHERE UPPER(employee_id) = UPPER($1)',
                [employeeId]
            );
            console.log('Step 6 - All records for employee:', allRecords.rows);

            console.log('Step 7 - No records found, returning 404');
            return res.status(404).json({ error: 'No records found' });
        }

        console.log('Step 7 - Record found, returning data');
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Step 8 - Error executing query:', err);
        next(err);
    }
});

// Save employee record (HR Panel)
app.post('/api/employee', async (req, res, next) => {
  try {
    const {
      employeeId, employeeName, department, position, month, year,
      currentSalary, incrementPercentage, bonusAmount, comments
    } = req.body;

    // Validate inputs
    if (!employeeId.match(/^ATS0(?!000)\d{3}$/)) {
      return res.status(400).json({ error: 'Invalid Employee ID format' });
    }

   if (currentSalary < 0 || currentSalary > 1000000 ||
    bonusAmount < 0 || bonusAmount > 1000000 ||
    incrementPercentage < 0 || incrementPercentage > 100) {
  return res.status(400).json({ error: 'Invalid numeric values' });
}

    // Calculate new salary
    const incrementAmount = currentSalary * (incrementPercentage / 100);
    const newSalary = currentSalary + incrementAmount;

    // Check for duplicate record
    const existing = await pool.query(`
      SELECT 1 FROM employee_records
      WHERE employee_id = $1 AND month = $2 AND year = $3
    `, [employeeId, month, year]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Record already exists for this month and year' });
    }

    // Insert new record
    const result = await pool.query(`
      INSERT INTO employee_records (
        employee_id, employee_name, department, position, month, year,
        current_salary, increment_percentage, bonus_amount, new_salary, comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      employeeId, employeeName, department, position, month, year,
      currentSalary, incrementPercentage, bonusAmount, newSalary, comments
    ]);

    // Parse numeric fields before sending response
    const record = result.rows[0];
    res.json({
      ...record,
      current_salary: parseFloat(record.current_salary),
      increment_percentage: parseFloat(record.increment_percentage),
      bonus_amount: parseFloat(record.bonus_amount),
      new_salary: parseFloat(record.new_salary),
    });
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
