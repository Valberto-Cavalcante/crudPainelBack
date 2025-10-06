# Sistema de Migrations - AprovacaoEAD

Este documento descreve como usar o sistema de migrations implementado para o backend do sistema AprovacaoEAD.

## 📋 Visão Geral

O sistema de migrations permite:
- **Versionar o banco de dados**: Controlar mudanças no schema de forma organizada
- **Deploy consistente**: Garantir que todos os ambientes tenham a mesma estrutura
- **Rollback seguro**: Reverter mudanças quando necessário
- **Colaboração em equipe**: Todos os desenvolvedores podem aplicar as mesmas mudanças

## 🚀 Comandos Disponíveis

### Executar Migrations
```bash
# Executar todas as migrations pendentes
npm run migrate:run
# ou
node migrate.js run
```

### Verificar Status
```bash
# Mostrar status de todas as migrations
npm run migrate:status
# ou
node migrate.js status
```

### Criar Nova Migration
```bash
# Criar uma nova migration
npm run migrate:create nome_da_migration
# ou
node migrate.js create nome_da_migration
```

### Fazer Rollback
```bash
# Fazer rollback de uma migration específica
npm run migrate:rollback nome_da_migration.js
# ou
node migrate.js rollback nome_da_migration.js
```

### Ajuda
```bash
# Mostrar ajuda completa
node migrate.js help
```

## 📁 Estrutura de Arquivos

```
back_EDU/
├── migrations/
│   ├── migration-runner.js      # Sistema principal de migrations
│   ├── 001_create_initial_collections.js
│   ├── 002_create_default_perfis.js
│   ├── 003_create_admin_user.js
│   └── 004_add_missing_user_fields.js
├── migrate.js                   # CLI para executar migrations
└── MIGRATIONS.md               # Esta documentação
```

## 🔧 Como Funciona

### 1. Sistema de Versionamento
- Cada migration é um arquivo JavaScript com timestamp
- As migrations são executadas em ordem alfabética
- O sistema mantém registro de migrations executadas na coleção `migrations`

### 2. Estrutura de uma Migration
```javascript
module.exports = {
    // Método executado ao aplicar a migration
    async up(db) {
        // Lógica para aplicar a migration
    },

    // Método executado ao fazer rollback
    async down(db) {
        // Lógica para reverter a migration
    }
};
```

### 3. Ordem de Execução
As migrations são executadas na seguinte ordem:
1. `001_create_initial_collections.js` - Cria coleções e índices
2. `002_create_default_perfis.js` - Cria perfis padrão
3. `003_create_admin_user.js` - Cria usuário administrador
4. `004_add_missing_user_fields.js` - Adiciona campos faltantes

## 📊 Status das Migrations

O comando `status` mostra:
- ✅ **Executada**: Migration já foi aplicada
- ⏳ **Pendente**: Migration ainda não foi executada
- 📅 **Timestamp**: Data/hora de execução

## 🆕 Criando Novas Migrations

### 1. Usar o Comando Automático
```bash
npm run migrate:create adicionar_novo_campo
```

### 2. Editar o Template Gerado
O sistema gera um template com:
- Método `up()` para aplicar mudanças
- Método `down()` para reverter mudanças
- Tratamento de erros
- Logs informativos

### 3. Exemplo de Migration
```javascript
// Migration: Adicionar campo telefone
module.exports = {
    async up(db) {
        try {
            console.log('🔄 Adicionando campo telefone...');
            
            await db.collection('usuarios').updateMany(
                { telefone: { $exists: false } },
                { $set: { telefone: null } }
            );
            
            console.log('✅ Campo telefone adicionado');
        } catch (error) {
            console.error('❌ Erro:', error);
            throw error;
        }
    },

    async down(db) {
        try {
            console.log('🔄 Removendo campo telefone...');
            
            await db.collection('usuarios').updateMany(
                { telefone: { $exists: true } },
                { $unset: { telefone: 1 } }
            );
            
            console.log('✅ Campo telefone removido');
        } catch (error) {
            console.error('❌ Erro:', error);
            throw error;
        }
    }
};
```

## ⚠️ Boas Práticas

### 1. Nomenclatura
- Use nomes descritivos: `add_user_phone_field.js`
- Inclua timestamp automático: `20250127120000_add_user_phone_field.js`

### 2. Idempotência
- Suas migrations devem poder ser executadas múltiplas vezes sem erro
- Sempre verifique se a mudança já foi aplicada

### 3. Rollback
- Sempre implemente o método `down()`
- Teste o rollback antes de fazer deploy

### 4. Logs
- Use logs informativos para acompanhar o progresso
- Inclua detalhes sobre o que está sendo alterado

### 5. Tratamento de Erros
- Sempre use try/catch
- Faça throw do erro para interromper a execução

## 🔍 Troubleshooting

### Migration Falhou
1. Verifique os logs de erro
2. Corrija o problema na migration
3. Execute novamente: `npm run migrate:run`

### Rollback Falhou
1. Verifique se o método `down()` está correto
2. Execute manualmente se necessário
3. Considere restaurar backup do banco

### Migration Duplicada
1. Verifique se já foi executada: `npm run migrate:status`
2. Remova arquivos duplicados se necessário
3. Mantenha apenas uma versão de cada migration

## 🚀 Deploy em Produção

### 1. Backup
```bash
# Sempre faça backup antes de executar migrations
mongodump --db aprovacaoead --out backup_$(date +%Y%m%d_%H%M%S)
```

### 2. Executar Migrations
```bash
# Em ambiente de produção
NODE_ENV=production npm run migrate:run
```

### 3. Verificar Status
```bash
npm run migrate:status
```

### 4. Monitorar Logs
- Acompanhe os logs durante a execução
- Verifique se todas as migrations foram aplicadas

## 📚 Migrations Existentes

### 001_create_initial_collections.js
- **Objetivo**: Criar coleções principais e índices
- **Coleções**: usuarios, perfis, menus, instituicoes, series, turmas, etc.
- **Índices**: Performance e unicidade

### 002_create_default_perfis.js
- **Objetivo**: Criar perfis padrão do sistema
- **Perfis**: Administrador, Coordenador, Professor, Aluno, Secretário
- **Permissões**: Definição básica de acesso

### 003_create_admin_user.js
- **Objetivo**: Criar usuário administrador padrão
- **Credenciais**: admin@aprovacaoead.com / admin123
- **⚠️ IMPORTANTE**: Alterar senha após primeiro login

### 004_add_missing_user_fields.js
- **Objetivo**: Adicionar campos faltantes ao modelo de usuário
- **Campos**: matricula, ra, dataNascimento, formacao, etc.
- **Compatibilidade**: Atualiza usuários existentes

## 🤝 Contribuição

### Adicionando Novas Migrations
1. Use o comando `create` para gerar template
2. Implemente a lógica nos métodos `up()` e `down()`
3. Teste localmente antes de commitar
4. Documente o propósito da migration

### Modificando Migrations Existentes
- **NUNCA** modifique migrations já executadas em produção
- Crie uma nova migration para corrigir problemas
- Use rollback apenas em desenvolvimento

## 📞 Suporte

Para dúvidas sobre o sistema de migrations:
1. Consulte esta documentação
2. Verifique os logs de execução
3. Teste em ambiente de desenvolvimento
4. Consulte a equipe de desenvolvimento

---

**Última atualização**: 27/01/2025  
**Versão**: 1.0.0  
**Sistema**: AprovacaoEAD Backend 