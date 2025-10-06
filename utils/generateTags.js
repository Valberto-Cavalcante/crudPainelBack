
// Este arquivo exporta uma função para gerar tags a partir de registros de dados.
// Utiliza a função simplify para normalizar e extrair palavras-chave dos campos.
// As tags são úteis para buscas, filtros e indexação de registros.
// Inclui o id, nome, resumo e objetivos (se existirem) como base para as tags.
// Pode ser usado em sistemas de busca, autocomplete ou organização de dados.
//
// Função principal:
// - Gera array de tags únicas e normalizadas para cada registro.
//
const simplify = require("./simplify");

// function generateTags(xRegistro) {
module.exports = (xRegistro) => {
    let tags = [];
    tags.push(xRegistro.id.toString());
    tags.push(...simplify(xRegistro.nome));


    if (xRegistro.resumo) tags.push(...simplify(xRegistro.resumo));
    if (xRegistro.objetivos) tags.push(...simplify(xRegistro.objetivos));

    

    return tags;
}