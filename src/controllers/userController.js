const UserModel = require('../models/userModel');
const { hashPassword } = require('../utils/password');
const { 
  formatCPF, 
  formatCEP, 
  validateCPF, 
  validateEmail, 
  validateUsername, 
  validatePhone, 
  validateCEP,
  validatePermissions 
} = require('../utils/validators');
const { USER_STATUS, USER_ROLES, ESTADOS_BRASIL } = require('../types/userTypes');

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
   * Busca usuários por nome ou CPF
   * POST /api/users/search
   */
  static async searchUsers(req, res) {
    try {
      const { nome, cpf } = req.body;

      if (!nome && !cpf) {
        return res.status(400).json({
          success: false,
          message: 'Nome ou CPF é obrigatório para busca'
        });
      }

      // Monta filtros de busca
      const searchFilters = {};
      
      if (nome) {
        searchFilters.nome = nome.trim();
      }
      
      if (cpf) {
        const cleanCPF = cpf.replace(/[^\d]/g, '');
        if (cleanCPF) {
          searchFilters.cpf = cleanCPF;
        }
      }

      const users = await UserModel.searchUsers(searchFilters);

      // Formata dados para exibição
      const formattedUsers = users.map(user => ({
        id: user.id,
        nome: user.nome,
        email: user.email,
        username: user.username,
        cpf: formatCPF(user.cpf),
        role: user.role,
        status: user.status,
        statusLogin: user.statusLogin,
        createdAt: user.createdAt
      }));

      res.json({
        success: true,
        data: {
          users: formattedUsers,
          total: formattedUsers.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
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
        cpf: formatCPF(user.cpf),
        cep: user.cep ? formatCEP(user.cep) : null
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
   * Atualiza dados do usuário
   * PUT /api/users/:id
   */
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        email,
        username,
        cpf,
        senha,
        role,
        cargo,
        telefone,
        status,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        modulosLiberados,
        viewsLiberadas,
        observacoes
      } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuário inválido'
        });
      }

      const userId = parseInt(id);

      // Verifica se o usuário existe
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Validações de permissão
      if (existingUser.role === 'adminall' && req.user.role !== 'adminall') {
        return res.status(403).json({
          success: false,
          message: 'Apenas super administradores podem editar outros super administradores'
        });
      }

      // Não permite que usuário altere próprio role ou status
      if (existingUser.id === req.user.id) {
        if (role && role !== existingUser.role) {
          return res.status(403).json({
            success: false,
            message: 'Não é possível alterar seu próprio nível de acesso'
          });
        }
        if (status && status !== existingUser.status) {
          return res.status(403).json({
            success: false,
            message: 'Não é possível alterar seu próprio status'
          });
        }
      }

      // Prepara dados para atualização
      const updateData = {};

      // Validações e formatação de campos
      if (nome !== undefined) {
        if (!nome || nome.trim().split(' ').length < 2) {
          return res.status(400).json({
            success: false,
            message: 'Nome completo é obrigatório (nome e sobrenome)'
          });
        }
        updateData.nome = nome.trim();
      }

      if (email !== undefined) {
        if (!validateEmail(email)) {
          return res.status(400).json({
            success: false,
            message: 'Email inválido'
          });
        }
        
        // Verifica disponibilidade do email
        const emailExists = await UserModel.isEmailAvailable(email, userId);
        if (!emailExists) {
          return res.status(409).json({
            success: false,
            message: 'Email já está em uso por outro usuário'
          });
        }
        updateData.email = email.toLowerCase().trim();
      }

      if (username !== undefined) {
        if (!validateUsername(username)) {
          return res.status(400).json({
            success: false,
            message: 'Username deve ter entre 3 e 30 caracteres, apenas letras, números e underscore'
          });
        }
        
        // Verifica disponibilidade do username
        const usernameExists = await UserModel.isUsernameAvailable(username, userId);
        if (!usernameExists) {
          return res.status(409).json({
            success: false,
            message: 'Username já está em uso por outro usuário'
          });
        }
        updateData.username = username.trim();
      }

      if (cpf !== undefined) {
        const cleanCPF = cpf.replace(/[^\d]/g, '');
        if (!validateCPF(cleanCPF)) {
          return res.status(400).json({
            success: false,
            message: 'CPF inválido'
          });
        }
        
        // Verifica disponibilidade do CPF
        const cpfExists = await UserModel.isCPFAvailable(cleanCPF, userId);
        if (!cpfExists) {
          return res.status(409).json({
            success: false,
            message: 'CPF já está em uso por outro usuário'
          });
        }
        updateData.cpf = cleanCPF;
      }

      if (senha !== undefined && senha.trim()) {
        if (senha.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'Senha deve ter pelo menos 6 caracteres'
          });
        }
        updateData.senha = await hashPassword(senha);
      }

      if (role !== undefined) {
        if (!Object.values(USER_ROLES).includes(role)) {
          return res.status(400).json({
            success: false,
            message: 'Role inválida'
          });
        }
        
        // Apenas adminall pode definir role adminall
        if (role === USER_ROLES.ADMINALL && req.user.role !== USER_ROLES.ADMINALL) {
          return res.status(403).json({
            success: false,
            message: 'Apenas super administradores podem definir outros super administradores'
          });
        }
        updateData.role = role;
      }

      if (status !== undefined) {
        if (!Object.values(USER_STATUS).includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Status inválido'
          });
        }
        updateData.status = status;
        
        // Se inativando/suspendendo, força logout
        if (status !== USER_STATUS.ATIVO) {
          updateData.statusLogin = 'OFFLINE';
        }
      }

      // Campos opcionais
      if (cargo !== undefined) updateData.cargo = cargo?.trim() || null;
      
      if (telefone !== undefined) {
        if (telefone && !validatePhone(telefone)) {
          return res.status(400).json({
            success: false,
            message: 'Telefone inválido'
          });
        }
        updateData.telefone = telefone?.replace(/[^\d]/g, '') || null;
      }

      // Campos de endereço
      if (endereco !== undefined) updateData.endereco = endereco?.trim() || null;
      if (numero !== undefined) updateData.numero = numero?.trim() || null;
      if (complemento !== undefined) updateData.complemento = complemento?.trim() || null;
      if (bairro !== undefined) updateData.bairro = bairro?.trim() || null;
      if (cidade !== undefined) updateData.cidade = cidade?.trim() || null;
      
      if (estado !== undefined) {
        if (estado && !ESTADOS_BRASIL.includes(estado.toUpperCase())) {
          return res.status(400).json({
            success: false,
            message: 'Estado inválido'
          });
        }
        updateData.estado = estado?.toUpperCase() || null;
      }
      
      if (cep !== undefined) {
        if (cep && !validateCEP(cep)) {
          return res.status(400).json({
            success: false,
            message: 'CEP inválido'
          });
        }
        updateData.cep = cep?.replace(/[^\d]/g, '') || null;
      }

      // Permissões
      if (modulosLiberados !== undefined) {
        if (!validatePermissions(modulosLiberados)) {
          return res.status(400).json({
            success: false,
            message: 'Estrutura de módulos liberados inválida'
          });
        }
        updateData.modulosLiberados = modulosLiberados;
      }

      if (viewsLiberadas !== undefined) {
        if (!validatePermissions(viewsLiberadas)) {
          return res.status(400).json({
            success: false,
            message: 'Estrutura de views liberadas inválida'
          });
        }
        updateData.viewsLiberadas = viewsLiberadas;
      }

      if (observacoes !== undefined) {
        updateData.observacoes = observacoes?.trim() || null;
      }

      // Atualiza usuário
      const updatedUser = await UserModel.update(userId, updateData);

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: {
          user: {
            ...updatedUser,
            cpf: formatCPF(updatedUser.cpf),
            cep: updatedUser.cep ? formatCEP(updatedUser.cep) : null
          }
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
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
   * Remove usuário (soft delete)
   * DELETE /api/users/:id
   */
  static async deleteUser(req, res) {
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

      // Não permite que um usuário delete a si mesmo
      if (user.id === req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Não é possível remover seu próprio usuário'
        });
      }

      // Apenas adminall pode remover outros adminall
      if (user.role === 'adminall' && req.user.role !== 'adminall') {
        return res.status(403).json({
          success: false,
          message: 'Apenas super administradores podem remover outros super administradores'
        });
      }

      // Verifica se é o último adminall do sistema
      if (user.role === 'adminall') {
        const adminallCount = await UserModel.countByRole('adminall');
        if (adminallCount <= 1) {
          return res.status(403).json({
            success: false,
            message: 'Não é possível remover o último super administrador do sistema'
          });
        }
      }

      // Soft delete - inativa o usuário
      await UserModel.softDelete(userId);

      res.json({
        success: true,
        message: 'Usuário removido com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover usuário:', error);
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

  /**
   * Ações em lote para usuários
   * POST /api/users/batch
   */
  static async batchActions(req, res) {
    try {
      const { action, userIds, data } = req.body;

      if (!action || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Ação e lista de usuários são obrigatórios'
        });
      }

      // Valida IDs
      const validIds = userIds.filter(id => !isNaN(id)).map(id => parseInt(id));
      if (validIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum ID de usuário válido fornecido'
        });
      }

      // Busca usuários
      const users = await Promise.all(
        validIds.map(id => UserModel.findById(id))
      );
      const existingUsers = users.filter(user => user !== null);

      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Nenhum usuário encontrado'
        });
      }

      // Verifica permissões para cada usuário
      for (const user of existingUsers) {
        // Não pode executar ações em si mesmo
        if (user.id === req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Não é possível executar ações em lote no seu próprio usuário'
          });
        }

        // Apenas adminall pode executar ações em outros adminall
        if (user.role === 'adminall' && req.user.role !== 'adminall') {
          return res.status(403).json({
            success: false,
            message: 'Apenas super administradores podem executar ações em outros super administradores'
          });
        }
      }

      let results = [];

      switch (action) {
        case 'updateStatus':
          if (!data?.status || !Object.values(USER_STATUS).includes(data.status)) {
            return res.status(400).json({
              success: false,
              message: 'Status válido é obrigatório'
            });
          }

          for (const user of existingUsers) {
            try {
              const updateData = { status: data.status };
              if (data.status !== USER_STATUS.ATIVO) {
                updateData.statusLogin = 'OFFLINE';
              }
              
              await UserModel.update(user.id, updateData);
              results.push({ id: user.id, success: true });
            } catch (error) {
              results.push({ id: user.id, success: false, error: error.message });
            }
          }
          break;

        case 'forceLogout':
          for (const user of existingUsers) {
            try {
              await UserModel.updateLoginStatus(user.id, 'OFFLINE');
              results.push({ id: user.id, success: true });
            } catch (error) {
              results.push({ id: user.id, success: false, error: error.message });
            }
          }
          break;

        case 'delete':
          for (const user of existingUsers) {
            try {
              // Verifica se é o último adminall
              if (user.role === 'adminall') {
                const adminallCount = await UserModel.countByRole('adminall');
                if (adminallCount <= 1) {
                  results.push({ 
                    id: user.id, 
                    success: false, 
                    error: 'Não é possível remover o último super administrador' 
                  });
                  continue;
                }
              }

              await UserModel.softDelete(user.id);
              results.push({ id: user.id, success: true });
            } catch (error) {
              results.push({ id: user.id, success: false, error: error.message });
            }
          }
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Ação não suportada'
          });
      }

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      res.json({
        success: true,
        message: `Ação executada. ${successCount} sucessos, ${errorCount} erros`,
        data: {
          results,
          summary: {
            total: results.length,
            success: successCount,
            errors: errorCount
          }
        }
      });

    } catch (error) {
      console.error('Erro em ação em lote:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Exporta lista de usuários
   * GET /api/users/export
   */
  static async exportUsers(req, res) {
    try {
      const {
        format = 'json',
        status = null,
        role = null
      } = req.query;

      const options = {
        page: 1,
        limit: 10000, // Limite alto para exportação
        search: '',
        status,
        role,
        orderBy: 'nome',
        orderDirection: 'asc'
      };

      const result = await UserModel.findAll(options);

      // Formata dados para exportação
      const exportData = result.users.map(user => ({
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
        cidade: user.cidade,
        estado: user.estado,
        criadoEm: user.createdAt,
        atualizadoEm: user.updatedAt
      }));

      if (format === 'json') {
        res.json({
          success: true,
          data: {
            users: exportData,
            total: exportData.length,
            exportedAt: new Date().toISOString()
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Formato de exportação não suportado'
        });
      }

    } catch (error) {
      console.error('Erro ao exportar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = UserController;