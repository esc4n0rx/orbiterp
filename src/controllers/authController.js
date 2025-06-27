const UserModel = require('../models/userModel');
const { comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

class AuthController {
  /**
   * Login do usuário
   * POST /api/login
   */
  static async login(req, res) {
    try {
      const { user, senha } = req.body;

      // Validação básica
      if (!user || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Usuário e senha são obrigatórios'
        });
      }

      // Busca usuário por email
      const foundUser = await UserModel.findByEmail(user);
      
      if (!foundUser) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Verifica senha
      const isPasswordValid = await comparePassword(senha, foundUser.senha);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Verifica se já está logado (exceto adminall)
      if (foundUser.role !== 'adminall' && foundUser.statusLogin === 'LOGADO') {
        return res.status(409).json({
          success: false,
          message: 'Usuário já possui uma sessão ativa'
        });
      }

      // Atualiza status para logado
      await UserModel.updateLoginStatus(foundUser.id, 'LOGADO');

      // Gera token JWT
      const token = generateToken({
        userId: foundUser.id,
        email: foundUser.email,
        role: foundUser.role
      });

      // Retorna sucesso com token
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: {
            id: foundUser.id,
            nome: foundUser.nome,
            email: foundUser.email,
            role: foundUser.role
          }
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Logout do usuário
   * POST /api/logout
   */
  static async logout(req, res) {
    try {
      const userId = req.user.id;

      // Atualiza status para offline
      await UserModel.updateLoginStatus(userId, 'OFFLINE');

      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = AuthController;