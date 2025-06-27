const UserModel = require('../models/userModel');

class UserController {
  /**
   * Verifica sessão atual
   * GET /api/session
   */
  static async getSession(req, res) {
    try {
      const user = req.user;

      res.json({
        success: true,
        message: 'Sessão válida',
        data: {
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.role,
            statusLogin: user.statusLogin,
            createdAt: user.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = UserController;