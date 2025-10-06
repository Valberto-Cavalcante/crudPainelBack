// Migration: Add Missing User Fields
// Data: 2025-01-27
// Descrição: Adiciona campos que podem estar faltando no modelo de usuário

module.exports = {
    // Método executado ao aplicar a migration
    async up(db) {
        try {
            console.log('🔄 Adicionando campos faltantes ao modelo de usuário...');
            
            // Campos que podem estar faltando
            const fieldsToAdd = [
                { field: 'matricula', defaultValue: null },
                { field: 'ra', defaultValue: null },
                { field: 'dataNascimento', defaultValue: null },
                { field: 'formacao', defaultValue: null },
                { field: 'experiencia', defaultValue: null },
                { field: 'especialidade', defaultValue: null },
                { field: 'responsaveis', defaultValue: null }
            ];
            
            let updatedCount = 0;
            
            // Atualizar usuários existentes
            for (const fieldInfo of fieldsToAdd) {
                const result = await db.collection('usuarios').updateMany(
                    { [fieldInfo.field]: { $exists: false } },
                    { $set: { [fieldInfo.field]: fieldInfo.defaultValue } }
                );
                
                if (result.modifiedCount > 0) {
                    console.log(`✅ Campo '${fieldInfo.field}' adicionado a ${result.modifiedCount} usuários`);
                    updatedCount += result.modifiedCount;
                } else {
                    console.log(`ℹ️  Campo '${fieldInfo.field}' já existe em todos os usuários`);
                }
            }
            
            // Verificar se o campo 'roles' existe e é um array
            const usersWithoutrolesArray = await db.collection('usuarios').find({
                $or: [
                    { roles: { $exists: false } },
                    { roles: { $type: 'string' } }
                ]
            }).toArray();
            
            if (usersWithoutrolesArray.length > 0) {
                console.log(`🔄 Convertendo campo 'roles' para array em ${usersWithoutrolesArray.length} usuários...`);
                
                for (const user of usersWithoutrolesArray) {
                    let roles = [];
                    
                    if (user.roles && typeof user.roles === 'string') {
                        // Se roles for string, converter para array
                        roles = [user.roles];
                    } else if (user.perfil && typeof user.perfil === 'string') {
                        // Se perfil existir, usar como base
                        roles = [user.perfil];
                    }
                    
                    await db.collection('usuarios').updateOne(
                        { id: user.id },
                        { 
                            $set: { 
                                roles: roles,
                                __editado: new Date()
                            }
                        }
                    );
                }
                
                console.log(`✅ Campo 'roles' convertido para array em ${usersWithoutrolesArray.length} usuários`);
            }
            
            // Verificar se o campo 'ativo' existe
            const usersWithoutAtivo = await db.collection('usuarios').find({
                ativo: { $exists: false }
            }).toArray();
            
            if (usersWithoutAtivo.length > 0) {
                console.log(`🔄 Adicionando campo 'ativo' a ${usersWithoutAtivo.length} usuários...`);
                
                await db.collection('usuarios').updateMany(
                    { ativo: { $exists: false } },
                    { $set: { ativo: true } }
                );
                
                console.log(`✅ Campo 'ativo' adicionado a ${usersWithoutAtivo.length} usuários`);
            }
            
            console.log(`✅ Migration concluída. ${updatedCount} usuários atualizados`);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar campos faltantes:', error);
            throw error;
        }
    },

    // Método executado ao fazer rollback
    async down(db) {
        try {
            console.log('🔄 Revertendo adição de campos...');
            
            // Campos para remover
            const fieldsToRemove = [
                'matricula',
                'ra', 
                'dataNascimento',
                'formacao',
                'experiencia',
                'especialidade',
                'responsaveis'
            ];
            
            let removedCount = 0;
            
            // Remover campos adicionados
            for (const field of fieldsToRemove) {
                const result = await db.collection('usuarios').updateMany(
                    { [field]: { $exists: true } },
                    { $unset: { [field]: 1 } }
                );
                
                if (result.modifiedCount > 0) {
                    console.log(`✅ Campo '${field}' removido de ${result.modifiedCount} usuários`);
                    removedCount += result.modifiedCount;
                }
            }
            
            console.log(`✅ Rollback concluído. ${removedCount} usuários atualizados`);
            
        } catch (error) {
            console.error('❌ Erro ao fazer rollback:', error);
            throw error;
        }
    }
}; 