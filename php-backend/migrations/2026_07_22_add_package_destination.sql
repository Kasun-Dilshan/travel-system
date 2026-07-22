-- Link outbound packages to Destinations region/country pages
ALTER TABLE packages
  ADD COLUMN continentId VARCHAR(64) NULL AFTER category,
  ADD COLUMN countryId VARCHAR(64) NULL AFTER continentId;
