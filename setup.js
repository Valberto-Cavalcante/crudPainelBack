// =============================================================================
// Arquivo: setup.js
//
// Este script tem como objetivo realizar a configuração inicial do sistema.
// Funcionalidades principais:
//   - Carrega variáveis de ambiente do .env
//   - Executa scripts para criar o usuário admin e configurações padrão
//   - Exibe logs detalhados do progresso e falhas
//   - Mostra um resumo das ações realizadas ao final
//   - Interrompe o processo em caso de erro, exibindo mensagens claras
//
// 
// =============================================================================
require('dotenv').config();
const { spawn } = require('child_process');

// Função para executar um script
function runScript(scriptPath) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔄 Executando: ${scriptPath}`);
        
        const child = spawn('node', [scriptPath], {
            stdio: 'inherit',
            cwd: __dirname
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${scriptPath} executado com sucesso!`);
                resolve();
            } else {
                console.error(`❌ ${scriptPath} falhou com código: ${code}`);
                reject(new Error(`Script ${scriptPath} falhou`));
            }
        });

        child.on('error', (error) => {
            console.error(`❌ Erro ao executar ${scriptPath}:`, error);
            reject(error);
        });
    });
}

// Função principal
async function setup() {
    try {
        console.log('🚀 Configurando sistema...');
        
        // Executa os scripts de inicialização
        await runScript('./create-admin-user.js');
        await runScript('./create-default-configs.js');
        await runScript('./create-roles.js');
        
        console.log('\n🎉 Configuração inicial concluída!');
        console.log('\n📋 Resumo da configuração:');
        console.log('- ✅ Usuário admin criado (superadmin/admin123)');
        console.log('- ✅ Configurações padrão criadas');
        console.log('\n🚀 Para iniciar o servidor, execute: npm run start:dev');

    } catch (error) {
        console.error('❌ Erro durante a configuração:', error);
        process.exit(1);
    }
}

// Executa a função principal
setup(); 