-- Crear roles
CREATE ROLE stock_admin;
CREATE ROLE stock_user;
CREATE ROLE stock_readonly;

-- Permisos para administradores
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO stock_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO stock_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO stock_admin;

-- Permisos para usuarios normales
GRANT SELECT, INSERT, UPDATE ON users, brands, categories, products, price_history TO stock_user;
GRANT SELECT, INSERT, UPDATE ON mix_components, sales, sale_items, stock_movements TO stock_user;
GRANT SELECT, INSERT ON cash_closures, closure_product_summary TO stock_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO stock_user;
GRANT EXECUTE ON FUNCTION process_sale, create_fractioned_product, close_daily_cash TO stock_user;
GRANT EXECUTE ON FUNCTION register_stock_movement, get_product_sales_stats TO stock_user;

-- Permisos para solo lectura
GRANT SELECT ON ALL TABLES IN SCHEMA public TO stock_readonly;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO stock_readonly;

-- Crear usuarios de ejemplo (cambiar contraseñas en producción)
-- CREATE USER stock_admin_user WITH PASSWORD 'admin_password_2024';
-- CREATE USER stock_regular_user WITH PASSWORD 'user_password_2024';
-- CREATE USER stock_report_user WITH PASSWORD 'readonly_password_2024';

-- GRANT stock_admin TO stock_admin_user;
-- GRANT stock_user TO stock_regular_user;
-- GRANT stock_readonly TO stock_report_user;
