# 📦 Guia de Importação em Massa - Produtos Supabase

## ⚠️ Importante: Variáveis de Ambiente

Para realizar importações em massa que bypass o Row Level Security (RLS), você precisa usar a **Service Role Key** do Supabase.

### 1. Obter a Service Role Key

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a **`service_role` key** (⚠️ NUNCA exponha essa chave publicamente)

### 2. Configurar no arquivo .env.local

Adicione a seguinte variável ao seu arquivo `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_aqui
```

### 3. Executar a importação

```bash
pnpm run import:products
```

## 🔒 Segurança

- ⚠️ A Service Role Key **bypassa todas as políticas RLS** e tem acesso total ao banco
- ✅ Use apenas em scripts de importação local
- ❌ NUNCA commite essa chave no Git
- ❌ NUNCA exponha essa chave no frontend ou client-side
- ✅ Use o `.env.local` que está no `.gitignore`

## 📋 O que o script faz

1. ✅ Lê o arquivo CSV `docs/produtos-importacao-massa (1).csv`
2. ✅ Mapeia categorias e unidades existentes
3. ✅ Cria automaticamente categorias e unidades que não existem
4. ✅ Importa produtos em lotes de 100
5. ✅ Fornece feedback detalhado do processo

## 🚨 Resolução de Problemas

### Erro: "new row violates row-level security policy"

**Causa**: A Service Role Key não está configurada ou não está sendo usada.

**Solução**: 
1. Verifique se `SUPABASE_SERVICE_ROLE_KEY` está no `.env.local`
2. Reinicie o terminal após adicionar a variável
3. Execute o script novamente

### Erro: "Categoria não encontrada"

**Causa**: As categorias mencionadas no CSV não existem no banco.

**Solução**: O script tenta criar automaticamente. Se falhar, verifique:
1. Se a Service Role Key está configurada (necessária para criar)
2. As políticas RLS da tabela `categories`

## 📝 Exemplo de execução bem-sucedida

```
📄 Lendo arquivo CSV...
✅ 64 produtos encontrados no CSV

🔍 Mapeando categorias e unidades...
  ✅ Categoria criada: "Limpeza - Sabão e Detergente" -> abc-123-...
  ✅ Categoria criada: "Açúcar e Doces" -> def-456-...
  ✓ un -> d239ed77-4d8d-49f7-8845-696219ce660a

📦 Preparando produtos para importação...

🚀 Inserindo 64 produtos no Supabase...
✅ Lote 1: 64 produtos importados

==================================================
✅ Importação concluída!
   Importados: 64
   Falhas: 0
==================================================
```


