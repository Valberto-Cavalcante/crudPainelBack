// =============================================================================
// Arquivo: init-and-start.js
//
// Este script automatiza a configuração e inicialização do sistema.
// Funcionalidades principais:
//   - Carrega variáveis de ambiente do .env
//   - Executa scripts de criação de usuários, menus e configurações iniciais
//   - Exibe logs detalhados do progresso e falhas
//   - Inicia o servidor principal da aplicação
//   - Interrompe o processo em caso de erro, exibindo mensagens claras
//
// 
// =============================================================================
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Função para executar um script
function runScript(scriptPath) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔄 Executando: ${scriptPath}`);
        
        const child = spawn('node', [scriptPath], {
            stdio: 'inherit',
            cwd: __dirname,
            env: { ...process.env }  // Passa todas as variáveis de ambiente
        });

        child.on('close', (code) => {
            if (code === 0) {
        
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
async function initAndStart() {
    try {
        console.log('🚀 Iniciando configuração do sistema...');
        
        // Executa os scripts de inicialização
        // await runScript('./create-admin-user.js');
         await runScript('./create-users.js');
        // await runScript('./create-default-configs.js');
        // await runScript('./create-menu-items.js');
        // await runScript('./create-roles.js');
        
        console.log('\n🎉 Configuração inicial concluída!');
        
        // Inicia o servidor
        const server = spawn('node', ['./bin/www'], {
            stdio: 'inherit',
            cwd: __dirname,
            env: { ...process.env }  // Passa todas as variáveis de ambiente
        });

        server.on('spawn', () => {
            console.log('🚀 Servidor iniciado com sucesso!');
        });

        server.on('close', (code) => {
            console.log(`\n🛑 Servidor finalizado com código: ${code}`);
        });

        server.on('error', (error) => {
            console.error('❌ Erro no servidor:', error);
        });

    } catch (error) {
        console.error('❌ Erro durante a inicialização:', error);
        process.exit(1);
    }
}

// Executa a função principal
initAndStart(); 