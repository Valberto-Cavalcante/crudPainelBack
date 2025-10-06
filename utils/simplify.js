// Este arquivo exporta uma função para simplificar e normalizar textos.
// Remove acentos, converte para maiúsculas e separa por espaços e pontuações.
// Retorna um array de palavras únicas, útil para buscas e geração de tags.
// Evita duplicidade e ignora valores vazios.
// Pode ser usado em sistemas de busca, filtros e organização de dados.
//
// Função principal:
// - Simplifica textos para facilitar indexação e comparação.
//
//simplify.js
module.exports = (text) => {
    const separators = /[\s,\.;:\(\)\-'\+]/g;
    const diacritics = /[\u0300-\u036f]/g;
    //capitalização e normalização
    text = text.toUpperCase().normalize("NFD").replace(diacritics, "");
    //separando e removendo repetidos
    const arr = text.split(separators).filter((item, pos, self) => self.indexOf(item) == pos);
    //removendo nulls, undefineds e strings vazias
    return arr.filter(item => (item));
}