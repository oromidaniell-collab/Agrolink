-- ================================================
-- AGROLINK ADMIN USER SEED
-- ================================================

INSERT INTO users (national_id, username, full_name, email, password, phone, role, location, is_verified, is_active) VALUES
('00000000', 'admin', 'System Administrator', 'admin@agrilink.com', '$2a$10$1D36nE0bGFAYW/6QcICMb.FyzBAo5XOlX8NbCvfWEp4qiv13Ako86', '0700000000', 'admin', 'Nairobi', 1, 1)
ON DUPLICATE KEY UPDATE 
full_name = VALUES(full_name),
password = VALUES(password),
role = VALUES(role),
is_verified = VALUES(is_verified);
