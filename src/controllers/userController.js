const UserModel = require('../models/userModel');
const { formatCPF, formatCEP } = require('../utils/validators');
const { USER_STATUS } = require('../types/userTypes');

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
            username: user.username,
            cpf: formatCPF(user.cpf),
            role: user.role,
            cargo: user.cargo,
            telefone: user.telefone,
            status: user.status,
            statusLogin: user.statusLogin,
            endereco: user.endereco,
            numero: user.numero,
            complemento: user.complemento,
            bairro: user.bairro,
            cidade: user.cidade,
            estado: user.estado,
            cep: user.cep ? formatCEP(user.cep) : null,
            modulosLiberados: user.modulosLiberados,
            viewsLiberadas: user.viewsLiberadas,
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

  /**
   * Lista usuários com paginação e filtros
   * GET /api/users
   */
  static async listUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = null,
        role = null,
        orderBy = 'createdAt',
        orderDirection = 'desc'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        role,
        orderBy,
        orderDirection
      };

      const result = await UserModel.findAll(options);

      // Formata dados dos usuários
      const formattedUsers = result.users.map(user => ({
        ...user,
        cpf: formatCPF(user.cpf)
      }));

      res.json({
        success: true,
        data: {
          users: formattedUsers,
          pagination: result.pagination
        }
      });

    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca usuário por ID
   * GET /api/users/:id
   */
  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuário inválido'
        });
      }

      const user = await UserModel.findById(parseInt(id));

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Formata dados do usuário
      const formattedUser = {
        ...user,
        cpf: formatCPF(user.cpf),
        cep: user.cep ? formatCEP(user.cep) : null
      };

      res.json({
        success: true,
        data: {
          user: formattedUser
        }
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza status do usuário
   * PATCH /api/users/:id/status
   */
  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuário inválido'
        });
      }

      if (!Object.values(USER_STATUS).includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
      }

      const userId = parseInt(id);

      // Verifica se o usuário existe
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Não permite que um usuário altere seu próprio status
      if (user.id === req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Não é possível alterar seu próprio status'
        });
      }

      // Apenas adminall pode alterar status de outros adminall
      if (user.role === 'adminall' && req.user.role !== 'adminall') {
        return res.status(403).json({
          success: false,
          message: 'Apenas super administradores podem alterar status de outros super administradores'
        });
      }

      // Atualiza status e força logout se inativado/suspenso
      const updateData = { status };
      if (status !== USER_STATUS.ATIVO) {
        updateData.statusLogin = 'OFFLINE';
      }

      const updatedUser = await UserModel.update(userId, updateData);

      res.json({
        success: true,
        message: 'Status do usuário atualizado com sucesso',
        data: {
          user: {
            ...updatedUser,
            cpf: formatCPF(updatedUser.cpf),
            cep: updatedUser.cep ? formatCEP(updatedUser.cep) : null
          }
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Força logout de um usuário
   * POST /api/users/:id/force-logout
   */
  static async forceLogout(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuário inválido'
        });
      }

      const userId = parseInt(id);

      // Verifica se o usuário existe
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Não permite que um usuário force logout de si mesmo
      if (user.id === req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Não é possível forçar logout de si mesmo'
        });
      }

      // Apenas adminall pode forçar logout de outros adminall
      if (user.role === 'adminall' && req.user.role !== 'adminall') {
        return res.status(403).json({
          success: false,
          message: 'Apenas super administradores podem forçar logout de outros super administradores'
        });
      }

      // Força logout
      await UserModel.updateLoginStatus(userId, 'OFFLINE');

      res.json({
        success: true,
        message: 'Logout forçado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao forçar logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = UserController;