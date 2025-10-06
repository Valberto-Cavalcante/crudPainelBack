// Este arquivo é responsável pela configuração da autenticação baseada em JWT para a aplicação.
// Utiliza o Passport.js com a estratégia JWT para proteger rotas e validar tokens de acesso.
// Permite a extração do token tanto do header Authorization (Bearer) quanto de cookies.
// Define as opções da estratégia JWT, incluindo a chave secreta e métodos de extração do token.
// Ao autenticar, busca o usuário no banco de dados pelo id presente no payload do token e verifica se está ativo.
// Caso o usuário seja encontrado e esteja ativo, a autenticação é considerada válida.
// Exporta o Passport, a estratégia JWT, o próprio JWT e as opções configuradas para uso em outras partes do sistema.
// Este arquivo centraliza toda a lógica de autenticação e validação de usuários via token JWT.
// A variável de ambiente JWT_SECRET é obrigatória para segurança.

var passport = require('passport');
var jwt = require('jsonwebtoken');
var passportJWT = require('passport-jwt');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

// Verificar se JWT_SECRET está definido
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET é uma variavel essencial. Inclua ela no .env');
}

// Configuração da estratégia JWT
var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
            if (req.cookies && req.cookies.token) {
                return req.cookies.token;
            }
            return null;
        }
    ]),
    secretOrKey: process.env.JWT_SECRET
};

var jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        console.log('🔍 JWT Strategy - Payload recebido:', payload);
        
        // Busca o usuário pelo id do payload e traz ele completo
        const db = require('./db');
        const user = await db.findOne("usuarios", { id: payload.id, ativo: true });
        
        if (user) {
            console.log('✅ JWT Strategy - Usuário encontrado:', { id: user.id, userName: user.userName });
            return done(null, user);
        } else {
            console.log('❌ JWT Strategy - Usuário não encontrado ou inativo');
            return done(null, false);
        }
    } catch (err) {
        console.error('❌ JWT Strategy - Erro ao buscar usuário:', err);
        return done(err, false);
    }
});

passport.use(jwtStrategy);

module.exports = {
    passport: passport,
    jwtStrategy: jwtStrategy,
    jwt: jwt,
    jwtOptions: jwtOptions
};
