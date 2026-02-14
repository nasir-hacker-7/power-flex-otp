-- MySQL Tables Creation Script
-- Copy and paste this in Railway MySQL console

-- Table 1: phone_numbers
CREATE TABLE IF NOT EXISTS phone_numbers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  number VARCHAR(20) NOT NULL UNIQUE,
  country VARCHAR(5) NOT NULL,
  countryFlag VARCHAR(10),
  isAvailable TINYINT DEFAULT 1,
  assignedToTelegramId VARCHAR(50),
  assignedAt DATETIME,
  usageCount INT DEFAULT 0,
  lastUsedAt DATETIME,
  deletedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: telegram_users
CREATE TABLE IF NOT EXISTS telegram_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  telegramId VARCHAR(50) NOT NULL UNIQUE,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  username VARCHAR(100),
  currentPhoneNumberId INT,
  isVerified TINYINT DEFAULT 0,
  totalRequests INT DEFAULT 0,
  totalOtpRequests INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: otp_logs
CREATE TABLE IF NOT EXISTS otp_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  telegramId VARCHAR(50),
  phoneNumberId INT,
  phoneNumber VARCHAR(20),
  otpCode VARCHAR(20),
  status VARCHAR(50),
  requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Verify tables created
SHOW TABLES;
