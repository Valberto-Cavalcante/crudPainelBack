#!/usr/bin/env node

const MigrationRunner = require('./migrations/migration-runner');
const path = require('path');

// Cores para output no terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function printBanner() {
    console.log(colors.cyan + colors.bright);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    Sistema de Migrations                    ║');
    console.log('║                      AprovacaoEAD                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
}

function printUsage() {
    console.log(colors.yellow + colors.bright + '\n📖 Uso:' + colors.reset);
    console.log('  node migrate.js [comando] [opções]\n');
    
    console.log(colors.blue + colors.bright + 'Comandos disponíveis:' + colors.reset);
    console.log('  run              Executar todas as migrations pendentes');
    console.log('  status           Mostrar status das migrations');
    console.log('  rollback <nome>  Fazer rollback de uma migration específica');
    console.log('  create <nome>    Criar uma nova migration');
    console.log('  help             Mostrar esta ajuda\n');
    
    console.log(colors.blue + colors.bright + 'Exemplos:' + colors.reset);
    console.log('  node migrate.js run');
    console.log('  node migrate.js status');
    console.log('  node migrate.js rollback 001_create_users.js');
    console.log('  node migrate.js create add_new_field_to_users');
    console.log('  node migrate.js help\n');
}

async function createMigration(migrationName) {
    try {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
        const filename = `${timestamp}_${migrationName}.js`;
        const filepath = path.join(__dirname, 'migrations', filename);
        
        const template = `// Migration: ${migrationName}
// Data: ${new Date().toISOString()}
// Descrição: 

module.exports = {
    // Método executado ao aplicar a migration
    async up(db) {
        try {
            console.log('🔄 Aplicando migration: ${migrationName}');
            
            // TODO: Implementar lógica da migration
            // Exemplo:
            // await db.collection('usuarios').updateMany(
            //     { campo: { $exists: false } },
            //     { $set: { campo: 'valor_padrao' } }
            // );
            
            console.log('✅ Migration aplicada com sucesso');
        } catch (error) {
            console.error('❌ Erro ao aplicar migration:', error);
            throw error;
        }
    },

    // Método executado ao fazer rollback
    async down(db) {
        try {
            console.log('🔄 Revertendo migration: ${migrationName}');
            
            // TODO: Implementar lógica de rollback
            // Exemplo:
            // await db.collection('usuarios').updateMany(
            //     { campo: 'valor_padrao' },
            //     { $unset: { campo: 1 } }
            // );
            
            console.log('✅ Rollback executado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao fazer rollback:', error);
            throw error;
        }
    }
};
`;
        
        const fs = require('fs').promises;
        await fs.writeFile(filepath, template);
        
        console.log(colors.green + `✅ Migration criada: ${filename}` + colors.reset);
        console.log(colors.blue + `📁 Localização: ${filepath}` + colors.reset);
        console.log(colors.yellow + '💡 Edite o arquivo e implemente a lógica da migration' + colors.reset);
        
    } catch (error) {
        console.error(colors.red + '❌ Erro ao criar migration:', error.message + colors.reset);
        process.exit(1);
    }
}

async function main() {
    try {
        const args = process.argv.slice(2);
        const command = args[0];
        
        if (!command || command === 'help') {
            printBanner();
            printUsage();
            return;
        }
        
        const runner = new MigrationRunner();
        
        switch (command) {
            case 'run':
                printBanner();
                await runner.runMigrations();
                break;
                
            case 'status':
                printBanner();
                await runner.showStatus();
                break;
                
            case 'rollback':
                const migrationName = args[1];
                if (!migrationName) {
                    console.error(colors.red + '❌ Nome da migration é obrigatório para rollback' + colors.reset);
                    console.log(colors.yellow + 'Uso: node migrate.js rollback <nome_da_migration>' + colors.reset);
                    process.exit(1);
                }
                printBanner();
                await runner.rollbackMigration(migrationName);
                break;
                
            case 'create':
                const newMigrationName = args[1];
                if (!newMigrationName) {
                    console.error(colors.red + '❌ Nome da migration é obrigatório' + colors.reset);
                    console.log(colors.yellow + 'Uso: node migrate.js create <nome_da_migration>' + colors.reset);
                    process.exit(1);
                }
                await createMigration(newMigrationName);
                break;
                
            default:
                console.error(colors.red + `❌ Comando desconhecido: ${command}` + colors.reset);
                printUsage();
                process.exit(1);
        }
        
    } catch (error) {
        console.error(colors.red + '💥 Erro fatal:', error.message + colors.reset);
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = { main }; 