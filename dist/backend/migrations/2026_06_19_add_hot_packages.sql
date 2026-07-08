-- Add isHot flag for packages shown in the site-wide Hot Package popup
ALTER TABLE packages
  ADD COLUMN isHot BOOLEAN DEFAULT FALSE AFTER featured;
