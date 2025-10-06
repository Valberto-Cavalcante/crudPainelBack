// Este arquivo define o modelo de Vínculo entre usuários e instituições.
// Gerencia operações de criação, atualização e exclusão de vínculos.
// Garante a associação correta entre usuários, instituições e papéis.
// Utiliza IDs sequenciais para novos vínculos.
// Permite ativação e desativação de vínculos conforme regras de negócio.
// Centraliza validações e persistência dos dados de vínculo.
// Facilita consultas e listagens de vínculos existentes.
// Suporta integrações com outros módulos do sistema.
// Auxilia no controle de permissões e acessos institucionais.
// Mantém histórico de criação e edição dos vínculos.
const db = require("../db");

class VinculoModel {
    constructor() {
        this.collectionName = "vinculos";
    }

    // Criar novo vínculo
    async create(vinculoData) {
        try {
            // Gerar ID sequencial
            const ultimoSalvo = await db.acharUltimo(this.collectionName, {});
            const novoId = ultimoSalvo ? ultimoSalvo.id + 1 : 1;

            const vinculo = {
                id: novoId,
                idUsuario: vinculoData.idUsuario,
                idInstituicao: vinculoData.idInstituicao,
                perfil: vinculoData.perfil,
                idPerfil: vinculoData.idPerfil,
                ativo: true,
                __new: new Date()
            };

            const resultado = await db.insert(this.collectionName, vinculo, true);
            return resultado;
        } catch (error) {
            console.error("Erro ao criar vínculo:", error);
            throw error;
        }
    }

    // Buscar todos os vínculos
    async findAll() {
        try {
            const agg = [
                { $match: { ativo: true } },
                { $sort: { id: 1 } }
            ];
            const vinculos = await db.findColecaoAgg(this.collectionName, agg);
            return vinculos || [];
        } catch (error) {
            console.error("Erro ao buscar vínculos:", error);
            throw error;
        }
    }

    // Buscar todos os vínculos com paginação
    async findAllPaginated(skip = 0, limit = 15) {
        try {
            // Usar findColecaoIDPaginated para buscar vínculos com paginação
            const vinculos = await db.findColecaoIDPaginated(this.collectionName, { ativo: true }, skip, limit);
            return vinculos || [];
        } catch (error) {
            console.error("Erro ao buscar vínculos paginados:", error);
            throw error;
        }
    }

    // Buscar vínculo por ID
    async findById(id) {
        try {
            const vinculo = await db.findOne(this.collectionName, { id: parseInt(id), ativo: true });
            return vinculo;
        } catch (error) {
            console.error("Erro ao buscar vínculo por ID:", error);
            throw error;
        }
    }

    // Atualizar vínculo
    async update(id, vinculoData) {
        try {
            const filtro = { id: parseInt(id) };
            const dadosAtualizados = {
                ...vinculoData,
                __editado: new Date()
            };

            const resultado = await db.atualizaUm(this.collectionName, filtro, { $set: dadosAtualizados }, true);
            return resultado;
        } catch (error) {
            console.error("Erro ao atualizar vínculo:", error);
            throw error;
        }
    }

    // Deletar vínculo (soft delete)
    async delete(id) {
        try {
            const filtro = { id: parseInt(id) };
            const resultado = await db.atualizaUm(this.collectionName, filtro, { $set: { ativo: false, __editado: new Date() } }, true);
            return resultado;
        } catch (error) {
            console.error("Erro ao deletar vínculo:", error);
            throw error;
        }
    }

    // Buscar vínculos por usuário
    async findByUsuario(idUsuario) {
        try {
            const agg = [
                { $match: { idUsuario: parseInt(idUsuario), ativo: true } },
                { $sort: { id: 1 } }
            ];
            const vinculos = await db.findColecaoAgg(this.collectionName, agg);
            return vinculos || [];
        } catch (error) {
            console.error("Erro ao buscar vínculos por usuário:", error);
            throw error;
        }
    }

