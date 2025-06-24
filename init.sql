-- Create jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    company VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    job_type VARCHAR(50) NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    work_mode VARCHAR(50),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    currency VARCHAR(10),
    salary_from NUMERIC,
    salary_to NUMERIC,
    salary_period VARCHAR(20),
    start_date DATE,
    deadline DATE,
    job_summary TEXT NOT NULL,
    responsibilities TEXT,
    requirements TEXT,
    skills TEXT,
    benefits TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create applications table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    resume TEXT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    saved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_jobs_deadline ON jobs(deadline);
CREATE INDEX idx_jobs_search ON jobs USING GIN (
    to_tsvector('english', title || ' ' || company || ' ' || city || ' ' || skills)
);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_favorites_job_id ON favorites(job_id);
