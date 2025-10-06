// =============================================================================
// Arquivo: create-default-configs.js
//
// Este script tem como objetivo criar as configurações padrão do sistema.
// Funcionalidades principais:
//   - Verifica se já existem configurações de cores do menu
//   - Gera e insere configuração padrão de cores do menu por perfil, se necessário
//   - Utiliza modelos e utilitários para padronizar os dados
//   - Exibe logs de progresso e falhas
//   - Pode ser executado diretamente ou importado como módulo
//
// 
// =============================================================================
const db = require('./db');
const configModel = require('./models/configModel');
const { DEFAULT_PERFIL_COLORS } = require('./utils/roles');

async function createDefaultConfigs() {
    try {
        console.log('Iniciando criação das configurações padrão...');
        
        // Verifica se já existe configuração de cores do menu
        const existingMenuColors = await db.findOne("configuracoes", { 
            tipo: 'menu_colors' 
        });
        
        if (!existingMenuColors) {       
            // Gera ID para a configuração
            const configId = await configModel.generateConfigId(db);
            
            // Cria configuração de cores do menu
            const menuColorsConfig = await configModel.createConfig({
                id: configId,
                nome: 'Cores do Menu por Perfil',
                tipo: 'menu_colors',
                valor: DEFAULT_PERFIL_COLORS,
                ativo: true,
                __new: new Date(),
                __editado: new Date()
            });
            
            // Insere no banco
            const result = await db.insert("configuracoes", menuColorsConfig, true);
        } else {
            // Configurações já existem
        }
        
    } catch (error) {
        console.error('Erro ao criar configurações padrão:', error);
        throw error;
    }
}

// Executa se chamado diretamente
if (require.main === module) {
    createDefaultConfigs()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Erro no script de configurações:', error);
            process.exit(1);
        });
}

module.exports = { createDefaultConfigs }; 