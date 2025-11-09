-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para generar número de venta
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
DECLARE
    sale_count INTEGER;
    sale_date TEXT;
BEGIN
    sale_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COUNT(*) + 1 INTO sale_count
    FROM sales 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    RETURN sale_date || '-' || LPAD(sale_count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Función para registrar movimiento de stock
CREATE OR REPLACE FUNCTION register_stock_movement(
    p_product_id UUID,
    p_movement_type VARCHAR(50),
    p_quantity DECIMAL(10,3),
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_previous_stock DECIMAL(10,3);
    v_new_stock DECIMAL(10,3);
    v_movement_id UUID;
BEGIN
    -- Obtener stock actual
    SELECT stock INTO v_previous_stock
    FROM products
    WHERE id = p_product_id;
    
    -- Calcular nuevo stock
    IF p_movement_type IN ('in', 'adjustment') THEN
        v_new_stock := v_previous_stock + p_quantity;
    ELSE
        v_new_stock := v_previous_stock - p_quantity;
    END IF;
    
    -- Validar que el stock no sea negativo
    IF v_new_stock < 0 THEN
        RAISE EXCEPTION 'Stock insuficiente. Stock actual: %, Cantidad solicitada: %', v_previous_stock, p_quantity;
    END IF;
    
    -- Actualizar stock del producto
    UPDATE products 
    SET stock = v_new_stock, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
    
    -- Registrar movimiento
    INSERT INTO stock_movements (
        product_id, movement_type, quantity, previous_stock, new_stock,
        reference_id, reference_type, notes, user_id
    ) VALUES (
        p_product_id, p_movement_type, p_quantity, v_previous_stock, v_new_stock,
        p_reference_id, p_reference_type, p_notes, p_user_id
    ) RETURNING id INTO v_movement_id;
    
    RETURN v_movement_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de producto
CREATE OR REPLACE FUNCTION get_product_sales_stats(p_product_id UUID)
RETURNS TABLE (
    total_quantity_sold DECIMAL(10,3),
    total_revenue DECIMAL(10,2),
    total_profit DECIMAL(10,2),
    sales_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(si.quantity), 0) as total_quantity_sold,
        COALESCE(SUM(si.total_price), 0) as total_revenue,
        COALESCE(SUM(si.profit), 0) as total_profit,
        COUNT(DISTINCT si.sale_id)::INTEGER as sales_count
    FROM sale_items si
    WHERE si.product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular margen de ganancia
CREATE OR REPLACE FUNCTION calculate_profit_margin(
    p_purchase_price DECIMAL(10,2),
    p_selling_price DECIMAL(10,2)
)
RETURNS DECIMAL(5,2) AS $$
BEGIN
    IF p_purchase_price = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND(((p_selling_price - p_purchase_price) / p_purchase_price * 100), 2);
END;
$$ LANGUAGE plpgsql;
