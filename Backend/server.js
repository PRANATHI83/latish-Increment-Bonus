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

// Helper: Normalize month input
function normalizeMonth(month) {
  return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('❌ Internal Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};

// GET employee record (used for duplicate check)
app.get('/api/employee/:employeeId/:month/:year', async (req, res, next) => {
  try {
    let { employeeId, month, year } = req.params;
    month = normalizeMonth(month);

    const yearAsInt = parseInt(year, 10);
    if (isNaN(yearAsInt)) {
      return res.status(400).json({ error: 'Invalid year format' });
    }

    const query = `
      SELECT employee_id, employee_name, month, year, current_salary,
             increment_percentage, bonus_amount, new_salary, comments
      FROM employee_records
      WHERE UPPER(employee_id) = UPPER($1)
        AND month = $2
        AND year = $3
    `;

    const result = await pool.query(query, [employeeId, month, yearAsInt]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No record found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST save new employee record (from HR panel)
app.post('/api/employee', async (req, res, next) => {
  try {
    const {
      employeeId, employeeName, department, position, month, year,
      currentSalary, incrementPercentage, bonusAmount, comments
    } = req.body;

    if (!employeeId.match(/^ATS0(?!000)\d{3}$/)) {
      return res.status(400).json({ error: 'Invalid Employee ID format' });
    }

    if (currentSalary < 0 || currentSalary > 1000000 ||
        bonusAmount < 0 || bonusAmount > 1000000 ||
        incrementPercentage < 0 || incrementPercentage > 100) {
      return res.status(400).json({ error: 'Invalid numeric values' });
    }

    const normalizedMonth = normalizeMonth(month);
    const yearAsInt = parseInt(year, 10);

    const duplicate = await pool.query(`
      SELECT 1 FROM employee_records
      WHERE employee_id = $1 AND month = $2 AND year = $3
    `, [employeeId, normalizedMonth, yearAsInt]);

    if (duplicate.rows.length > 0) {
      return res.status(409).json({ error: 'Record already exists for this month and year' });
    }

    const incrementAmount = currentSalary * (incrementPercentage / 100);
    const newSalary = currentSalary + incrementAmount;

    const insert = await pool.query(`
      INSERT INTO employee_records (
        employee_id, employee_name, department, position, month, year,
        current_salary, increment_percentage, bonus_amount, new_salary, comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      employeeId, employeeName, department, position, normalizedMonth, yearAsInt,
      currentSalary, incrementPercentage, bonusAmount, newSalary, comments
    ]);

    const record = insert.rows[0];
    res.json({
      ...record,
      current_salary: parseFloat(record.current_salary),
      increment_percentage: parseFloat(record.increment_percentage),
      bonus_amount: parseFloat(record.bonus_amount),
      new_salary: parseFloat(record.new_salary)
    });
  } catch (err) {
    next(err);
  }
});

// Apply error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
