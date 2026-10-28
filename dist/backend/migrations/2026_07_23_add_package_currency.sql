-- Store each package price in USD or LKR (amount stays in packages.price)
ALTER TABLE packages
  ADD COLUMN currency ENUM('USD', 'LKR') NOT NULL DEFAULT 'USD' AFTER price;
