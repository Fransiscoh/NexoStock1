-- Vista para productos con información completa
CREATE VIEW v_products_full AS
SELECT 
    p.id,
    p.name,
    p.code,
    b.name as brand_name,
    c.name as category_name,
    p.stock,
    p.min_stock,
    p.purchase_price,
    p.selling_price,
    calculate_profit_margin(p.purchase_price, p.selling_price) as profit_margin,
    p.unit,
    p.measurement_type,
    p.is_fractioned,
    p.is_mix,
    p.extracted_from,
    CASE 
        WHEN p.stock <= p.min_stock THEN 'low'
        WHEN p.stock <= p.min_stock * 2 THEN 'medium'
        ELSE 'good'
    END as stock_status,
    p.created_at,
    p.updated_at,
    p.is_active
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- Vista para ventas con detalles
CREATE VIEW v_sales_summary AS
SELECT 
    s.id,
    s.sale_number,
    s.total_amount,
    s.total_cost,
    s.total_profit,
    u.name as seller_name,
    COUNT(si.id) as items_count,
    SUM(si.quantity) as total_items_quantity,
    s.created_at,
    s.notes
FROM sales s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN sale_items si ON s.id = si.sale_id
GROUP BY s.id, s.sale_number, s.total_amount, s.total_cost, s.total_profit, u.name, s.created_at, s.notes
ORDER BY s.created_at DESC;

-- Vista para estadísticas diarias
CREATE VIEW v_daily_stats AS
SELECT 
    DATE(s.created_at) as sale_date,
    COUNT(s.id) as transactions_count,
    SUM(s.total_amount) as total_sales,
    SUM(s.total_cost) as total_costs,
    SUM(s.total_profit) as total_profit,
    SUM(si.quantity) as total_items_sold
FROM sales s
LEFT JOIN sale_items si ON s.id = si.sale_id
GROUP BY DATE(s.created_at)
ORDER BY sale_date DESC;

-- Vista para productos más vendidos
CREATE VIEW v_top_selling_products AS
SELECT 
    p.name as product_name,
    p.code as product_code,
    SUM(si.quantity) as total_sold,
    SUM(si.total_price) as total_revenue,
    SUM(si.profit) as total_profit,
    COUNT(DISTINCT si.sale_id) as sales_count,
    AVG(si.unit_price) as avg_selling_price
FROM sale_items si
JOIN products p ON si.product_id = p.id
GROUP BY p.id, p.name, p.code
ORDER BY total_sold DESC;

-- Vista para movimientos de stock recientes
CREATE VIEW v_recent_stock_movements AS
SELECT 
    sm.id,
    p.name as product_name,
    p.code as product_code,
    sm.movement_type,
    sm.quantity,
    sm.previous_stock,
    sm.new_stock,
    sm.reference_type,
    sm.notes,
    u.name as user_name,
    sm.created_at
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
LEFT JOIN users u ON sm.user_id = u.id
ORDER BY sm.created_at DESC;
