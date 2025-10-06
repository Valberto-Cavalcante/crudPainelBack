// =============================================================================
// Arquivo: create-users.js
//
// Este script tem como objetivo criar usuários padrão para o sistema.
// Funcionalidades principais:
//   - Carrega variáveis de ambiente do .env
//   - Define uma lista de usuários a serem criados (com roles e senhas)
//   - Criptografa as senhas antes de salvar
//   - Verifica se o usuário já existe antes de criar
//   - Insere os usuários no banco de dados local
//   - Exibe logs detalhados do progresso e falhas
//   - Executa todo o processo automaticamente ao rodar o script
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

// Lista de usuários para criar
const usersToCreate = [
    { id: 236044, userName: "valberto", pass: "mmm", roles: ['admin'], email: "valberto@fakeemail.com" },
    { id: 10003, userName: "clecio", pass: "PB4G", roles: ['conteudo'], email: "clecio@fakeemail.com" },
    { id: 10004, userName: "carlossouto", pass: "X6Ni", perfrolesis: ['conteudo'], email: "carlossouto@fakeemail.com" },
    { id: 10005, userName: "carlos", pass: "rr", roles: ['admin'], email: "carlos@fakeemail.com" },
    { id: 10006, userName: "demo", pass: "d123emo", roles: ['demo'], email: "demo@fakeemail.com" },
    { id: 10007, userName: "ricardo", pass: "ric3186", roles: ['conteudo'], email: "ricardo@fakeemail.com" },
    { id: 10008, userName: "thainasalerno", pass: "731276", roles: ['demo'], email: "thainasalerno@fakeemail.com" },
    { id: 10009, userName: "mauroromano", pass: "620727", roles: ['demo'], email: "mauroromano@fakeemail.com" },
    { id: 10010, userName: "profsp", pass: "823494", roles: ['demo'], email: "profsp@fakeemail.com" },
    { id: 10011, userName: "silviomota", pass: "714378", roles: ['demo'], email: "silviomota@fakeemail.com" },
    { id: 10012, userName: "mano", pass: "710078", roles: ['saeb_avaliacao'], email: "mano@fakeemail.com" },
    { id: 10013, userName: "mano2", pass: "df3875", roles: ['saeb_avaliacao'], email: "mano2@fakeemail.com" },
    { id: 10014, userName: "mano3", pass: "leo1978", roles: ['saeb_avaliacao'], email: "mano3@fakeemail.com" }

];

// Função para criar um usuário
async function createUser(userData) {
    try {
        console.log(`Criando usuário: ${userData.userName}...`);

        // Verifica se já existe um usuário com esse ID
        const existingUser = await db.findOne("usuarios", { id: userData.id });
        
        if (existingUser) {
            console.log(`⚠️  Usuário ${userData.userName} (ID: ${userData.id}) já existe. Pulando...`);
            return;
        }

        // Criptografa a senha
        const hashedPassword = await hashPassword(userData.pass);

        // Cria o objeto do usuário
        const user = { 
            id: userData.id, 
            userName: userData.userName,
            pass: hashedPassword, 
            roles: userData.roles, 
            ativo: true, 
            __new: new Date(),
            __editado: new Date(),
            email: userData.email,
            nome: userData.userName // Usando userName como nome por padrão
        };

        const result = await db.insert("usuarios", user, true);
        console.log(`✅ Usuário ${userData.userName} criado com sucesso!`);
        
    } catch (err) {
        console.error(`❌ Erro ao criar usuário ${userData.userName}:`, err);
    }
}

// Função principal para criar todos os usuários
async function createAllUsers() {
    try {
        for (const userData of usersToCreate) {
            await createUser(userData);
        }

        console.log("✅ Script finalizado com sucesso!");
        
    } catch (err) {
        console.error("❌ Erro geral:", err);
    }
}

// Executa a criação dos usuários
createAllUsers().then(() => {
    console.log("🎉 Processo concluído!");
    process.exit(0);
}).catch(err => {
    console.error("💥 Erro fatal:", err);
    process.exit(1);
}); 