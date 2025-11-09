-- Procedimiento para procesar una venta completa
CREATE OR REPLACE FUNCTION process_sale(
    p_user_id UUID,
    p_sale_items JSONB,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_item JSONB;
    v_total_amount DECIMAL(10,2) := 0;
    v_total_cost DECIMAL(10,2) := 0;
    v_total_profit DECIMAL(10,2) := 0;
    v_product RECORD;
BEGIN
    -- Crear la venta
    INSERT INTO sales (user_id, total_amount, total_cost, total_profit, notes)
    VALUES (p_user_id, 0, 0, 0, p_notes)
    RETURNING id INTO v_sale_id;
    
    -- Procesar cada item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_sale_items)
    LOOP
        -- Obtener información del producto
        SELECT * INTO v_product
        FROM products 
        WHERE id = (v_item->>'product_id')::UUID;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto no encontrado: %', v_item->>'product_id';
        END IF;
        
        -- Verificar stock suficiente
        IF v_product.stock < (v_item->>'quantity')::DECIMAL THEN
            RAISE EXCEPTION 'Stock insuficiente para %: disponible %, solicitado %', 
                v_product.name, v_product.stock, (v_item->>'quantity')::DECIMAL;
        END IF;
        
        -- Insertar item de venta
        INSERT INTO sale_items (
            sale_id, product_id, product_name, product_code, product_unit,
            quantity, unit_price, unit_cost, total_price, total_cost, profit
        ) VALUES (
            v_sale_id,
            v_product.id,
            v_product.name,
            v_product.code,
            v_product.unit,
            (v_item->>'quantity')::DECIMAL,
            v_product.selling_price,
            v_product.purchase_price,
            (v_item->>'quantity')::DECIMAL * v_product.selling_price,
            (v_item->>'quantity')::DECIMAL * v_product.purchase_price,
            (v_item->>'quantity')::DECIMAL * (v_product.selling_price - v_product.purchase_price)
        );
        
        -- Registrar movimiento de stock
        PERFORM register_stock_movement(
            v_product.id,
            'sale',
            (v_item->>'quantity')::DECIMAL,
            v_sale_id,
            'sale',
            'Venta: ' || (SELECT sale_number FROM sales WHERE id = v_sale_id),
            p_user_id
        );
        
        -- Acumular totales
        v_total_amount := v_total_amount + ((v_item->>'quantity')::DECIMAL * v_product.selling_price);
        v_total_cost := v_total_cost + ((v_item->>'quantity')::DECIMAL * v_product.purchase_price);
        v_total_profit := v_total_profit + ((v_item->>'quantity')::DECIMAL * (v_product.selling_price - v_product.purchase_price));
    END LOOP;
    
    -- Actualizar totales de la venta
    UPDATE sales 
    SET total_amount = v_total_amount,
        total_cost = v_total_cost,
        total_profit = v_total_profit
    WHERE id = v_sale_id;
    
    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para crear un producto fraccionado
