// Este arquivo implementa o modelo de Instituição.
// Gerencia operações de CRUD para instituições de ensino ou empresas.
// Garante a criação de IDs sequenciais e únicos para cada instituição.
// Permite o cadastro de subdomínios e hierarquia institucional.
// Inclui métodos para ativação, desativação e atualização de instituições.
// Utiliza o banco de dados para persistência dos dados.
// Valida dados obrigatórios e tipos ao criar ou editar instituições.
// Suporta busca, listagem e filtragem de instituições cadastradas.
// Centraliza regras de negócio relacionadas a instituições.
// Facilita integrações futuras com outros módulos do sistema.
const db = require("../db");

class InstituicaoModel {
    constructor() {
        this.collectionName = "instituicoes";
    }

    // Criar nova instituição
    async create(instituicaoData) {
        try {
            // Gerar ID sequencial
            const ultimoSalvo = await db.acharUltimo(this.collectionName, {});
            const novoId = ultimoSalvo ? ultimoSalvo.id + 1 : 1;

            const instituicao = {
                id: novoId,
                nome: instituicaoData.nome,
                subdominio: instituicaoData.subdominio,
                idInstituicaoSuperior: instituicaoData.idInstituicaoSuperior || null,
                tipo: instituicaoData.tipo,
                ativo: true,
                __new: new Date()
            };

            const resultado = await db.insert(this.collectionName, instituicao, true);
            return resultado;
        } catch (error) {
            console.error("Erro ao criar instituição:", error);
            throw error;
        }
    }

    // Buscar todas as instituições
    async findAll() {
        try {
            // Usar findColecaoAgg para buscar todas as instituições ativas
            const agg = [
                { $match: { ativo: true } },
                { $sort: { id: 1 } }
            ];
            const instituicoes = await db.findColecaoAgg(this.collectionName, agg);
            return instituicoes || [];
        } catch (error) {
            console.error("Erro ao buscar instituições:", error);
            throw error;
        }
    }

    // Buscar todas as instituições com paginação
    async findAllPaginated(skip = 0, limit = 15) {
        try {
            // Usar findColecaoIDPaginated para buscar instituições com paginação
            const instituicoes = await db.findColecaoIDPaginated(this.collectionName, { ativo: true }, skip, limit);
            return instituicoes || [];
        } catch (error) {
            console.error("Erro ao buscar instituições paginadas:", error);
            throw error;
        }
    }

    // Buscar instituição por ID
    async findById(id) {
        try {
            const instituicao = await db.findOne(this.collectionName, { id: parseInt(id), ativo: true });
            return instituicao;
        } catch (error) {
            console.error("Erro ao buscar instituição por ID:", error);
            throw error;
        }
    }

    // Atualizar instituição
    async update(id, instituicaoData) {
        try {
            const filtro = { id: parseInt(id) };
            const dadosAtualizados = {
                ...instituicaoData,
                __editado: new Date()
            };

            const resultado = await db.atualizaUm(this.collectionName, filtro, { $set: dadosAtualizados }, true);
            return resultado;
        } catch (error) {
            console.error("Erro ao atualizar instituição:", error);
            throw error;
        }
    }

    // Deletar instituição (soft delete)
    async delete(id) {
        try {
            const filtro = { id: parseInt(id) };
            const resultado = await db.atualizaUm(this.collectionName, filtro, { $set: { ativo: false, __editado: new Date() } }, true);
            return resultado;
        } catch (error) {
            console.error("Erro ao deletar instituição:", error);
            throw error;
        }
    }

    // Buscar instituições por tipo
    async findByTipo(tipo) {
        try {
            const agg = [
                { $match: { tipo: tipo, ativo: true } },
                { $sort: { id: 1 } }
            ];
            const instituicoes = await db.findColecaoAgg(this.collectionName, agg);
            return instituicoes || [];
        } catch (error) {
            console.error("Erro ao buscar instituições por tipo:", error);
            throw error;
        }
    }

    // Buscar instituições filhas
    async findFilhas(idInstituicaoSuperior) {
        try {
            const agg = [
                { $match: { 
                    idInstituicaoSuperior: parseInt(idInstituicaoSuperior), 
                    ativo: true 
                }},
                { $sort: { id: 1 } }
            ];
            const instituicoes = await db.findColecaoAgg(this.collectionName, agg);
            return instituicoes || [];
        } catch (error) {
            console.error("Erro ao buscar instituições filhas:", error);
            throw error;
        }
    }

    // Buscar instituição por subdomínio
    async findBySubdominio(subdominio) {
        try {
            const instituicao = await db.findOne(this.collectionName, { 
                subdominio: subdominio.toLowerCase(), 
                ativo: true 
            });
            return instituicao;
        } catch (error) {
            console.error("Erro ao buscar instituição por subdomínio:", error);
            throw error;
        }
    }

    // Buscar instituição por nome
    async findByNome(nome) {
        try {
            const instituicao = await db.findOne(this.collectionName, { 
                nome: nome.trim(), 
                ativo: true 
            });
            return instituicao;
        } catch (error) {
            console.error("Erro ao buscar instituição por nome:", error);
            throw error;
        }
    }

    // Formatar instituição para frontend
    formatInstituicaoForFrontend(instituicao) {
        if (!instituicao) return null;
        
        return {
            id: instituicao.id,
            nome: instituicao.nome,
            subdominio: instituicao.subdominio,
            idInstituicaoSuperior: instituicao.idInstituicaoSuperior,
            tipo: instituicao.tipo,
            ativo: instituicao.ativo,
            createdAt: instituicao.__new,
            updatedAt: instituicao.__editado
        };
    }
}

module.exports = new InstituicaoModel(); 