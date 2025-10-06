// Migration: Create Initial Collections
// Data: 2025-01-27
// Descrição: Cria as coleções principais do sistema AprovacaoEAD

module.exports = {
    // Método executado ao aplicar a migration
    async up(db) {
        try {
            console.log('🔄 Criando coleções iniciais do sistema...');
            
            // Lista de coleções que devem existir
            const collections = [
                'usuarios',
                'roles',
                'menus',
                'menuItens',
                'instituicoes',
                'series',
                'turmas',
                'turmaProfessores',
                'vinculos',
                'configuracoes',
                'adminLogs'
            ];
            
            // Verificar coleções existentes
            const existingCollections = await db.listCollections().toArray();
            const existingCollectionNames = existingCollections.map(col => col.name);
            
            // Criar coleções que não existem
            for (const collectionName of collections) {
                if (!existingCollectionNames.includes(collectionName)) {
                    await db.createCollection(collectionName);
                    console.log(`✅ Coleção '${collectionName}' criada`);
                } else {
                    console.log(`ℹ️  Coleção '${collectionName}' já existe`);
                }
            }
            
            // Criar índices importantes para performance
            console.log('🔄 Criando índices...');
            
            // Índices para usuários
            await db.collection('usuarios').createIndex({ email: 1 }, { unique: true });
            await db.collection('usuarios').createIndex({ userName: 1 }, { unique: true });
            await db.collection('usuarios').createIndex({ id: 1 }, { unique: true });
            
            // Índices para roles
            await db.collection('roles').createIndex({ id: 1 }, { unique: true });
            await db.collection('roles').createIndex({ nome: 1 });
            
            // Índices para menus
            await db.collection('menus').createIndex({ id: 1 }, { unique: true });
            await db.collection('menuItens').createIndex({ id: 1 }, { unique: true });
            await db.collection('menuItens').createIndex({ menuId: 1 });
            
            // Índices para instituições
            await db.collection('instituicoes').createIndex({ id: 1 }, { unique: true });
            await db.collection('instituicoes').createIndex({ nome: 1 });
            
            // Índices para séries
            await db.collection('series').createIndex({ id: 1 }, { unique: true });
            await db.collection('series').createIndex({ instituicaoId: 1 });
            
            // Índices para turmas
            await db.collection('turmas').createIndex({ id: 1 }, { unique: true });
            await db.collection('turmas').createIndex({ serieId: 1 });
            
            // Índices para turma professores
            await db.collection('turmaProfessores').createIndex({ id: 1 }, { unique: true });
            await db.collection('turmaProfessores').createIndex({ turmaId: 1 });
            await db.collection('turmaProfessores').createIndex({ professorId: 1 });
            
            // Índices para vínculos
            await db.collection('vinculos').createIndex({ id: 1 }, { unique: true });
            await db.collection('vinculos').createIndex({ usuarioId: 1 });
            await db.collection('vinculos').createIndex({ instituicaoId: 1 });
            
            // Índices para configurações
            await db.collection('configuracoes').createIndex({ id: 1 }, { unique: true });
            await db.collection('configuracoes').createIndex({ chave: 1 }, { unique: true });
            
            // Índices para logs de admin
            await db.collection('adminLogs').createIndex({ id: 1 }, { unique: true });
            await db.collection('adminLogs').createIndex({ usuarioId: 1 });
            await db.collection('adminLogs').createIndex({ data: -1 });
            
            console.log('✅ Todos os índices criados com sucesso');
            console.log('✅ Migration de criação de coleções aplicada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar coleções:', error);
            throw error;
        }
    },

    // Método executado ao fazer rollback
    async down(db) {
        try {
            console.log('🔄 Revertendo criação de coleções...');
            
            // Lista de coleções para remover
            const collections = [
                'usuarios',
                'roles',
                'menus',
                'menuItens',
                'instituicoes',
                'series',
                'turmas',
                'turmaProfessores',
                'vinculos',
                'configuracoes',
                'adminLogs'
            ];
            
            // Remover coleções (cuidado: isso apaga todos os dados!)
            for (const collectionName of collections) {
                try {
                    await db.collection(collectionName).drop();
                    console.log(`✅ Coleção '${collectionName}' removida`);
                } catch (error) {
                    console.log(`ℹ️  Coleção '${collectionName}' não pôde ser removida:`, error.message);
                }
            }
            
            console.log('✅ Rollback de criação de coleções executado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao fazer rollback:', error);
            throw error;
        }
    }
}; 