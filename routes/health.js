var express = require('express');
var router = express.Router();
const db = require("../db");

// Rota para verificar a conexão com o banco de dados
router.get('/health/db', async (req, res) => {
    try {
        // Testar a conexão com o MongoDB usando uma função simples
        const dbMongo = await db.findOne('test', { test: 'health_check' });
        
        res.json({
            status: 'online',
            message: 'Conexão com banco de dados está funcionando',
            timestamp: new Date().toISOString(),
            database: 'MongoDB'
        });
    } catch (error) {
        console.error('Erro na conexão com banco de dados:', error);
        res.status(500).json({
            status: 'offline',
            message: 'Erro na conexão com banco de dados',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

module.exports = router; 