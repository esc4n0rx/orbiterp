/**
 * Índice principal dos módulos do sistema
 */

const usuarioModule = require('./usuario');

const modules = {
  usuario: usuarioModule
};

/**
 * Obtém todos os módulos disponíveis
 * @returns {Object} Objeto com todos os módulos
 */
function getAllModules() {
  return modules;
}

/**
 * Obtém um módulo específico
 * @param {string} moduleName - Nome do módulo
 * @returns {Object|null} Módulo encontrado ou null
 */
function getModule(moduleName) {
  return modules[moduleName] || null;
}

/**
 * Lista todos os nomes de módulos
 * @returns {Array<string>} Array com nomes dos módulos
 */
function getModuleNames() {
  return Object.keys(modules);
}

module.exports = {
  getAllModules,
  getModule,
  getModuleNames,
  modules
};