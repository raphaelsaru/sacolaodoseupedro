# 🔧 Troubleshooting - Upload de Imagens

## ✅ **Configurações Aplicadas:**

### 1. **Bucket Configurado**
- ✅ Bucket `products` criado e configurado
- ✅ Público: `true` (imagens visíveis para todos)
- ✅ Limite de arquivo: 50MB
- ✅ Tipos permitidos: JPEG, PNG, GIF, WebP

### 2. **Políticas de Segurança Criadas**
- ✅ **Leitura pública**: Qualquer um pode ver as imagens
- ✅ **Upload**: Apenas usuários autenticados podem fazer upload
- ✅ **Atualização**: Apenas usuários autenticados podem atualizar
- ✅ **Exclusão**: Apenas usuários autenticados podem excluir

### 3. **Código Melhorado**
- ✅ Mensagens de erro mais detalhadas
- ✅ Logs no console para debug
- ✅ Tratamento de erros específicos

---

## 🧪 **Como Testar Agora:**

### **Passo 1: Verificar Login**
1. Acesse `/login`
2. Faça login com seu usuário admin
3. Confirme que está logado (deve ir para `/app`)

### **Passo 2: Testar Upload**
1. Vá para `/app/produtos/novo`
2. Preencha:
   - **Nome**: Teste de Imagem
   - **Unidade**: Selecione qualquer uma
   - **Preço**: 10.00
3. **Selecione uma imagem** (JPG, PNG ou GIF)
4. Clique em "Criar"

### **Passo 3: Verificar Resultado**
- ✅ **Sucesso**: Produto criado com imagem
- ❌ **Erro**: Verifique a mensagem específica

---

## 🔍 **Se Ainda Der Erro:**

### **Verifique o Console do Navegador:**
1. Abra as **Ferramentas do Desenvolvedor** (F12)
2. Vá na aba **Console**
3. Tente fazer upload novamente
4. Procure por mensagens de erro

### **Verifique o Terminal:**
1. No terminal onde o `pnpm dev` está rodando
2. Procure por mensagens de erro após tentar o upload

### **Possíveis Problemas:**

#### **1. Usuário não autenticado**
```
Erro: "new row violates row-level security policy"
```
**Solução**: Certifique-se de estar logado como admin

#### **2. Tipo de arquivo não permitido**
```
Erro: "File type not allowed"
```
**Solução**: Use apenas JPG, PNG, GIF ou WebP

#### **3. Arquivo muito grande**
```
Erro: "File too large"
```
**Solução**: Use imagens menores que 50MB

#### **4. Problema de permissão**
```
Erro: "Permission denied"
```
**Solução**: As políticas foram criadas, mas pode precisar de alguns minutos para propagar

---

## 🚀 **Teste Rápido:**

Execute este comando no terminal para verificar se o bucket está funcionando:

```bash
# No terminal do projeto
curl -X GET "https://xfokngpiyqysnsxlrsir.supabase.co/storage/v1/buckets/products" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmb2tuZ3BpeXF5c25zeGxyc2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzc2NTcsImV4cCI6MjA3NjkxMzY1N30.SEuQl0EWqLDi_A180cIfIPcSZKvALJlEbhfzAdr9CwY"
```

Se retornar informações do bucket, está funcionando!

---

## 📞 **Se Nada Funcionar:**

1. **Me envie a mensagem de erro exata** que aparece
2. **Me diga qual navegador** está usando
3. **Me confirme se está logado** como admin

Com essas informações, posso ajudar a resolver o problema específico! 😊

