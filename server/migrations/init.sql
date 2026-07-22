-- Create database and questions table
CREATE DATABASE IF NOT EXISTS willcoyne CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE willcoyne;

CREATE TABLE IF NOT EXISTS questions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  email VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  tier VARCHAR(32) DEFAULT 'free',
  amount DECIMAL(10,2) NULL,
  txn VARCHAR(255) NULL,
  status VARCHAR(32) DEFAULT 'submitted',
  answer TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME NULL
);
