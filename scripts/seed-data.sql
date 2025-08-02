-- Insert categories
INSERT INTO categories (id, name, name_en, description, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'เสื้อยืด', 'T-Shirts', 'เสื้อยืดแฟชั่น', true),
('550e8400-e29b-41d4-a716-446655440002', 'เสื้อแจ็คเก็ต', 'Jackets', 'เสื้อแจ็คเก็ตและเสื้อคลุม', true),
('550e8400-e29b-41d4-a716-446655440003', 'เดรส', 'Dresses', 'เดรสและชุดเดรส', true),
('550e8400-e29b-41d4-a716-446655440004', 'กางเกงยีนส์', 'Jeans', 'กางเกงยีนส์ทุกสไตล์', true),
('550e8400-e29b-41d4-a716-446655440005', 'เสื้อสเวตเตอร์', 'Sweaters', 'เสื้อสเวตเตอร์และเสื้อไหมพรม', true),
('550e8400-e29b-41d4-a716-446655440006', 'กระโปรง', 'Skirts', 'กระโปรงแฟชั่น', true)
ON CONFLICT (name_en) DO NOTHING;

-- Insert brands
INSERT INTO brands (id, name, description, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Urban Style', 'แบรนด์เสื้อผ้าสไตล์เมือง', true),
('660e8400-e29b-41d4-a716-446655440002', 'Classic Denim', 'ผู้เชี่ยวชาญด้านเดนิม', true),
('660e8400-e29b-41d4-a716-446655440003', 'Bloom Fashion', 'แฟชั่นสำหรับผู้หญิงสมัยใหม่', true),
('660e8400-e29b-41d4-a716-446655440004', 'Denim Co.', 'บริษัทกางเกงยีนส์คุณภาพ', true),
('660e8400-e29b-41d4-a716-446655440005', 'Cozy Knits', 'เสื้อไหมพรมและเสื้อกันหนาว', true),
('660e8400-e29b-41d4-a716-446655440006', 'Trendy Girl', 'แฟชั่นสำหรับสาวทันสมัย', true)
ON CONFLICT (name) DO NOTHING;

-- Insert products
INSERT INTO products (id, name, description, price, original_price, sku, image_url, is_active, is_new, is_sale, stock, sizes, colors, category_id, brand_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Oversized Cotton T-Shirt', 'เสื้อยืดคอตตอนแบบ oversized สวมใส่สบาย', 890.00, 1200.00, 'TS001', '/placeholder.svg?height=300&width=250', true, true, false, 50, ARRAY['S', 'M', 'L', 'XL'], ARRAY['White', 'Black', 'Gray'], '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'),

('770e8400-e29b-41d4-a716-446655440002', 'Denim Jacket Vintage', 'เสื้อแจ็คเก็ตยีนส์สไตล์วินเทจ', 2490.00, null, 'JK001', '/placeholder.svg?height=300&width=250', true, false, true, 30, ARRAY['S', 'M', 'L'], ARRAY['Blue', 'Light Blue'], '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002'),

('770e8400-e29b-41d4-a716-446655440003', 'Floral Summer Dress', 'เดรสลายดอกไม้สำหรับฤดูร้อน', 1590.00, 1890.00, 'DR001', '/placeholder.svg?height=300&width=250', true, true, false, 25, ARRAY['XS', 'S', 'M', 'L'], ARRAY['Pink', 'Blue', 'Yellow'], '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003'),

('770e8400-e29b-41d4-a716-446655440004', 'Skinny Jeans Dark Blue', 'กางเกงยีนส์ทรงสกินนี่สีน้ำเงินเข้ม', 1290.00, null, 'JN001', '/placeholder.svg?height=300&width=250', true, false, false, 40, ARRAY['26', '27', '28', '29', '30', '32'], ARRAY['Dark Blue'], '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004'),

('770e8400-e29b-41d4-a716-446655440005', 'Knit Sweater Cream', 'เสื้อสเวตเตอร์ถักสีครีม', 1890.00, null, 'SW001', '/placeholder.svg?height=300&width=250', true, false, false, 20, ARRAY['S', 'M', 'L'], ARRAY['Cream', 'Beige', 'White'], '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005'),

('770e8400-e29b-41d4-a716-446655440006', 'Pleated Mini Skirt', 'กระโปรงสั้นแบบพลีท', 790.00, 990.00, 'SK001', '/placeholder.svg?height=300&width=250', true, false, true, 35, ARRAY['XS', 'S', 'M'], ARRAY['Black', 'Navy', 'Gray'], '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440006')
ON CONFLICT (sku) DO NOTHING;
