-- ================================================
-- AGROLINK CATEGORY SEEDS
-- ================================================

INSERT INTO categories (name, slug, description, icon, is_active) VALUES
('Vegetables', 'vegetables', 'Fresh organic farm vegetables', '🥦', 1),
('Fruits', 'fruits', 'Sweet and healthy local fruits', '🍎', 1),
('Grains & Cereals', 'grains', 'High-quality grains, maize, wheat, and beans', '🌾', 1),
('Dairy & Eggs', 'dairy', 'Fresh milk, cheese, and farm eggs', '🥛', 1),
('Meat & Poultry', 'meat', 'Fresh and healthy farm-raised meats', '🥩', 1),
('Herbs & Spices', 'herbs', 'Aromatic farm-fresh herbs and spices', '🌿', 1),
('Other', 'other', 'Other agricultural items and input supplies', '🏪', 1)
ON DUPLICATE KEY UPDATE 
description = VALUES(description),
icon = VALUES(icon),
is_active = VALUES(is_active);
