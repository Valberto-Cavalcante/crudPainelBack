// Este arquivo implementa o modelo de Usuário do sistema.
// Define o schema de usuários, incluindo validação de campos obrigatórios.
// Gerencia operações de criação, autenticação e atualização de usuários.
// Utiliza bcrypt para hash e verificação de senhas.
// Permite associação de múltiplos roles a cada usuário.
// Inclui métodos para ativação, desativação e edição de usuários.
// Garante integridade e segurança dos dados sensíveis.
// Centraliza regras de negócio relacionadas a usuários.
// Facilita integrações com módulos de autenticação e autorização.
// Suporta expansão futura para novos campos e funcionalidades.
const bcrypt = require('bcryptjs');
const { ROLES_ARRAY } = require('../utils/roles');

// Schema do usuário
const userSchema = {
    id: { type: 'number', required: true },
    email: { type: 'string', required: true },
    userName: { type: 'string', required: true },
    pass: { type: 'string', required: true }, // hash da senha
    nome: { type: 'string', required: true },
    roles: { type: 'array', required: true }, // array de roles
    ativo: { type: 'boolean', required: true, default: true },
    perfil: { type: 'string', required: false },
    matricula: { type: 'string', required: false,default:null },
    ra: { type: 'string', required: false,default:null },
    dataNascimento: { type: 'date', required: false,default:null },
    formacao: { type: 'string', required: false,default:null },
    experiencia: { type: 'string', required: false,default:null },
    especialidade: { type: 'string', required: false,default:null },
    responsaveis: { type: 'string', required: false,default:null },
    extra: { type: 'object', required: false },
    __new: { type: 'date', required: true },
    __editado: { type: 'date', required: false }
};

