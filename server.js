const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;

// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'jobflow_db',
    password: 'root',
    port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a new job posting
app.post('/api/jobs', async (req, res) => {
    try {
        const {
            title, department, company, website, jobType, experienceLevel, workMode,
            city, state, country, currency, salaryFrom, salaryTo, salaryPeriod,
            startDate, deadline, jobSummary, responsibilities, requirements, skills,
            benefits, contactEmail, contactPhone
        } = req.body;

        const query = `
            INSERT INTO jobs (
                title, department, company, website, job_type, experience_level, work_mode,
                city, state, country, currency, salary_from, salary_to, salary_period,
                start_date, deadline, job_summary, responsibilities, requirements, skills,
                benefits, contact_email, contact_phone, posted_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const values = [
            title, department, company, website, jobType, experienceLevel, workMode,
            city, state, country, currency, salaryFrom, salaryTo, salaryPeriod,
            startDate, deadline, jobSummary, responsibilities, requirements, skills,
            benefits, contactEmail, contactPhone
        ];

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Job posted successfully', job: result.rows[0] });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ error: 'Failed to post job' });
    }
});

// Get all jobs with pagination
app.get('/api/jobs', async (req, res) => {
    try {
        const { page = 1, limit = 6, search = '' } = req.query;
        const offset = (page - 1) * limit;
        const searchTerm = `%${search.toLowerCase()}%`;

        const query = `
            SELECT * FROM jobs
            WHERE deadline >= CURRENT_DATE
            AND (
                LOWER(title) LIKE $1
                OR LOWER(company) LIKE $1
                OR LOWER(city) LIKE $1
                OR LOWER(skills) LIKE $1
            )
            ORDER BY posted_date DESC
            LIMIT $2 OFFSET $3
        `;
        const countQuery = `
            SELECT COUNT(*) FROM jobs
            WHERE deadline >= CURRENT_DATE
            AND (
                LOWER(title) LIKE $1
                OR LOWER(company) LIKE $1
                OR LOWER(city) LIKE $1
                OR LOWER(skills) LIKE $1
            )
        `;

        const [jobsResult, countResult] = await Promise.all([
            pool.query(query, [searchTerm, limit, offset]),
            pool.query(countQuery, [searchTerm])
        ]);

        res.json({
            jobs: jobsResult.rows,
            totalPages: Math.ceil(countResult.rows[0].count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Get job by ID
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM jobs WHERE id = $1 AND deadline >= CURRENT_DATE';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found or expired' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

// Save job application
app.post('/api/applications', async (req, res) => {
    try {
        const { jobId, applicantName, applicantEmail, resume } = req.body;
        const query = `
            INSERT INTO applications (job_id, applicant_name, applicant_email, resume, application_date)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const values = [jobId, applicantName, applicantEmail, resume];

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Application submitted successfully', application: result.rows[0] });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Save job to favorites
app.post('/api/favorites', async (req, res) => {
    try {
        const { jobId, userId } = req.body;
        const query = `
            INSERT INTO favorites (job_id, user_id, saved_date)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (job_id, user_id) DO NOTHING
            RETURNING *
        `;
        const values = [jobId, userId];

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Job saved to favorites', favorite: result.rows[0] });
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({ error: 'Failed to save job' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});