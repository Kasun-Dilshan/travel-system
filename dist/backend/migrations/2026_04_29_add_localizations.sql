-- Adds JSON translation buckets for admin-entered content.
-- Run this once on an existing database.

ALTER TABLE blogs
  ADD COLUMN localizations JSON NULL AFTER seoDescription;

ALTER TABLE site_settings
  ADD COLUMN localizations JSON NULL AFTER premiumServices;

