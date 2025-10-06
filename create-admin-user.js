// =============================================================================
// Arquivo: create-admin-user.js
//
// Este script tem como objetivo criar o usuário administrador padrão do sistema.
// Funcionalidades principais:
//   - Carrega variáveis de ambiente do .env
//   - Verifica se já existe um usuário "superadmin" cadastrado
//   - Cria o usuário admin com senha criptografada caso não exista
//   - Gera o próximo ID disponível para o usuário
//   - Insere o usuário admin no banco de dados local
//   - Exibe logs de progresso e falhas
//
//
// =============================================================================
require('dotenv').config({ path: __dirname + '/.env' });
const bcrypt = require('bcryptjs');
const db = require("./db");

// Função para criptografar senha
async function hashPassword(password) {
    return await bcrypt.hash(password, 12);
}

// Função para criar usuário administrador
async function createAdminUser() {
    try {
        console.log("Criando usuário administrador...");

        // Verifica se já existe um usuário com esse userName
        const existingUser = await db.findOne("usuarios", { userName: "superadmin" });
        
        if (existingUser) {
            return;
        }

        // Calcula o próximo ID livre começando do 1
        const regUltimo = await db.acharUltimo("usuarios", {});
        
        let idUsuario;
        if (regUltimo && regUltimo.id) {
            idUsuario = regUltimo.id + 1;
        } else {
            idUsuario = 1; // Primeiro usuário começa com ID 1
        }

        // Criptografa a senha
        const hashedPassword = await hashPassword("admin123");

        // Cria o objeto do usuário administrador
        const adminUser = { 
            id: idUsuario, 
            userName: "superadmin",
            pass: hashedPassword, 
            roles: ["admin"],
            ativo: true, 
            __new: new Date(),
            email: "superadmin@fakeemail.com"
        };

        const result = await db.insert("usuarios", adminUser, true);
    } catch (err) {
        console.error("❌ Erro ao criar usuário administrador:", err);
    }
}

// Executa a criação do usuário
createAdminUser().then(() => {
    console.log("Script finalizado.");
    process.exit(0);
}).catch(err => {
    console.error("Erro:", err);
    process.exit(1);
}); 