// Configurações do sistema de migrations
module.exports = {
    // Configurações do banco de dados
    database: {
        // Nome da coleção que armazena o histórico de migrations
        migrationsCollection: 'migrations',
        
        // Timeout para operações de banco (em ms)
        timeout: 30000,
        
        // Número máximo de tentativas para operações
        maxRetries: 3
    },
    
    // Configurações das migrations
    migrations: {
        // Diretório onde estão as migrations
        directory: './migrations',
        
        // Extensões de arquivo aceitas
        extensions: ['.js'],
        
        // Padrão de nomenclatura para migrations
        namingPattern: 'timestamp_description',
        
        // Ordem de execução (se necessário)
        executionOrder: [
            '001_create_initial_collections.js',
            '002_create_default_roles.js',
            '002_create_default_roles.js', // Manter temporariamente se já foi executada
            '003_create_admin_user.js',
            '004_add_missing_user_fields.js'
        ]
    },
    
    // Configurações de logging
    logging: {
        // Nível de log (debug, info, warn, error)
        level: process.env.LOG_LEVEL || 'info',
        
        // Formato dos logs
        format: 'detailed', // 'simple' ou 'detailed'
        
        // Cores no terminal
        colors: true,
        
        // Timestamp nos logs
        timestamp: true
    },
    
    // Configurações de segurança
    security: {
        // Permitir execução em produção
        allowProduction: process.env.ALLOW_PRODUCTION_MIGRATIONS === 'true',
        
        // Backup automático antes de migrations
        autoBackup: process.env.AUTO_BACKUP === 'true',
        
        // Diretório de backup
        backupDirectory: './backups'
    },
    
    // Configurações de rollback
    rollback: {
        // Permitir rollback em produção
        allowProductionRollback: false,
        
        // Confirmação obrigatória para rollback
        requireConfirmation: true,
        
        // Backup antes do rollback
        backupBeforeRollback: true
    },
    
    // Configurações de validação
    validation: {
        // Validar estrutura das migrations
        validateStructure: true,
        
        // Verificar métodos obrigatórios
        requireUpMethod: true,
        requireDownMethod: true,
        
        // Validar sintaxe JavaScript
        validateSyntax: true
    },
    
    // Configurações de performance
    performance: {
        // Executar migrations em paralelo (se possível)
        parallel: false,
        
        // Tamanho do lote para operações em massa
        batchSize: 1000,
        
        // Timeout para operações individuais
        operationTimeout: 10000
    },
    
    // Configurações de ambiente
    environment: {
        // Configurações específicas por ambiente
        development: {
            logging: { level: 'debug' },
            security: { allowProduction: true },
            rollback: { allowProductionRollback: true }
        },
        
        staging: {
            logging: { level: 'info' },
            security: { allowProduction: false },
            rollback: { allowProductionRollback: false }
        },
        
        production: {
            logging: { level: 'warn' },
            security: { allowProduction: false },
            rollback: { allowProductionRollback: false },
            performance: { parallel: false }
        }
    }
}; 