CREATE OR REPLACE FUNCTION create_fractioned_product(
    p_original_product_id UUID,
    p_extract_quantity DECIMAL(10,3),
    p_extract_unit VARCHAR(50),
    p_fraction_name VARCHAR(255) DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_original_product RECORD;
    v_fraction_id UUID;
    v_fraction_name VARCHAR(255);
    v_fraction_code VARCHAR(100);
    v_fraction_purchase_price DECIMAL(10,2);
    v_fraction_selling_price DECIMAL(10,2);
BEGIN
    -- Obtener producto original
    SELECT * INTO v_original_product
    FROM products 
    WHERE id = p_original_product_id AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto original no encontrado';
    END IF;
    
    -- Verificar stock suficiente (simplificado - en producción calcular conversiones)
    IF v_original_product.stock < p_extract_quantity THEN
        RAISE EXCEPTION 'Stock insuficiente para fraccionar';
    END IF;
    
    -- Generar nombre y código si no se proporcionó
    v_fraction_name := COALESCE(p_fraction_name, v_original_product.name || ' - ' || p_extract_quantity || p_extract_unit);
    v_fraction_code := v_original_product.code || '-E' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::INTEGER;
    
    -- Calcular precios proporcionales (simplificado)
    v_fraction_purchase_price := v_original_product.purchase_price * p_extract_quantity;
    v_fraction_selling_price := v_original_product.selling_price * p_extract_quantity;
    
    -- Crear producto fraccionado
    INSERT INTO products (
        name, code, brand_id, category_id, stock, min_stock,
        purchase_price, selling_price, unit, measurement_type,
        is_fractioned, original_product_id, extracted_from
    ) VALUES (
        v_fraction_name,
        v_fraction_code,
        v_original_product.brand_id,
        v_original_product.category_id,
        p_extract_quantity,
        0.1,
        v_fraction_purchase_price,
        v_fraction_selling_price,
        p_extract_unit,
        v_original_product.measurement_type,
        true,
        p_original_product_id,
        v_original_product.name || ' (' || v_original_product.stock || ' ' || v_original_product.unit || ')'
    ) RETURNING id INTO v_fraction_id;
    
    -- Registrar movimiento de stock del producto original
    PERFORM register_stock_movement(
        p_original_product_id,
        'fraction',
        p_extract_quantity,
        v_fraction_id,
        'fraction',
        'Fraccionado a: ' || v_fraction_name,
        p_user_id
    );
    
    -- Registrar historial de precios del producto fraccionado
    INSERT INTO price_history (product_id, purchase_price, selling_price)
    VALUES (v_fraction_id, v_fraction_purchase_price, v_fraction_selling_price);
    
    RETURN v_fraction_id;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para cierre de caja
CREATE OR REPLACE FUNCTION close_daily_cash(
    p_closure_date DATE,
    p_user_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_closure_id UUID;
    v_stats RECORD;
    v_product_summary RECORD;
BEGIN
    -- Verificar que no exista ya un cierre para esta fecha
    IF EXISTS (SELECT 1 FROM cash_closures WHERE closure_date = p_closure_date) THEN
        RAISE EXCEPTION 'Ya existe un cierre de caja para la fecha %', p_closure_date;
    END IF;
    
    -- Obtener estadísticas del día
    SELECT 
        COALESCE(COUNT(s.id), 0) as transactions_count,
        COALESCE(SUM(s.total_amount), 0) as total_sales,
        COALESCE(SUM(s.total_cost), 0) as total_costs,
        COALESCE(SUM(s.total_profit), 0) as total_profit,
        COALESCE(SUM(si.quantity), 0) as total_items_sold
    INTO v_stats
    FROM sales s
    LEFT JOIN sale_items si ON s.id = si.sale_id
    WHERE DATE(s.created_at) = p_closure_date;
    
    -- Crear cierre de caja
    INSERT INTO cash_closures (
        closure_date, total_sales, total_costs, total_profit,
        transactions_count, total_items_sold, closed_by, notes
    ) VALUES (
        p_closure_date, v_stats.total_sales, v_stats.total_costs, v_stats.total_profit,
        v_stats.transactions_count, v_stats.total_items_sold, p_user_id, p_notes
    ) RETURNING id INTO v_closure_id;
    
    -- Crear resumen de productos vendidos
    FOR v_product_summary IN
        SELECT 
            si.product_name,
            si.product_unit,
            SUM(si.quantity) as quantity_sold,
            SUM(si.total_price) as total_revenue,
            SUM(si.profit) as total_profit
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE DATE(s.created_at) = p_closure_date
        GROUP BY si.product_name, si.product_unit
    LOOP
        INSERT INTO closure_product_summary (
            closure_id, product_name, product_unit,
            quantity_sold, total_revenue, total_profit
        ) VALUES (
            v_closure_id, v_product_summary.product_name, v_product_summary.product_unit,
            v_product_summary.quantity_sold, v_product_summary.total_revenue, v_product_summary.total_profit
        );
    END LOOP;
    
    RETURN v_closure_id;
END;
$$ LANGUAGE plpgsql;
