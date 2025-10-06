
// Este arquivo tem como finalidade centralizar as operações de acesso ao banco de dados MongoDB.
// Aqui estão implementadas funções utilitárias para conexão, busca, inserção, atualização e exclusão (soft delete) de documentos.
// As principais funcionalidades incluem:
// - Conexão singleton com o banco de dados para evitar múltiplas conexões.
// - Métodos para buscar documentos por critérios, ID, agregações e com paginação.
// - Inserção e atualização de documentos com suporte a auditoria (LCMS).
// - Soft delete, marcando documentos como excluídos sem removê-los fisicamente.
// - Contagem de documentos com e sem filtro de exclusão lógica.
// - Funções genéricas para facilitar o reuso em diferentes coleções.
//
// O objetivo é fornecer uma interface consistente e reutilizável para manipulação dos dados da aplicação.

const { MongoClient } = require("mongodb");

let singleton;

async function connect() {
    if (singleton) return singleton;

    try {
        // Verificar se as variáveis de ambiente obrigatórias estão definidas
        if (!process.env.MONGO_DATABASE) {
            throw new Error('MONGO_DATABASE environment variable is required. Please set it in your .env file.');
        }

        const client = new MongoClient(process.env.MONGO_HOST || 'mongodb://localhost:27017');
        await client.connect();

        const dbName = process.env.MONGO_DATABASE; 
        singleton = client.db(dbName);
        
        return singleton;
    } catch (error) {
        console.error('Erro ao conectar com MongoDB:', error);
        throw error;
    }
}

// Buscar um documento por critérios
async function findOne(vNomeCol, vConsulta) {
    try {
        const dbMongo = await connect();
        const query = {
            ...vConsulta,
        };
       
        return await dbMongo.collection(vNomeCol).findOne(query);
    } catch (error) {
        console.error(`Erro ao buscar documento na coleção ${vNomeCol}:`, error);
        throw error;
    }
}

// Achar último registro baseado no id
async function acharUltimo(vNomeCol, vConsulta) {
    try {
        const dbMongo = await connect();
        console.log(`🔍 acharUltimo - Coleção: ${vNomeCol}, Consulta:`, vConsulta);
        const result = await dbMongo.collection(vNomeCol).findOne(vConsulta, { sort: { id: -1 } });
        console.log(`📊 acharUltimo - Resultado:`, result);
        return result;
    } catch (error) {
        console.error(`Erro ao buscar último registro na coleção ${vNomeCol}:`, error);
        return null;
    }
}

// Buscar por ID
async function findColecaoID(vNomeCol, vID) {
    try {
        const dbMongo = await connect();
        return dbMongo.collection(vNomeCol).findOne({
            id: vID
        });
    } catch (error) {
        console.error(`Erro ao buscar documento por ID na coleção ${vNomeCol}:`, error);
        throw error;
    }
}

// Buscar coleção com paginação
async function findColecaoIDPaginated(vNomeCol, vConsulta = {}, skip = 0, limit = 15) {
    try {
        const dbMongo = await connect();
        return dbMongo.collection(vNomeCol)
            .find(vConsulta)
            .skip(skip)
            .limit(limit)
            .toArray();
    } catch (error) {
        console.error(`Erro ao buscar documentos paginados na coleção ${vNomeCol}:`, error);
        throw error;
    }
}

// Buscar com agregação
async function findColecaoAgg(vNomeCol, vAgg) {
    try {
        const dbMongo = await connect();
        return dbMongo.collection(vNomeCol).aggregate(vAgg).toArray();
    } catch (error) {
        console.error(`Erro ao buscar documentos com agregação na coleção ${vNomeCol}:`, error);
        throw error;
    }
}

// Atualizar um documento
async function update(vNomeCol, vFiltro, vValores) {
    try {
        const dbMongo = await connect();
        const resultado = await dbMongo.collection(vNomeCol).updateOne(vFiltro, { $set: vValores });
        return {
            matchedCount: resultado.matchedCount,
            modifiedCount: resultado.modifiedCount
        };
    } catch (error) {
        console.error(`Erro ao atualizar documento na coleção ${vNomeCol}:`, error);
        throw error;
    }
}

