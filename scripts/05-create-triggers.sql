-- Triggers para actualizar timestamps automáticamente

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at 
    BEFORE UPDATE ON brands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para generar número de venta automáticamente
CREATE OR REPLACE FUNCTION set_sale_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sale_number IS NULL OR NEW.sale_number = '' THEN
        NEW.sale_number := generate_sale_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sale_number_trigger
    BEFORE INSERT ON sales
    FOR EACH ROW EXECUTE FUNCTION set_sale_number();

-- Trigger para registrar historial de precios
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si los precios cambiaron
    IF OLD.purchase_price != NEW.purchase_price OR OLD.selling_price != NEW.selling_price THEN
        INSERT INTO price_history (
            product_id, purchase_price, selling_price, 
            previous_purchase_price, previous_selling_price
        ) VALUES (
            NEW.id, NEW.purchase_price, NEW.selling_price,
            OLD.purchase_price, OLD.selling_price
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_price_change_trigger
    AFTER UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION log_price_change();