// Função para validar o schema do usuário
function validateUser(user) {
    console.log(user)
    const errors = [];
    
    for (const [field, config] of Object.entries(userSchema)) {
        if (config.required && !user.hasOwnProperty(field)) {
            errors.push(`Campo '${field}' é obrigatório`);
        }
        
        if (user.hasOwnProperty(field)) {
            const value = user[field];
            const expectedType = config.type;
            
            // Se o campo não é obrigatório e é null/undefined, não valida o tipo
            if (!config.required && (value === null || value === undefined)) {
                continue;
            }
            
            // Validação de tipo
            if (expectedType === 'string' && typeof value !== 'string' && value !== null) {
                errors.push(`Campo '${field}' deve ser uma string`);
            } else if (expectedType === 'number' && typeof value !== 'number') {
                errors.push(`Campo '${field}' deve ser um número`);
            } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
                errors.push(`Campo '${field}' deve ser um boolean`);
            } else if (expectedType === 'date' && !(value instanceof Date) && value !== null) {
                errors.push(`Campo '${field}' deve ser uma data`);
            } else if (expectedType === 'array' && !Array.isArray(value)) {
                errors.push(`Campo '${field}' deve ser um array`);
            } else if (expectedType === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
                errors.push(`Campo '${field}' deve ser um objeto`);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Função para criar hash da senha
async function hashPassword(password) {
    const SALT_ROUNDS = 12;
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// Função para comparar senhas
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Função para criar um novo usuário (apenas validação e formatação)
async function createUser(userData) {
    // Validação dos dados
    const validation = validateUser(userData);
    if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }
    
    // Se a senha não estiver hasheada, hash ela
    if (userData.pass && !userData.pass.startsWith('$2a$') && !userData.pass.startsWith('$2b$')) {
        userData.pass = await hashPassword(userData.pass);
    }
    
    // Adiciona timestamps se não existirem
    if (!userData.__new) {
        userData.__new = new Date();
    }
    
    if (!userData.__editado) {
        userData.__editado = new Date();
    }
    
    // Define valores padrão
    if (userData.ativo === undefined) {
        userData.ativo = true;
    }
    
    // Garante que roles seja sempre um array
    if (!userData.roles) {
        userData.roles = [];
    } else if (!Array.isArray(userData.roles)) {
        // Se roles for uma string, converte para array
        userData.roles = [userData.roles];
    }
    
    return userData;
}

// Função para gerar ID único para novo usuário
async function generateUserId(db) {
    try {
        // Busca o último usuário cadastrado
        const regUltimo = await db.acharUltimo("usuarios", {});
        
        let idUsuario;
        if (regUltimo && regUltimo.id) {
            // Se existe usuário, pega o ID do último e soma 1
            idUsuario = regUltimo.id + 1;
        } else {
            // Se não existe nenhum usuário, começa com ID 1
            idUsuario = 1;
        }
        
        // Verifica se o ID gerado já existe (por segurança)
        const existingUser = await db.findOne("usuarios", { id: idUsuario });
        if (existingUser) {
            throw new Error("Erro ao gerar ID único para o usuário");
        }
        
        return idUsuario;
    } catch (error) {
        throw new Error(`Erro ao gerar ID do usuário: ${error.message}`);
    }
}

// Função para formatar usuário para o frontend (remove senha)
function formatUserForFrontend(user) {
    const { pass, ...userWithoutPass } = user;
    
    return {
        id: userWithoutPass.id,
        email: userWithoutPass.email,
        userName: userWithoutPass.userName,
        senha_hash: user.pass, // mantém a referência para o frontend
        nome: userWithoutPass.nome,
        roles: userWithoutPass.roles, // array de roles
        perfil: userWithoutPass.perfil,
        matricula: userWithoutPass.matricula,
        ra: userWithoutPass.ra,
        dataNascimento: userWithoutPass.dataNascimento,
        formacao: userWithoutPass.formacao,
        experiencia: userWithoutPass.experiencia,
        especialidade: userWithoutPass.especialidade,
        extra: userWithoutPass.extra,
        createdAt: userWithoutPass.__new,
        updatedAt: userWithoutPass.__editado,
        ativo: userWithoutPass.ativo
    };
}

// Função para formatar usuário para login (sem senha_hash)
function formatUserForLogin(user) {
    const { pass, ...userWithoutPass } = user;
    
    return {
        id: userWithoutPass.id,
        email: userWithoutPass.email,
        userName: userWithoutPass.userName,
        nome: userWithoutPass.nome,
        roles: userWithoutPass.roles, // array de roles
        perfil: userWithoutPass.perfil,
        matricula: userWithoutPass.matricula,
        ra: userWithoutPass.ra,
        dataNascimento: userWithoutPass.dataNascimento,
        formacao: userWithoutPass.formacao,
        experiencia: userWithoutPass.experiencia,
        especialidade: userWithoutPass.especialidade,
        responsaveis: userWithoutPass.responsaveis,
        extra: userWithoutPass.extra,
        createdAt: userWithoutPass.__new,
        updatedAt: userWithoutPass.__editado,
        ativo: userWithoutPass.ativo
    };
}

// Função para formatar usuário para login (sem senha_hash)
function formatUserForLoginConteudo(user) {
    const { pass, ...userWithoutPass } = user;
    
    return {
        id_usu: userWithoutPass.id,
        roles: userWithoutPass.roles, // array de roles
    };
}

// Função para atualizar usuário
async function updateUser(userData, updates) {
    // Adiciona timestamp de atualização
    updates.__editado = new Date();
    
    // Se a senha foi alterada e não está hasheada, hash ela
    if (updates.pass && !updates.pass.startsWith('$2a$') && !updates.pass.startsWith('$2b$')) {
        updates.pass = await hashPassword(updates.pass);
    }
    
    return { ...userData, ...updates };
}

// Função para validar dados de login
function validateLoginData(email, senha) {
    const errors = [];
    
    if (!email || typeof email !== 'string') {
        errors.push('Email é obrigatório e deve ser uma string');
    }
    
    if (!senha || typeof senha !== 'string') {
        errors.push('Senha é obrigatória e deve ser uma string');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = {
    userSchema,
    validateUser,
    hashPassword,
    comparePassword,
    createUser,
    generateUserId,
    formatUserForFrontend,
    formatUserForLogin,
    formatUserForLoginConteudo,
    updateUser,
    validateLoginData
}; 