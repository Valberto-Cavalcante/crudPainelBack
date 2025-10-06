// Migration: Create Admin User
// Data: 2025-01-27
// Descrição: Cria o usuário administrador padrão do sistema

const bcrypt = require('bcryptjs');

module.exports = {
    // Método executado ao aplicar a migration
    async up(db) {
        try {
            console.log('🔄 Criando usuário administrador padrão...');
            
            // Verificar se já existe usuário administrador
            const existingAdmin = await db.collection('usuarios').findOne({
                email: 'admin@aprovacaoead.com'
            });
            
            if (existingAdmin) {
                console.log('ℹ️  Usuário administrador já existe, pulando criação...');
                return;
            }
            
            // Hash da senha padrão
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            // Usuário administrador padrão
            const adminUser = {
                id: 1,
                email: 'admin@aprovacaoead.com',
                userName: 'admin',
                pass: hashedPassword,
                nome: 'Administrador do Sistema',
                roles: ['Administrador'],
                perfil: 'Administrador',
                ativo: true,
                matricula: null,
                ra: null,
                dataNascimento: null,
                formacao: null,
                experiencia: null,
                especialidade: null,
                responsaveis: null,
                __new: new Date(),
                __editado: new Date()
            };
            
            // Inserir usuário administrador
            await db.collection('usuarios').insertOne(adminUser);
            
            console.log('✅ Usuário administrador criado com sucesso');
            console.log('📧 Email: admin@aprovacaoead.com');
            console.log('🔑 Senha: admin123');
            console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
            
        } catch (error) {
            console.error('❌ Erro ao criar usuário administrador:', error);
            throw error;
        }
    },

    // Método executado ao fazer rollback
    async down(db) {
        try {
            console.log('🔄 Removendo usuário administrador...');
            
            // Remover usuário administrador
            const result = await db.collection('usuarios').deleteOne({
                email: 'admin@aprovacaoead.com'
            });
            
            if (result.deletedCount > 0) {
                console.log('✅ Usuário administrador removido');
            } else {
                console.log('ℹ️  Usuário administrador não encontrado');
            }
            
        } catch (error) {
            console.error('❌ Erro ao remover usuário administrador:', error);
            throw error;
        }
    }
}; 