-- Create categories
INSERT INTO categories (id, name, "nameEn", description, "isActive") VALUES
('cat1', 'เสื้อยืด', 'T-Shirts', 'เสื้อยืดแฟชั่น', true),
('cat2', 'เสื้อแจ็คเก็ต', 'Jackets', 'เสื้อแจ็คเก็ตและเสื้อคลุม', true),
('cat3', 'เดรส', 'Dresses', 'เดรสและชุดเดรส', true),
('cat4', 'กางเกงยีนส์', 'Jeans', 'กางเกงยีนส์ทุกสไตล์', true),
('cat5', 'เสื้อสเวตเตอร์', 'Sweaters', 'เสื้อสเวตเตอร์และเสื้อไหมพรม', true),
('cat6', 'กระโปรง', 'Skirts', 'กระโปรงแฟชั่น', true);

-- Create brands
INSERT INTO brands (id, name, description, "isActive") VALUES
('brand1', 'Urban Style', 'แบรนด์เสื้อผ้าสไตล์เมือง', true),
('brand2', 'Classic Denim', 'ผู้เชี่ยวชาญด้านเดนิม', true),
('brand3', 'Bloom Fashion', 'แฟชั่นสำหรับผู้หญิงสมัยใหม่', true),
('brand4', 'Denim Co.', 'บริษัทกางเกงยีนส์คุณภาพ', true),
('brand5', 'Cozy Knits', 'เสื้อไหมพรมและเสื้อกันหนาว', true),
('brand6', 'Trendy Girl', 'แฟชั่นสำหรับสาวทันสมัย', true);

-- Create products
INSERT INTO products (id, name, description, price, "originalPrice", sku, "imageUrl", "isActive", "isNew", "isSale", stock, sizes, colors, "categoryId", "brandId") VALUES
('prod1', 'Oversized Cotton T-Shirt', 'เสื้อยืดคอตตอนแบบ oversized สวมใส่สบาย', 890.00, 1200.00, 'TS001', '/placeholder.svg?height=300&width=250', true, true, false, 50, ARRAY['S', 'M', 'L', 'XL'], ARRAY['White', 'Black', 'Gray'], 'cat1', 'brand1'),

('prod2', 'Denim Jacket Vintage', 'เสื้อแจ็คเก็ตยีนส์สไตล์วินเทจ', 2490.00, null, 'JK001', '/placeholder.svg?height=300&width=250', true, false, true, 30, ARRAY['S', 'M', 'L'], ARRAY['Blue', 'Light Blue'], 'cat2', 'brand2'),

('prod3', 'Floral Summer Dress', 'เดรสลายดอกไม้สำหรับฤดูร้อน', 1590.00, 1890.00, 'DR001', '/placeholder.svg?height=300&width=250', true, true, false, 25, ARRAY['XS', 'S', 'M', 'L'], ARRAY['Pink', 'Blue', 'Yellow'], 'cat3', 'brand3'),

('prod4', 'Skinny Jeans Dark Blue', 'กางเกงยีนส์ทรงสกินนี่สีน้ำเงินเข้ม', 1290.00, null, 'JN001', '/placeholder.svg?height=300&width=250', true, false, false, 40, ARRAY['26', '27', '28', '29', '30', '32'], ARRAY['Dark Blue'], 'cat4', 'brand4'),

('prod5', 'Knit Sweater Cream', 'เสื้อสเวตเตอร์ถักสีครีม', 1890.00, null, 'SW001', '/placeholder.svg?height=300&width=250', true, false, false, 20, ARRAY['S', 'M', 'L'], ARRAY['Cream', 'Beige', 'White'], 'cat5', 'brand5'),

('prod6', 'Pleated Mini Skirt', 'กระโปรงสั้นแบบพลีท', 790.00, 990.00, 'SK001', '/placeholder.svg?height=300&width=250', true, false, true, 35, ARRAY['XS', 'S', 'M'], ARRAY['Black', 'Navy', 'Gray'], 'cat6', 'brand6');
