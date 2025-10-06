const fs = require('fs').promises;
const path = require('path');
const { connect } = require('../db');

class MigrationRunner {
    constructor() {
        this.migrationsPath = path.join(__dirname, 'migrations');
        this.migrationsCollection = 'migrations';
    }

    async init() {
        try {
            const db = await connect();
            
            // Criar coleção de migrations se não existir
            const collections = await db.listCollections().toArray();
            const migrationCollectionExists = collections.some(col => col.name === this.migrationsCollection);
            
            if (!migrationCollectionExists) {
                await db.createCollection(this.migrationsCollection);
                console.log('✅ Coleção de migrations criada com sucesso');
            }
            
            return db;
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema de migrations:', error);
            throw error;
        }
    }

    async getMigrationsFiles() {
        try {
            const files = await fs.readdir(this.migrationsPath);
            return files
                .filter(file => file.endsWith('.js'))
                .sort(); // Ordenar por nome para garantir ordem de execução
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Diretório não existe, criar
                await fs.mkdir(this.migrationsPath, { recursive: true });
                return [];
            }
            throw error;
        }
    }

    async getExecutedMigrations(db) {
        try {
            const migrations = await db.collection(this.migrationsCollection)
                .find({})
                .sort({ timestamp: 1 })
                .toArray();
            return migrations;
        } catch (error) {
            console.error('❌ Erro ao buscar migrations executadas:', error);
            return [];
        }
    }

    async executeMigration(db, migrationFile, migrationPath) {
        try {
            console.log(`🔄 Executando migration: ${migrationFile}`);
            
            // Importar e executar migration
            const migration = require(migrationPath);
            
            if (typeof migration.up !== 'function') {
                throw new Error(`Migration ${migrationFile} deve ter método 'up'`);
            }

            // Executar migration
            await migration.up(db);
            
            // Registrar migration como executada
            await db.collection(this.migrationsCollection).insertOne({
                filename: migrationFile,
                timestamp: new Date(),
                executed: true
            });
            
            console.log(`✅ Migration ${migrationFile} executada com sucesso`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao executar migration ${migrationFile}:`, error);
            throw error;
        }
    }

    async runMigrations() {
        try {
            console.log('🚀 Iniciando execução de migrations...');
            
            const db = await this.init();
            const migrationFiles = await this.getMigrationsFiles();
            const executedMigrations = await this.getExecutedMigrations(db);
            
            if (migrationFiles.length === 0) {
                console.log('📝 Nenhuma migration encontrada');
                return;
            }
            
            console.log(`📋 Encontradas ${migrationFiles.length} migrations`);
            console.log(`📊 Executadas: ${executedMigrations.length}`);
            
            const pendingMigrations = migrationFiles.filter(file => 
                !executedMigrations.some(executed => executed.filename === file)
            );
            
            if (pendingMigrations.length === 0) {
                console.log('✅ Todas as migrations já foram executadas');
                return;
            }
            
            console.log(`🔄 Executando ${pendingMigrations.length} migrations pendentes...`);
            
            for (const migrationFile of pendingMigrations) {
                const migrationPath = path.join(this.migrationsPath, migrationFile);
                await this.executeMigration(db, migrationFile, migrationPath);
            }
            
            console.log('🎉 Todas as migrations foram executadas com sucesso!');
            
        } catch (error) {
            console.error('💥 Erro durante execução de migrations:', error);
            throw error;
        }
    }

    async rollbackMigration(migrationName) {
        try {
            console.log(`🔄 Fazendo rollback da migration: ${migrationName}`);
            
            const db = await this.init();
            const migrationPath = path.join(this.migrationsPath, migrationName);
            
            // Verificar se migration existe
            try {
                await fs.access(migrationPath);
            } catch {
                throw new Error(`Migration ${migrationName} não encontrada`);
            }
            
            // Verificar se foi executada
            const executedMigration = await db.collection(this.migrationsCollection)
                .findOne({ filename: migrationName });
            
            if (!executedMigration) {
                throw new Error(`Migration ${migrationName} não foi executada`);
            }
            
            // Importar e executar rollback
            const migration = require(migrationPath);
            
            if (typeof migration.down !== 'function') {
                throw new Error(`Migration ${migrationName} deve ter método 'down'`);
            }
            
            // Executar rollback
            await migration.down(db);
            
            // Remover registro da migration
            await db.collection(this.migrationsCollection)
                .deleteOne({ filename: migrationName });
            
            console.log(`✅ Rollback da migration ${migrationName} executado com sucesso`);
            
        } catch (error) {
            console.error(`❌ Erro ao fazer rollback da migration ${migrationName}:`, error);
            throw error;
        }
    }

    async showStatus() {
        try {
            const db = await this.init();
            const migrationFiles = await this.getMigrationsFiles();
            const executedMigrations = await this.getExecutedMigrations(db);
            
            console.log('\n📊 Status das Migrations:');
            console.log('=' .repeat(50));
            
            for (const file of migrationFiles) {
                const executed = executedMigrations.some(m => m.filename === file);
                const status = executed ? '✅ Executada' : '⏳ Pendente';
                const timestamp = executed 
                    ? executedMigrations.find(m => m.filename === file).timestamp
                    : '';
                
                console.log(`${status} | ${file} ${timestamp ? `| ${timestamp}` : ''}`);
            }
            
            console.log('=' .repeat(50));
            console.log(`Total: ${migrationFiles.length} migrations`);
            console.log(`Executadas: ${executedMigrations.length}`);
            console.log(`Pendentes: ${migrationFiles.length - executedMigrations.length}`);
            
        } catch (error) {
            console.error('❌ Erro ao mostrar status:', error);
        }
    }
}

module.exports = MigrationRunner; 