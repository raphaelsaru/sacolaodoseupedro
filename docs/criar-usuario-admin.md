# Como Criar um Usuário Administrador

Siga este passo a passo para criar seu primeiro usuário administrador no sistema.

## Método 1: Via Painel do Supabase (Recomendado)

### 1. Criar o usuário no Authentication

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto "sacolao"
3. Vá para **Authentication** > **Users** no menu lateral
4. Clique no botão **"Add user"** > **"Create new user"**
5. Preencha:
   - **Email**: seu@email.com
   - **Password**: sua_senha_segura
   - Marque **"Auto Confirm User"** (para não precisar confirmar email)
6. Clique em **"Create user"**
7. **Copie o UUID** do usuário criado (você vai precisar dele!)

### 2. Criar o perfil do usuário

1. Ainda no Supabase, vá para **Database** > **Table Editor**
2. Selecione a tabela **"profiles"**
3. Clique em **"Insert row"**
4. Preencha os campos:
   - **id**: Cole o UUID do usuário que você copiou (importante!)
   - **role**: Selecione **"admin"**
   - **full_name**: Digite seu nome completo
   - **phone**: (opcional) Seu telefone
5. Clique em **"Save"**

Pronto! Agora você pode fazer login no sistema com este email e senha.

---

## Método 2: Via SQL Editor

Se preferir, você pode criar tudo de uma vez usando SQL:

```sql
-- 1. Criar o usuário (substitua os valores)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), -- Gera um UUID automaticamente
  'authenticated',
  'authenticated',
  'seu@email.com', -- ALTERE AQUI
  crypt('sua_senha_segura', gen_salt('bf')), -- ALTERE AQUI
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  NULL,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
)
RETURNING id;

-- 2. Depois de executar acima, copie o ID retornado e use aqui:
INSERT INTO profiles (id, role, full_name, phone)
VALUES (
  'UUID_RETORNADO_ACIMA', -- COLE O UUID AQUI
  'admin',
  'Seu Nome Completo', -- ALTERE AQUI
  '(61) 99999-9999' -- OPCIONAL
);
```

**Nota**: Este método é mais complexo e requer conhecimento de SQL. Use o Método 1 se tiver dúvidas.

---

## Testando o Login

1. Acesse `http://localhost:3000/login` (ou seu domínio em produção)
2. Digite o email e senha criados
3. Você será redirecionado para `/app` (dashboard admin)

## Troubleshooting

### "Usuário não encontrado" ou "Credenciais inválidas"
- Verifique se o email está correto
- Confirme que o usuário foi criado no Authentication
- Tente fazer logout e login novamente

### "Acesso negado" após login
- Verifique se o perfil foi criado na tabela `profiles`
- Confirme que o `id` do perfil é exatamente o mesmo UUID do usuário
- Verifique se o `role` está definido como 'admin'

### Esqueci a senha
1. Vá no Authentication > Users
2. Encontre o usuário
3. Clique nos três pontos > "Reset password"
4. Defina uma nova senha

---

## Próximos Passos

Após criar seu usuário admin, você pode:

1. **Adicionar produtos** em `/app/produtos`
2. **Criar cestas** em `/app/cestas`
3. **Cadastrar clientes** em `/app/clientes`
4. **Gerenciar pedidos** em `/app/pedidos`

Para adicionar mais usuários administradores, repita este processo!

