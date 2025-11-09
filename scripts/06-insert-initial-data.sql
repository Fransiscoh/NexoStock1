-- Insertar usuario administrador por defecto
INSERT INTO users (name, email, password_hash, role) VALUES 
('Administrador', 'admin@stock.com', crypt('admin123', gen_salt('bf')), 'admin');

-- Insertar marcas iniciales
INSERT INTO brands (name, description) VALUES 
('La Preferida', 'Productos alimenticios de calidad'),
('Natura', 'Aceites y productos naturales'),
('Ledesma', 'Azúcar y endulzantes'),
('Morixe', 'Harinas y productos de panadería'),
('Arcor', 'Golosinas y productos dulces'),
('Marolio', 'Conservas y productos enlatados'),
('Sancor', 'Productos lácteos');

-- Insertar categorías iniciales
INSERT INTO categories (name, description) VALUES 
('Granos', 'Arroz, quinoa, legumbres'),
('Aceites', 'Aceites vegetales y de cocina'),
('Endulzantes', 'Azúcar, edulcorantes, miel'),
('Harinas', 'Harinas de todo tipo'),
('Lácteos', 'Leche, quesos, yogures'),
('Conservas', 'Productos enlatados y conservados'),
('Bebidas', 'Jugos, gaseosas, aguas');

-- Insertar productos iniciales
WITH brand_ids AS (
    SELECT name, id FROM brands
), category_ids AS (
    SELECT name, id FROM categories
)
INSERT INTO products (
    name, code, brand_id, category_id, stock, min_stock, 
    purchase_price, selling_price, unit, measurement_type
)
SELECT 
    'Arroz Blanco', 'ARR001', b.id, c.id, 150, 20, 1.80, 2.34, 'kg', 'weight'
FROM brand_ids b, category_ids c 
WHERE b.name = 'La Preferida' AND c.name = 'Granos'

UNION ALL

SELECT 
    'Aceite Girasol', 'ACE001', b.id, c.id, 80, 15, 2.50, 3.25, 'litro', 'volume'
FROM brand_ids b, category_ids c 
WHERE b.name = 'Natura' AND c.name = 'Aceites'

UNION ALL

SELECT 
    'Azúcar Blanca', 'AZU001', b.id, c.id, 200, 30, 1.20, 1.56, 'kg', 'weight'
FROM brand_ids b, category_ids c 
WHERE b.name = 'Ledesma' AND c.name = 'Endulzantes'

UNION ALL

SELECT 
    'Harina de Trigo', 'HAR001', b.id, c.id, 5, 25, 1.00, 1.30, 'kg', 'weight'
FROM brand_ids b, category_ids c 
WHERE b.name = 'Morixe' AND c.name = 'Harinas';

-- Insertar historial de precios inicial para los productos
INSERT INTO price_history (product_id, purchase_price, selling_price)
SELECT id, purchase_price, selling_price FROM products;
