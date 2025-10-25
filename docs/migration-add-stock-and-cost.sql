-- Adicionar campos de estoque (quantity) e custo (cost) na tabela products
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE products
ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2) DEFAULT 0 NOT NULL;

-- Adicionar comentários nas colunas
COMMENT ON COLUMN products.quantity IS 'Quantidade atual em estoque';
COMMENT ON COLUMN products.cost IS 'Custo do produto (para controle interno)';

-- Opcional: Criar índice para facilitar consultas de produtos sem estoque
CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity) WHERE quantity <= 0;

