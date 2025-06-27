/**
 * Módulo de Usuário
 * Responsável por gerenciar usuários do sistema
 */

const views = require('./views');

const usuarioModule = {
  name: 'usuario',
  title: 'Gestão de Usuários',
  description: 'Módulo responsável pelo cadastro, edição e gerenciamento de usuários do sistema',
  version: '1.0.0',
  icon: 'users',
  color: '#3B82F6',
  category: 'Administração',
  permissions: {
    required: ['admin', 'adminall'],
    optional: ['manager']
  },
  routes: [
    '/api/register',
    '/api/users',
    '/api/session'
  ],
  views: views.getViews(),
  
  /**
   * Obtém metadados do módulo
   */
  getMetadata() {
    return {
      name: this.name,
      title: this.title,
      description: this.description,
      version: this.version,
      icon: this.icon,
      color: this.color,
      category: this.category,
      viewCount: Object.keys(this.views).length,
      routeCount: this.routes.length
    };
  },

  /**
   * Obtém view específica do módulo
   * @param {string} viewId - ID da view
   */
  getView(viewId) {
    return views.getView(viewId);
  },

  /**
   * Lista todas as views do módulo
   */
  getAllViews() {
    return views.getAllViews();
  }
};

module.exports = usuarioModule;