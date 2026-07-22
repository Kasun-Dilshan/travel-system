-- Outbound destinations catalog: regions (continents) and countries.
-- Package linking still uses packages.continentId / packages.countryId (slug strings).

CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255) DEFAULT '',
    sortOrder INT DEFAULT 0,
    localizations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS countries (
    id VARCHAR(64) PRIMARY KEY,
    regionId VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fullDescription TEXT,
    image VARCHAR(255) DEFAULT '',
    images JSON,
    matchKeys JSON,
    facts JSON,
    tips JSON,
    highlights JSON,
    sortOrder INT DEFAULT 0,
    localizations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_countries_regionId FOREIGN KEY (regionId)
        REFERENCES regions(id) ON DELETE CASCADE,
    INDEX idx_countries_regionId (regionId)
);
