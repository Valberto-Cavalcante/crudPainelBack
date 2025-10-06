// Migration: Create Default Roles
// Data: 2025-01-27
// Descrição: Cria os roles padrão do sistema AprovacaoEAD

module.exports = {
    // Método executado ao aplicar a migration
    async up(db) {
        try {
            console.log('🔄 Criando roles padrão do sistema...');
            
            // Verificar se já existem roles
            const existingRoles = await db.collection('roles').find({}).toArray();
            
            if (existingRoles.length > 0) {
                console.log('ℹ️  Roles já existem, pulando criação...');
                return;
            }
            
            // Roles padrão do sistema
            const defaultRoles = [
                {
                    id: 1,
                    nome: 'Administrador',
                    descricao: 'Acesso total ao sistema',
                    permissoes: ['*'],
                    ativo: true,
                    __new: new Date(),
                    __editado: new Date()
                },
                {
                    id: 2,
                    nome: 'Coordenador',
                    descricao: 'Coordenador de curso ou área',
                    permissoes: ['usuarios.read', 'usuarios.update', 'series.*', 'turmas.*', 'vinculos.*'],
                    ativo: true,
                    __new: new Date(),
                    __editado: new Date()
                },
                {
                    id: 3,
                    nome: 'Professor',
                    descricao: 'Professor de disciplina',
                    permissoes: ['turmas.read', 'series.read', 'usuarios.read'],
                    ativo: true,
                    __new: new Date(),
                    __editado: new Date()
                },
                {
                    id: 4,
                    nome: 'Aluno',
                    descricao: 'Estudante do curso',
                    permissoes: ['series.read', 'turmas.read'],
                    ativo: true,
                    __new: new Date(),
                    __editado: new Date()
                },
                {
                    id: 5,
                    nome: 'Secretário',
                    descricao: 'Secretário acadêmico',
                    permissoes: ['usuarios.read', 'usuarios.create', 'usuarios.update', 'series.read', 'turmas.read', 'vinculos.*'],
                    ativo: true,
                    __new: new Date(),
                    __editado: new Date()
                }
            ];
            
            // Inserir roles
            for (const role of defaultRoles) {
                await db.collection('roles').insertOne(role);
                console.log(`✅ Role '${role.nome}' criado`);
            }
            
            console.log('✅ Todos os roles padrão foram criados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar roles padrão:', error);
            throw error;
        }
    },

    // Método executado ao fazer rollback
    async down(db) {
        try {
            console.log('🔄 Removendo roles padrão...');
            
            // Remover roles padrão
            const result = await db.collection('roles').deleteMany({
                id: { $in: [1, 2, 3, 4, 5] }
            });
            
            console.log(`✅ ${result.deletedCount} roles padrão removidos`);
            
        } catch (error) {
            console.error('❌ Erro ao remover roles padrão:', error);
            throw error;
        }
    }
}; 