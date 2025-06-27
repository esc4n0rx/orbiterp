const moduleManager = require('../modules');

class ViewController {
  /**
   * Obtém uma view específica
   * GET /api/views/:viewId
   */
  static async getView(req, res) {
    try {
      const { viewId } = req.params;

      if (!viewId) {
        return res.status(400).json({
          success: false,
          message: 'ID da view é obrigatório'
        });
      }

      // Busca a view em todos os módulos
      let foundView = null;
      const modules = moduleManager.getAllModules();

      for (const [moduleName, module] of Object.entries(modules)) {
        const view = module.getView(viewId);
        if (view) {
          foundView = view;
          break;
        }
      }

      if (!foundView) {
        return res.status(404).json({
          success: false,
          message: 'View não encontrada'
        });
      }

      // Verifica permissões se necessário
      if (foundView.auth && foundView.permissions) {
        const userRole = req.user?.role;
        
        // Verifica se o usuário tem as permissões necessárias
        if (foundView.permissions.required && !foundView.permissions.required.includes(userRole)) {
          return res.status(403).json({
            success: false,
            message: 'Permissões insuficientes para acessar esta view'
          });
        }

        // Verifica se o usuário não está nas permissões proibidas
        if (foundView.permissions.forbidden && foundView.permissions.forbidden.includes(userRole)) {
          return res.status(403).json({
            success: false,
            message: 'Acesso negado para esta view'
          });
        }
      }

      res.json({
        success: true,
        data: {
          view: foundView
        }
      });

    } catch (error) {
      console.error('Erro ao buscar view:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém view por alias
   * GET /api/views/alias/:alias
   */
  static async getViewByAlias(req, res) {
    try {
      const { alias } = req.params;

      if (!alias) {
        return res.status(400).json({
          success: false,
          message: 'Alias da view é obrigatório'
        });
      }

      // Busca a view por alias em todos os módulos
      let foundView = null;
      const modules = moduleManager.getAllModules();

      for (const [moduleName, module] of Object.entries(modules)) {
        const views = module.getAllViews();
        const view = views.find(v => v.alias === alias);
        if (view) {
          foundView = module.getView(view.id);
          break;
        }
      }

      if (!foundView) {
        return res.status(404).json({
          success: false,
          message: 'View não encontrada'
        });
      }

      res.json({
        success: true,
        data: {
          view: foundView
        }
      });

    } catch (error) {
      console.error('Erro ao buscar view por alias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Lista todas as views disponíveis
   * GET /api/views
   */
  static async listViews(req, res) {
    try {
      const { module: moduleFilter, category, type } = req.query;

      let allViews = [];
      const modules = moduleManager.getAllModules();

      // Coleta todas as views de todos os módulos
      for (const [moduleName, module] of Object.entries(modules)) {
        const moduleViews = module.getAllViews().map(view => ({
          ...view,
          module: moduleName
        }));
        allViews = allViews.concat(moduleViews);
      }

      // Aplica filtros se fornecidos
      if (moduleFilter) {
        allViews = allViews.filter(view => view.module === moduleFilter);
      }

      if (category) {
        allViews = allViews.filter(view => view.category === category);
      }

      if (type) {
        allViews = allViews.filter(view => view.type === type);
      }

      res.json({
        success: true,
        data: {
          views: allViews,
          total: allViews.length,
          modules: Object.keys(modules)
        }
      });

    } catch (error) {
      console.error('Erro ao listar views:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém informações de um módulo específico
   * GET /api/modules/:moduleName
   */
  static async getModule(req, res) {
    try {
      const { moduleName } = req.params;

      const module = moduleManager.getModule(moduleName);
      
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Módulo não encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          module: module.getMetadata(),
          views: module.getAllViews()
        }
      });

    } catch (error) {
      console.error('Erro ao buscar módulo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Lista todos os módulos disponíveis
   * GET /api/modules
   */
  static async listModules(req, res) {
    try {
      const modules = moduleManager.getAllModules();
      const moduleList = Object.keys(modules).map(moduleName => {
        const module = modules[moduleName];
        return module.getMetadata();
      });

      res.json({
        success: true,
        data: {
          modules: moduleList,
          total: moduleList.length
        }
      });

    } catch (error) {
      console.error('Erro ao listar módulos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = ViewController;