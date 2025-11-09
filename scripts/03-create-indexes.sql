-- Índices para mejorar el rendimiento

-- Usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Productos
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_fractioned ON products(is_fractioned);
CREATE INDEX idx_products_mix ON products(is_mix);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_measurement_type ON products(measurement_type);

-- Historial de precios
CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_price_history_date ON price_history(created_at);

-- Componentes de mix
CREATE INDEX idx_mix_components_mix ON mix_components(mix_product_id);
CREATE INDEX idx_mix_components_component ON mix_components(component_product_id);

-- Ventas
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_number ON sales(sale_number);

-- Items de venta
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_sale_items_date ON sale_items(created_at);

-- Movimientos de stock
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_id, reference_type);

-- Cierres de caja
CREATE INDEX idx_cash_closures_date ON cash_closures(closure_date);
CREATE INDEX idx_cash_closures_user ON cash_closures(closed_by);

-- Resumen de productos por cierre
CREATE INDEX idx_closure_summary_closure ON closure_product_summary(closure_id);
