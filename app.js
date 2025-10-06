// Este arquivo é o ponto de entrada principal da aplicação backend Educandus.
// Nele são realizadas as seguintes funcionalidades:
// - Carregamento de variáveis de ambiente e configuração inicial do Express.
// - Configuração de middlewares essenciais como CORS, logger, cookie-parser e body parsers.
// - Inicialização da autenticação JWT via Passport.
// - Definição das rotas principais da aplicação, incluindo rotas de usuário e index.
// - Tratamento global de erros e respostas padronizadas em JSON.
// - Servir arquivos estáticos da pasta 'public' (se existir).
// - Encaminhamento de requisições não encontradas (404) para o handler de erro.
//
// Este arquivo não utiliza view engine, pois a API é totalmente RESTful.
// Todas as respostas de erro são retornadas em formato JSON para facilitar o consumo por clientes frontend.

require('dotenv').config({ path: __dirname + '/.env' });
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


const app = express();
app.use(cors({
  origin: ['https://www.aprovacaoead.com.br','http://localhost:3039','http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173','http://localhost:5005'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Importe a estratégia JWT que você configurou
var auth = require('./auth');
app.use(auth.passport.initialize());


// API application - no view engine needed

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const autoAdminLogger = require('./middlewares/autoAdminLogger');
app.use(autoAdminLogger({
  stripPrefixes: ['/api', '/v1'], // ajuste se seu prefixo for outro
  ignore: [/^\/health/i],         // endpoints que não quer logar
  logGets: true                   // true para também logar GETs
}));
// Definindo as rotas
const indexRouter = require('./routes/index');


const rotasUser = require('./routes/user');


app.use('/', indexRouter);
app.use('/', rotasUser);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // return JSON error response instead of rendering view
    res.status(err.status || 500);
    res.json({
        success: false,
        error: err.message || 'Internal Server Error',
        ...(req.app.get('env') === 'development' && { stack: err.stack })
    });
});

module.exports = app;
