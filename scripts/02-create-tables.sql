-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de marcas
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de categorías
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de productos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    stock DECIMAL(10,3) NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock DECIMAL(10,3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    purchase_price DECIMAL(10,2) NOT NULL CHECK (purchase_price >= 0),
    selling_price DECIMAL(10,2) NOT NULL CHECK (selling_price >= 0),
    unit VARCHAR(50) NOT NULL,
    measurement_type VARCHAR(50) NOT NULL CHECK (measurement_type IN ('weight', 'volume', 'length', 'quantity')),
    is_fractioned BOOLEAN DEFAULT false,
    is_mix BOOLEAN DEFAULT false,
    original_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    extracted_from TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de historial de precios
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    purchase_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    previous_purchase_price DECIMAL(10,2),
    previous_selling_price DECIMAL(10,2),
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de componentes de mix
CREATE TABLE mix_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mix_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    component_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mix_product_id, component_product_id)
);

-- Tabla de ventas
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
    total_profit DECIMAL(10,2) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Tabla de items de venta
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL, -- Snapshot del nombre
    product_code VARCHAR(100) NOT NULL, -- Snapshot del código
    product_unit VARCHAR(50) NOT NULL, -- Snapshot de la unidad
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
    profit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de movimientos de stock
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'sale', 'mix_creation', 'fraction')),
    quantity DECIMAL(10,3) NOT NULL,
    previous_stock DECIMAL(10,3) NOT NULL,
    new_stock DECIMAL(10,3) NOT NULL,
    reference_id UUID, -- Puede referenciar sale_id, mix_id, etc.
    reference_type VARCHAR(50), -- 'sale', 'mix', 'fraction', 'manual'
    notes TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cierres de caja
CREATE TABLE cash_closures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    closure_date DATE NOT NULL,
    total_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_profit DECIMAL(10,2) NOT NULL DEFAULT 0,
    transactions_count INTEGER NOT NULL DEFAULT 0,
    total_items_sold DECIMAL(10,3) NOT NULL DEFAULT 0,
    closed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(closure_date)
);

-- Tabla de productos vendidos por cierre
CREATE TABLE closure_product_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    closure_id UUID NOT NULL REFERENCES cash_closures(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_unit VARCHAR(50) NOT NULL,
    quantity_sold DECIMAL(10,3) NOT NULL,
    total_revenue DECIMAL(10,2) NOT NULL,
    total_profit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios en las tablas
COMMENT ON TABLE users IS 'Usuarios del sistema';
COMMENT ON TABLE brands IS 'Marcas de productos';
COMMENT ON TABLE categories IS 'Categorías de productos';
COMMENT ON TABLE products IS 'Productos del inventario';
COMMENT ON TABLE price_history IS 'Historial de cambios de precios';
COMMENT ON TABLE mix_components IS 'Componentes de productos mix';
COMMENT ON TABLE sales IS 'Ventas realizadas';
COMMENT ON TABLE sale_items IS 'Items individuales de cada venta';
COMMENT ON TABLE stock_movements IS 'Movimientos de stock (entradas, salidas, ajustes)';
COMMENT ON TABLE cash_closures IS 'Cierres de caja diarios';
COMMENT ON TABLE closure_product_summary IS 'Resumen de productos vendidos por cierre';
