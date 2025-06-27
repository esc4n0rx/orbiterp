const { verifyToken } = require('../utils/jwt');
const UserModel = require('../models/userModel');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e se o usuário está logado
 */
async function authMiddleware(req, res, next) {
  try {
    // Extrai token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verifica e decodifica o token
    const decoded = verifyToken(token);
    
    // Busca usuário no banco para verificar se ainda existe e está logado
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verifica se o usuário está com status logado (exceto adminall)
    if (user.role !== 'adminall' && user.statusLogin !== 'LOGADO') {
      return res.status(401).json({
        success: false,
        message: 'Sessão expirada. Faça login novamente'
      });
    }

    // Adiciona dados do usuário ao request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

module.exports = authMiddleware;