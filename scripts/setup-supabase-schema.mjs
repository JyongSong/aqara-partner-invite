/**
 * Setup Supabase schema for aqara-partner-invite
 * Usage: node scripts/setup-supabase-schema.mjs
 */
import pg from "pg";
import "dotenv/config";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SQL = `
-- Enums
DO $$ BEGIN
  CREATE TYPE role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('attend', 'not_attend', 'reviewing');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sales_experience AS ENUM ('under1', '1to3', '3to5', '5to10', 'over10');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE annual_sales_volume AS ENUM ('under100', '100to300', '300to500', '500to1000', 'over1000');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sales_target AS ENUM ('enduser', 'b2b', 'both');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE installation_method AS ENUM ('own_team', 'outsource', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE installation_staff AS ENUM ('none', '1to2', '3to5', '6to10', 'over10');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE iot_expansion_intent AS ENUM ('already', 'reviewing', 'interested', 'none');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_signed_in TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  attendance_status attendance_status NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(30) NOT NULL,
  email VARCHAR(320),
  business_region VARCHAR(50) NOT NULL,
  business_region_detail VARCHAR(100),
  sales_experience sales_experience NOT NULL,
  annual_sales_volume annual_sales_volume NOT NULL,
  sales_target sales_target NOT NULL,
  installation_method installation_method NOT NULL,
  installation_staff installation_staff NOT NULL,
  iot_expansion_intent iot_expansion_intent NOT NULL,
  attendance_purpose TEXT NOT NULL,
  attendance_purpose_other TEXT,
  interested_products TEXT,
  additional_inquiry TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_submitted_at ON survey_responses (submitted_at);
CREATE INDEX IF NOT EXISTS idx_users_open_id ON users (open_id);
`;

async function main() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL");
    await client.query(SQL);
    console.log("Schema created successfully!");
  } catch (err) {
    console.error("Failed to setup schema:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
