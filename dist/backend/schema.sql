-- SQL Schema for Travel Business System

CREATE DATABASE IF NOT EXISTS travel_system;
USE travel_system;

-- 1. Packages Table
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255) NOT NULL,
    gallery JSON,
    duration VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    highlights JSON,
    itinerary JSON,
    inclusions JSON,
    exclusions JSON,
    category ENUM('Inbound', 'Outbound') NOT NULL,
    type ENUM('Day', 'Round') DEFAULT 'Day',
    featured BOOLEAN DEFAULT FALSE,
    localizations JSON,
    route JSON,
    isLimitedTime BOOLEAN DEFAULT FALSE,
    discountPercentage INT DEFAULT 0,
    expiryDate DATETIME,
    seoTitle VARCHAR(255),
    seoDescription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tourId INT NOT NULL,
    tourTitle VARCHAR(255) NOT NULL,
    clientName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    bookingDate DATETIME NOT NULL,
    guests INT NOT NULL,
    specialRequests TEXT,
    totalPrice DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourId) REFERENCES packages(id) ON DELETE CASCADE
);

-- 3. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    coverImage VARCHAR(255),
    tags JSON,
    category VARCHAR(100) DEFAULT 'Travel Tips',
    author VARCHAR(100) DEFAULT 'Serendib Travel',
    status ENUM('draft', 'published') DEFAULT 'draft',
    publishedAt DATETIME,
    seoTitle VARCHAR(255),
    seoDescription TEXT,
    readTime VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Site Settings Table (One row only)
CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    siteId VARCHAR(50) DEFAULT 'main' UNIQUE,
    heroTitle VARCHAR(255),
    heroSubtitle TEXT,
    heroImages JSON,
    aboutTitle VARCHAR(255),
    aboutText TEXT,
    contactEmail VARCHAR(255),
    contactPhone VARCHAR(50),
    contactWhatsApp VARCHAR(50),
    contactAddress TEXT,
    socialFacebook VARCHAR(255),
    socialInstagram VARCHAR(255),
    socialTwitter VARCHAR(255),
    socialYoutube VARCHAR(255),
    socialTripAdvisor VARCHAR(255),
    partnerLogos JSON,
    featuredTourIds JSON,
    announcementEnabled BOOLEAN DEFAULT FALSE,
    announcementText TEXT,
    announcementLink VARCHAR(255),
    companyName VARCHAR(255),
    companyTagline VARCHAR(255),
    companyLogo VARCHAR(255),
    footerText TEXT,
    seoTitle VARCHAR(255),
    seoDescription TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings if not exists
INSERT IGNORE INTO site_settings (id, siteId, heroTitle, heroSubtitle) VALUES (1, 'main', 'Discover Sri Lanka\'s Hidden Paradise', 'Your journey to the gem of the Indian Ocean starts here.');
