# Configuração do MCP Supabase por Projeto

Este guia explica como configurar o MCP (Model Context Protocol) do Supabase para usar as credenciais específicas de cada projeto.

## 📋 Situação Atual

- **Projeto Sacolão**: `xfokngpiyqysnsxlrsir.supabase.co`
- **Credenciais**: Configuradas no `.env.local`

## 🔧 Como Configurar o MCP por Projeto

O MCP do Supabase no Cursor precisa ser configurado para ler as variáveis de ambiente do workspace atual. Atualmente, ele está usando uma configuração global que aponta para outro projeto.

### Opção 1: Configuração via Settings do Cursor (Recomendado)

1. Abra as **Configurações do Cursor** (Cmd/Ctrl + ,)
2. Procure por **"MCP"** ou **"Model Context Protocol"**
3. Localize a configuração do servidor **Supabase**
4. Configure para usar variáveis de ambiente do workspace:
   - `SUPABASE_URL`: deve ler de `NEXT_PUBLIC_SUPABASE_URL` do `.env.local`
   - `SUPABASE_API_KEY`: deve ler de `SUPABASE_SERVICE_ROLE_KEY` do `.env.local`

### Opção 2: Arquivo de Configuração Local

Crie um arquivo `.cursor/mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://xfokngpiyqysnsxlrsir.supabase.co",
        "SUPABASE_API_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

**Nota**: Esta opção pode não funcionar se o Cursor não suportar referências a variáveis de ambiente locais neste formato.

### Opção 3: Configuração Manual por Projeto

1. Identifique onde o Cursor armazena a configuração global do MCP
2. Configure manualmente as credenciais específicas deste projeto
3. Certifique-se de que cada workspace/projeto tenha sua própria configuração

## ✅ Verificação

Após configurar, você pode verificar se está conectado ao projeto correto executando:

- `mcp_supabase_get_project_url` - deve retornar `https://xfokngpiyqysnsxlrsir.supabase.co`
- `mcp_supabase_list_tables` - deve mostrar as tabelas do Sacolão:
  - `products`
  - `categories`
  - `units`
  - `orders`
  - `baskets`
  - `customers`
  - etc.

## 📝 Nota Importante

O arquivo `.env.local` já contém as credenciais corretas:
- `NEXT_PUBLIC_SUPABASE_URL=https://xfokngpiyqysnsxlrsir.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`

O problema é que o MCP do Cursor precisa ser configurado para usar essas variáveis deste workspace específico, não uma configuração global.

## 🔍 Referências

- [Documentação do MCP](https://modelcontextprotocol.io/)
- [Documentação do Supabase MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/supabase)
