-- Link inbound packages to Tour type (region) and Location (destination).
ALTER TABLE packages
  ADD COLUMN inboundRegionId VARCHAR(64) NULL AFTER countryId,
  ADD COLUMN destinationId VARCHAR(64) NULL AFTER inboundRegionId;
