-- Script SQL para inserir produtos de exemplo no banco de dados
-- Execute este script no SQL Editor do Supabase para popular o catálogo

-- Buscar IDs das categorias e unidades
DO $$
DECLARE
  cat_frutas UUID;
  cat_verduras UUID;
  cat_legumes UUID;
  cat_graos UUID;
  cat_ovos UUID;
  
  unit_kg UUID;
  unit_un UUID;
  unit_maco UUID;
  unit_bandeja UUID;
BEGIN
  -- Obter IDs das categorias
  SELECT id INTO cat_frutas FROM categories WHERE name = 'Frutas';
  SELECT id INTO cat_verduras FROM categories WHERE name = 'Verduras';
  SELECT id INTO cat_legumes FROM categories WHERE name = 'Legumes';
  SELECT id INTO cat_graos FROM categories WHERE name = 'Grãos';
  SELECT id INTO cat_ovos FROM categories WHERE name = 'Ovos';
  
  -- Obter IDs das unidades
  SELECT id INTO unit_kg FROM units WHERE name = 'kg';
  SELECT id INTO unit_un FROM units WHERE name = 'un';
  SELECT id INTO unit_maco FROM units WHERE name = 'maço';
  SELECT id INTO unit_bandeja FROM units WHERE name = 'bandeja';
  
  -- Inserir produtos de exemplo
  INSERT INTO products (name, category_id, unit_id, price, is_active) VALUES
    -- Frutas
    ('Banana Nanica', cat_frutas, unit_kg, 6.99, true),
    ('Maçã Argentina', cat_frutas, unit_kg, 9.99, true),
    ('Laranja Pera', cat_frutas, unit_kg, 5.49, true),
    ('Mamão Papaya', cat_frutas, unit_kg, 7.99, true),
    ('Melancia', cat_frutas, unit_kg, 3.99, true),
    ('Abacaxi', cat_frutas, unit_un, 6.50, true),
    ('Manga Tommy', cat_frutas, unit_kg, 8.99, true),
    ('Uva Itália', cat_frutas, unit_kg, 12.99, true),
    ('Morango', cat_frutas, unit_kg, 15.99, true),
    ('Limão Taiti', cat_frutas, unit_kg, 4.99, true),
    
    -- Verduras
    ('Alface Americana', cat_verduras, unit_maco, 3.99, true),
    ('Alface Crespa', cat_verduras, unit_maco, 3.49, true),
    ('Rúcula', cat_verduras, unit_maco, 4.99, true),
    ('Couve', cat_verduras, unit_maco, 2.99, true),
    ('Espinafre', cat_verduras, unit_maco, 4.49, true),
    ('Agrião', cat_verduras, unit_maco, 3.99, true),
    
    -- Legumes
    ('Tomate', cat_legumes, unit_kg, 8.99, true),
    ('Cenoura', cat_legumes, unit_kg, 5.49, true),
    ('Batata Inglesa', cat_legumes, unit_kg, 6.99, true),
    ('Cebola', cat_legumes, unit_kg, 5.99, true),
    ('Abobrinha', cat_legumes, unit_kg, 7.49, true),
    ('Berinjela', cat_legumes, unit_kg, 8.49, true),
    ('Pimentão Verde', cat_legumes, unit_kg, 9.99, true),
    ('Pimentão Vermelho', cat_legumes, unit_kg, 11.99, true),
    ('Batata Doce', cat_legumes, unit_kg, 6.49, true),
    ('Mandioca', cat_legumes, unit_kg, 5.99, true),
    
    -- Grãos
    ('Feijão Carioca', cat_graos, unit_kg, 8.99, true),
    ('Feijão Preto', cat_graos, unit_kg, 9.49, true),
    ('Arroz Branco', cat_graos, unit_kg, 6.99, true),
    
    -- Ovos
    ('Ovos Brancos', cat_ovos, unit_bandeja, 24.90, true),
    ('Ovos Vermelhos', cat_ovos, unit_bandeja, 26.90, true)
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Produtos de exemplo inseridos com sucesso!';
END $$;