    // Buscar vínculos por instituição
    async findByInstituicao(idInstituicao) {
        try {
            const agg = [
                { $match: { idInstituicao: parseInt(idInstituicao), ativo: true } },
                { $sort: { id: 1 } }
            ];
            const vinculos = await db.findColecaoAgg(this.collectionName, agg);
            return vinculos || [];
        } catch (error) {
            console.error("Erro ao buscar vínculos por instituição:", error);
            throw error;
        }
    }

    // Buscar vínculos por usuário e instituição
    async findByUsuarioAndInstituicao(idUsuario, idInstituicao) {
        try {
            const agg = [
                { $match: { 
                    idUsuario: parseInt(idUsuario), 
                    idInstituicao: parseInt(idInstituicao), 
                    ativo: true 
                }},
                { $sort: { id: 1 } }
            ];
            const vinculos = await db.findColecaoAgg(this.collectionName, agg);
            return vinculos || [];
        } catch (error) {
            console.error("Erro ao buscar vínculos por usuário e instituição:", error);
            throw error;
        }
    }

    // Formatar vínculo para frontend
    async formatVinculoForFrontend(vinculo) {
        if (!vinculo) return null;
        
        try {
            // Buscar dados do usuário
            let usuario = await db.findOne("usuarios", { id: vinculo.idUsuario, ativo: true });
            
            // Se não encontrou usuário ativo, tenta buscar sem filtro de ativo
            if (!usuario) {
                usuario = await db.findOne("usuarios", { id: vinculo.idUsuario });
            }
            
            // Buscar dados da instituição
            let instituicao = await db.findOne("instituicoes", { id: vinculo.idInstituicao, ativo: true });
            
            // Se não encontrou instituição ativa, tenta buscar sem filtro de ativo
            if (!instituicao) {
                instituicao = await db.findOne("instituicoes", { id: vinculo.idInstituicao });
            }
            
            return {
                id: vinculo.id,
                idUsuario: vinculo.idUsuario,
                usuario: usuario ? {
                    id: usuario.id,
                    nome: usuario.nome || usuario.userName || `Usuário ${usuario.id}`,
                    userName: usuario.userName,
                    email: usuario.email,
                    ativo: usuario.ativo
                } : {
                    // Fallback quando usuário não é encontrado
                    id: vinculo.idUsuario,
                    nome: `Usuário ${vinculo.idUsuario}`,
                    userName: `user_${vinculo.idUsuario}`,
                    email: `user_${vinculo.idUsuario}@example.com`,
                    ativo: false
                },
                idInstituicao: vinculo.idInstituicao,
                instituicao: instituicao ? {
                    id: instituicao.id,
                    nome: instituicao.nome,
                    subdominio: instituicao.subdominio,
                    tipo: instituicao.tipo,
                    ativo: instituicao.ativo
                } : {
                    // Fallback quando instituição não é encontrada
                    id: vinculo.idInstituicao,
                    nome: `Instituição ${vinculo.idInstituicao}`,
                    subdominio: `inst_${vinculo.idInstituicao}`,
                    tipo: "desconhecido",
                    ativo: false
                },
                perfil: vinculo.perfil,
                idPerfil: vinculo.idPerfil,
                ativo: vinculo.ativo,
                createdAt: vinculo.__new,
                updatedAt: vinculo.__editado
            };
        } catch (error) {
            console.error("Erro ao formatar vínculo:", error);
            // Retornar dados básicos em caso de erro
            return {
                id: vinculo.id,
                idUsuario: vinculo.idUsuario,
                usuario: {
                    id: vinculo.idUsuario,
                    nome: `Usuário ${vinculo.idUsuario}`,
                    userName: `user_${vinculo.idUsuario}`,
                    email: `user_${vinculo.idUsuario}@example.com`,
                    ativo: false
                },
                idInstituicao: vinculo.idInstituicao,
                instituicao: {
                    id: vinculo.idInstituicao,
                    nome: `Instituição ${vinculo.idInstituicao}`,
                    subdominio: `inst_${vinculo.idInstituicao}`,
                    tipo: "desconhecido",
                    ativo: false
                },
                perfil: vinculo.perfil,
                idPerfil: vinculo.idPerfil,
                ativo: vinculo.ativo,
                createdAt: vinculo.__new,
                updatedAt: vinculo.__editado
            };
        }
    }
}

module.exports = new VinculoModel(); 