// Inserir um documento
async function insert(vNomeCol, vJson, vLCMS) {
    try {
        const dbMongo = await connect();
        
        if (!vLCMS || vNomeCol == "lcms") {
            return dbMongo.collection(vNomeCol).insertOne(vJson);
        }

        // Com LCMS
        if (vJson.__new) vJson.__editado = vJson.__new;
        else vJson.__editado = new Date();

        const refInsert = await dbMongo.collection(vNomeCol).insertOne(vJson);
        const ultimoSalvo = { _idColecao: refInsert.insertedId, ...vJson };

        const objLCMS = { __colecao: vNomeCol, __crud: "CREATE", ...ultimoSalvo };
        if (objLCMS._id) delete objLCMS._id;

        const refSalvoLCMS = await dbMongo.collection("lcms").insertOne(objLCMS);
        refSalvoLCMS.insertedLCMS = refSalvoLCMS.insertedId;
        refSalvoLCMS.insertedId = refInsert.insertedId;

        return refSalvoLCMS;
    } catch (error) {
        console.error(`Erro ao inserir documento na coleção ${vNomeCol}:`, error);
        throw error;
    }
}

// Atualizar um documento com LCMS
async function atualizaUm(vNomeCol, vFiltro, vValores, vLCMS) {
    try {
        const dbMongo = await connect();

        const resultado = await dbMongo.collection(vNomeCol).updateOne(vFiltro, vValores);
        if (resultado.modifiedCount > 0) {
            await dbMongo.collection(vNomeCol).updateOne(vFiltro, { $set: { __editado: new Date() } });
        }

        if (!vLCMS) return resultado;

        if (resultado.modifiedCount > 0) {
            const ultimoSalvo = await findOne(vNomeCol, vFiltro);
            ultimoSalvo._idColecao = ultimoSalvo._id;
            delete ultimoSalvo._id;

            const objLCMS = { __colecao: vNomeCol, __crud: "UPDATE", ...ultimoSalvo };
            const refSalvoLCMS = await insert("lcms", objLCMS);

            refSalvoLCMS.insertedLCMS = refSalvoLCMS.insertedId;
            delete refSalvoLCMS.insertedId;
            refSalvoLCMS.modifiedCount = resultado.modifiedCount;
            
            return refSalvoLCMS;
        }

        return resultado;
    } catch (error) {
        console.error(`Erro ao atualizar documento com LCMS na coleção ${vNomeCol}:`, error);
        throw error;
    }
}

// Deletar um documento (soft delete)
async function deleteOne(vNomeCol, vFiltro) {
    try {
        const dbMongo = await connect();
        return await dbMongo.collection(vNomeCol).updateOne(vFiltro, { 
            $set: { 
                isDeleted: true,
                __editado: new Date()
            } 
        });
    } catch (error) {
        console.error(`Erro ao deletar documento na coleção ${vNomeCol}:`, error);
        throw error;
    }
}

// Buscar todos com paginação
async function findAll(pagina, collection) {
    try {
        const TAMANHO_PAGINA = 5;
        const tamanhoSkip = TAMANHO_PAGINA * (pagina - 1);
        const dbMongo = await connect();

        return dbMongo.collection(collection)
            .find({
                $or: [
                    { isDeleted: { $exists: false } },
                    { isDeleted: false }
                ]
            })
            .skip(tamanhoSkip)
            .limit(TAMANHO_PAGINA)
            .toArray();
    } catch (error) {
        console.error(`Erro ao buscar documentos na coleção ${collection}:`, error);
        throw error;
    }
}

// Buscar documentos com filtro
async function find(vNomeCol, vConsulta = {}, options = {}) {
    try {
        const dbMongo = await connect();
        const { skip = 0, limit = 0 } = options;
        
        let query = dbMongo.collection(vNomeCol).find(vConsulta);
        
        if (skip > 0) query = query.skip(skip);
        if (limit > 0) query = query.limit(limit);
        
        return query.toArray();
    } catch (error) {
        console.error(`Erro ao buscar documentos na coleção ${vNomeCol}:`, error);
        throw error;
    }
}

// Contar documentos com filtro
async function count(vNomeCol, vConsulta = {}) {
    try {
        const dbMongo = await connect();
        return dbMongo.collection(vNomeCol).countDocuments(vConsulta);
    } catch (error) {
        console.error(`Erro ao contar documentos na coleção ${vNomeCol}:`, error);
        throw error;
    }
}

// Contar todos os documentos de uma coleção
async function countAll(collection, query = {}) {
    try {
        const dbMongo = await connect();
        return dbMongo.collection(collection)
            .countDocuments({
                ...query,
                $or: [
                    { isDeleted: { $exists: false } },
                    { isDeleted: false }
                ]
            });
    } catch (error) {
        console.error(`Erro ao contar documentos na coleção ${collection}:`, error);
        throw error;
    }
}

module.exports = { 
    findOne, 
    acharUltimo, 
    findColecaoID, 
    findColecaoIDPaginated,
    findColecaoAgg, 
    update, 
    insert, 
    atualizaUm, 
    deleteOne, 
    findAll,
    find,
    count,
    countAll
};
