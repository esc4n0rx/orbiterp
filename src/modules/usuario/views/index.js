/**
 * Gerenciador de Views do Módulo Usuário
 */

const registroView = require('./v-usuario-registro.json');

const views = {
  'v-usuario-registro': registroView
};

/**
 * Obtém todas as views do módulo
 * @returns {Object} Objeto com todas as views
 */
function getViews() {
  return views;
}

/**
 * Obtém uma view específica
 * @param {string} viewId - ID da view
 * @returns {Object|null} View encontrada ou null
 */
function getView(viewId) {
  return views[viewId] || null;
}

/**
 * Lista todas as views disponíveis
 * @returns {Array<Object>} Array com metadados das views
 */
function getAllViews() {
  return Object.keys(views).map(viewId => {
    const view = views[viewId];
    return {
      id: view.id,
      title: view.title,
      alias: view.alias,
      code: view.code,
      type: view.type,
      module: view.module,
      category: view.category,
      description: view.description
    };
  });
}

/**
 * Obtém view por alias
 * @param {string} alias - Alias da view
 * @returns {Object|null} View encontrada ou null
 */
function getViewByAlias(alias) {
  return Object.values(views).find(view => view.alias === alias) || null;
}

/**
 * Obtém view por código
 * @param {string} code - Código da view
 * @returns {Object|null} View encontrada ou null
 */
function getViewByCode(code) {
  return Object.values(views).find(view => view.code === code) || null;
}

module.exports = {
  getViews,
  getView,
  getAllViews,
  getViewByAlias,
  getViewByCode
};