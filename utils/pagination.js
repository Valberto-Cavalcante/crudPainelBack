// Este arquivo contém utilitários para paginação de dados em APIs e aplicações.
// Fornece funções para calcular informações de paginação, como página atual,
// total de itens, itens por página, total de páginas, e se há próxima ou anterior.
// Também inclui método para formatar respostas paginadas de forma padronizada,
// facilitando a integração com frontends e documentação de APIs.
// Ideal para endpoints que retornam listas grandes e precisam de navegação.
// Permite customizar limites e fornece informações úteis para UX.
//
// Funções principais:
// - getPaginationInfo: calcula dados de paginação a partir de parâmetros.
// - formatPaginatedResponse: monta objeto de resposta paginada.
//
// Utilitário para paginação
class PaginationUtils {
    // Calcular informações de paginação
    static getPaginationInfo(page = 1, limit = 15, totalItems = 0) {
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit) || 15;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const skip = (currentPage - 1) * itemsPerPage;
        
        return {
            currentPage,
            itemsPerPage,
            totalItems,
            totalPages,
            skip,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1
        };
    }

    // Formatar resposta paginada
    static formatPaginatedResponse(data, paginationInfo) {
        return {
            success: true,
            data: data,
            pagination: {
                currentPage: paginationInfo.currentPage,
                itemsPerPage: paginationInfo.itemsPerPage,
                totalItems: paginationInfo.totalItems,
                totalPages: paginationInfo.totalPages,
                hasNextPage: paginationInfo.hasNextPage,
                hasPrevPage: paginationInfo.hasPrevPage
            }
        };
    }

    // Validar parâmetros de paginação
    static validatePaginationParams(page, limit) {
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit) || 15;
        
        // Limitar o número máximo de itens por página
        const maxItemsPerPage = 50;
        const validatedLimit = Math.min(itemsPerPage, maxItemsPerPage);
        
        return {
            page: Math.max(1, currentPage),
            limit: Math.max(1, validatedLimit)
        };
    }
}

module.exports = PaginationUtils; 