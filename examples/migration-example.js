// Exemplo de uso do sistema de migrations
// Este arquivo demonstra como usar as migrations em diferentes cenários

const MigrationRunner = require('../migrations/migration-runner');

// Exemplo 1: Executar todas as migrations pendentes
async function runAllMigrations() {
    console.log('🚀 Executando todas as migrations...');
    
    try {
        const runner = new MigrationRunner();
        await runner.runMigrations();
        console.log('✅ Todas as migrations executadas com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao executar migrations:', error);
    }
}

// Exemplo 2: Verificar status das migrations
async function checkMigrationStatus() {
    console.log('📊 Verificando status das migrations...');
    
    try {
        const runner = new MigrationRunner();
        await runner.showStatus();
    } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
    }
}

// Exemplo 3: Fazer rollback de uma migration específica
async function rollbackMigration(migrationName) {
    console.log(`🔄 Fazendo rollback da migration: ${migrationName}`);
    
    try {
        const runner = new MigrationRunner();
        await runner.rollbackMigration(migrationName);
        console.log('✅ Rollback executado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao fazer rollback:', error);
    }
}

// Exemplo 4: Executar migrations em sequência com validação
async function runMigrationsWithValidation() {
    console.log('🔍 Executando migrations com validação...');
    
    try {
        const runner = new MigrationRunner();
        
        // Verificar status atual
        console.log('\n📊 Status atual:');
        await runner.showStatus();
        
        // Executar migrations
        console.log('\n🚀 Executando migrations...');
        await runner.runMigrations();
        
        // Verificar status final
        console.log('\n📊 Status final:');
        await runner.showStatus();
        
    } catch (error) {
        console.error('❌ Erro durante execução:', error);
    }
}

// Exemplo 5: Simular cenário de desenvolvimento
async function developmentScenario() {
    console.log('🛠️  Cenário de desenvolvimento...');
    
    try {
        const runner = new MigrationRunner();
        
        // 1. Verificar estado inicial
        console.log('\n1️⃣ Estado inicial:');
        await runner.showStatus();
        
        // 2. Executar migrations
        console.log('\n2️⃣ Executando migrations...');
        await runner.runMigrations();
        
        // 3. Verificar estado após execução
        console.log('\n3️⃣ Estado após execução:');
        await runner.showStatus();
        
        // 4. Simular rollback (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            console.log('\n4️⃣ Simulando rollback (apenas em desenvolvimento)...');
            // await runner.rollbackMigration('004_add_missing_user_fields.js');
            console.log('ℹ️  Rollback simulado (comentado para segurança)');
        }
        
    } catch (error) {
        console.error('❌ Erro no cenário de desenvolvimento:', error);
    }
}

// Exemplo 6: Verificar integridade do banco
async function checkDatabaseIntegrity() {
    console.log('🔍 Verificando integridade do banco...');
    
    try {
        const runner = new MigrationRunner();
        const db = await runner.init();
        
        // Verificar coleções existentes
        const collections = await db.listCollections().toArray();
        console.log(`📚 Coleções encontradas: ${collections.length}`);
        
        collections.forEach(col => {
            console.log(`  - ${col.name}`);
        });
        
        // Verificar dados nas principais coleções
        const collectionsToCheck = ['usuarios', 'roles', 'menus', 'instituicoes'];
        
        for (const collectionName of collectionsToCheck) {
            try {
                const count = await db.collection(collectionName).countDocuments();
                console.log(`📊 ${collectionName}: ${count} documentos`);
            } catch (error) {
                console.log(`⚠️  ${collectionName}: não encontrada`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar integridade:', error);
    }
}

// Função principal para executar exemplos
async function main() {
    const args = process.argv.slice(2);
    const example = args[0] || 'all';
    
    console.log('📚 Exemplos do Sistema de Migrations');
    console.log('=' .repeat(50));
    
    switch (example) {
        case 'run':
            await runAllMigrations();
            break;
            
        case 'status':
            await checkMigrationStatus();
            break;
            
        case 'rollback':
            const migrationName = args[1];
            if (!migrationName) {
                console.error('❌ Nome da migration é obrigatório para rollback');
                console.log('Uso: node migration-example.js rollback <nome_da_migration>');
                return;
            }
            await rollbackMigration(migrationName);
            break;
            
        case 'validation':
            await runMigrationsWithValidation();
            break;
            
        case 'dev':
            await developmentScenario();
            break;
            
        case 'integrity':
            await checkDatabaseIntegrity();
            break;
            
        case 'all':
        default:
            console.log('🔄 Executando todos os exemplos...\n');
            
            await checkMigrationStatus();
            console.log('\n' + '=' .repeat(50) + '\n');
            
            await runAllMigrations();
            console.log('\n' + '=' .repeat(50) + '\n');
            
            await checkMigrationStatus();
            console.log('\n' + '=' .repeat(50) + '\n');
            
            await checkDatabaseIntegrity();
            break;
    }
    
    console.log('\n🎉 Exemplos concluídos!');
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    runAllMigrations,
    checkMigrationStatus,
    rollbackMigration,
    runMigrationsWithValidation,
    developmentScenario,
    checkDatabaseIntegrity
}; 