const { USER_ROLES } = require('../types/userTypes');

/**
 * Middleware para verificar se o usuário tem permissões de administrador
 * Permite apenas adminall e admin
 */
function adminMiddleware(req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Verifica se o usuário tem role de administrador
    if (user.role !== USER_ROLES.ADMINALL && user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissões de administrador necessárias'
      });
    }

    next();

  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Middleware para verificar se o usuário é adminall (super admin)
 */
function superAdminMiddleware(req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Verifica se o usuário é adminall
    if (user.role !== USER_ROLES.ADMINALL) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas super administradores podem realizar esta ação'
      });
    }

    next();

  } catch (error) {
    console.error('Erro no middleware de super admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

module.exports = {
  adminMiddleware,
  superAdminMiddleware
};