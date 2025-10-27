# 📊 Planilha de Importação em Massa - Produtos

## 📁 Arquivo Criado
- **Localização**: `docs/produtos-importacao-massa.csv`
- **Formato**: CSV (Comma Separated Values)
- **Produtos incluídos**: 60+ produtos para mini mercado de bairro

## 📋 Estrutura da Planilha

### Colunas Obrigatórias:
- **name**: Nome do produto (texto)
- **category_id**: ID da categoria (texto - será convertido para UUID)
- **unit_id**: ID da unidade de medida (texto - será convertido para UUID)
- **price**: Preço de venda (decimal com ponto)
- **cost**: Custo do produto (decimal com ponto)
- **quantity**: Quantidade em estoque (decimal com ponto)
- **sku**: Código do produto (opcional, pode ficar vazio)
- **image_url**: URL da imagem (opcional, pode ficar vazio)
- **is_active**: Produto ativo (true/false)

## 🏷️ Categorias Incluídas

| Categoria | Descrição |
|-----------|-----------|
| Frutas | Banana, Maçã, Laranja, Mamão, etc. |
| Verduras | Alface, Rúcula, Couve, Espinafre, etc. |
| Legumes | Tomate, Cenoura, Batata, Cebola, etc. |
| Grãos | Feijão, Arroz, Lentilha, Grão de Bico |
| Ovos | Ovos brancos e vermelhos |
| Laticínios | Leite, Queijo, Requeijão, Iogurte |
| Pães | Pão de açúcar, francês, integral, biscoitos |
| Açúcar e Doces | Açúcar cristal e refinado |
| Café e Chás | Café torrado, solúvel, chás |
| Óleos e Gorduras | Óleo de soja, azeite de oliva |
| Temperos | Vinagre, sal, pimenta, alho, gengibre |

## 📏 Unidades de Medida

| Unidade | Descrição | Exemplo |
|---------|-----------|---------|
| kg | Quilograma | Frutas, legumes vendidos por peso |
| un | Unidade | Abacaxi, ovos, produtos individuais |
| maço | Maço | Verduras como alface, rúcula |
| bandeja | Bandeja | Ovos em bandejas |
| l | Litro | Leite, óleos, líquidos |

## 🖼️ Sobre as Imagens

### URLs Incluídas:
- Todas as imagens usam URLs do Unsplash (serviço gratuito)
- Formato: `https://images.unsplash.com/photo-[ID]?w=400&h=400&fit=crop`
- Tamanho: 400x400 pixels, otimizado para web

### Como Personalizar as Imagens:

#### Opção 1: Usar suas próprias imagens
1. Faça upload das imagens para o Supabase Storage
2. Substitua as URLs na coluna `image_url` pelas URLs do Supabase
3. Formato: `https://[seu-projeto].supabase.co/storage/v1/object/public/[bucket]/[caminho]`

#### Opção 2: Usar outras URLs de imagens
- Substitua as URLs do Unsplash por outras URLs válidas
- Certifique-se de que as imagens sejam públicas e acessíveis

#### Opção 3: Deixar sem imagem
- Deixe a coluna `image_url` vazia
- O sistema mostrará uma imagem padrão

## 💰 Preços e Custos

### Estrutura de Preços:
- **Preço**: Preço de venda ao cliente
- **Custo**: Custo de aquisição (para controle de margem)
- **Margem**: Calculada automaticamente pelo sistema

### Exemplos de Margem:
- Banana: R$ 6,99 (venda) - R$ 4,50 (custo) = 35% margem
- Maçã: R$ 9,99 (venda) - R$ 6,50 (custo) = 35% margem

## 📦 Estoque Inicial

### Quantidades Sugeridas:
- **Produtos perecíveis**: 15-50 unidades
- **Produtos não perecíveis**: 50-150 unidades
- **Produtos de alta rotatividade**: Quantidades maiores

## 🔧 Como Usar a Planilha

### 1. Preparação no Supabase:
```sql
-- Primeiro, certifique-se de que as categorias existem
INSERT INTO categories (name, position) VALUES
('Frutas', 1),
('Verduras', 2),
('Legumes', 3),
('Grãos', 4),
('Ovos', 5),
('Laticínios', 6),
('Pães', 7),
('Açúcar e Doces', 8),
('Café e Chás', 9),
('Óleos e Gorduras', 10),
('Temperos', 11)
ON CONFLICT (name) DO NOTHING;

-- Depois, certifique-se de que as unidades existem
INSERT INTO units (name, step) VALUES
('kg', 0.1),
('un', 1),
('maço', 1),
('bandeja', 1),
('l', 0.1)
ON CONFLICT (name) DO NOTHING;
```

### 2. Importação via Google Sheets:
1. Abra o Google Sheets
2. Vá em Arquivo > Importar
3. Selecione o arquivo `produtos-importacao-massa.csv`
4. Escolha "Substituir planilha atual"
5. Clique em "Importar dados"

### 3. Conversão para Importação no Supabase:
1. No Google Sheets, adicione uma coluna "category_uuid"
2. Use a fórmula: `=VLOOKUP(B2,{"Frutas";"Verduras";"Legumes";"Grãos";"Ovos";"Laticínios";"Pães";"Açúcar e Doces";"Café e Chás";"Óleos e Gorduras";"Temperos"},{"uuid-da-categoria-frutas";"uuid-da-categoria-verduras";...},2)`
3. Faça o mesmo para "unit_uuid"
4. Exporte como CSV
5. Use o Supabase Dashboard para importar

## ⚠️ Observações Importantes

### Campos Obrigatórios:
- ✅ **name**: Sempre preenchido
- ✅ **price**: Sempre preenchido (formato decimal com ponto)
- ✅ **cost**: Sempre preenchido (formato decimal com ponto)
- ✅ **quantity**: Sempre preenchido (formato decimal com ponto)
- ✅ **is_active**: Sempre preenchido (true/false)

### Campos Opcionais:
- ⚪ **sku**: Pode ficar vazio
- ⚪ **image_url**: Pode ficar vazio

### Validações:
- Preços e custos devem usar ponto como separador decimal
- Quantidades devem usar ponto como separador decimal
- URLs de imagem devem ser válidas e acessíveis
- Categorias e unidades devem existir no banco de dados

## 🚀 Próximos Passos

1. **Revisar os dados**: Verifique se os preços e quantidades estão corretos
2. **Personalizar imagens**: Substitua as URLs pelas suas próprias imagens
3. **Ajustar estoque**: Modifique as quantidades conforme sua necessidade
4. **Testar importação**: Faça um teste com poucos produtos primeiro
5. **Importar em massa**: Após validar, importe todos os produtos

## 📞 Suporte

Se tiver dúvidas sobre a importação ou precisar de ajuda com algum campo específico, consulte a documentação do Supabase ou entre em contato para suporte técnico.


