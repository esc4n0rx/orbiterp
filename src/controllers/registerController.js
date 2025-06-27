const UserModel = require('../models/userModel');
const { hashPassword } = require('../utils/password');
const { 
  validateCPF, 
  validateEmail, 
  validateUsername, 
  validatePhone, 
  validateCEP,
  validatePermissions,
  formatCPF,
  formatCEP
} = require('../utils/validators');
const { USER_ROLES, USER_STATUS, DEFAULT_PERMISSIONS, ESTADOS_BRASIL } = require('../types/userTypes');

class RegisterController {
  /**
   * Registra novo usuário
   * POST /api/register
   */
  static async register(req, res) {
    try {
      const {
        nome,
        email,
        username,
        cpf,
        senha,
        role = USER_ROLES.USER,
        cargo,
        telefone,
        status = USER_STATUS.ATIVO,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        modulosLiberados = DEFAULT_PERMISSIONS.modules,
        viewsLiberadas = DEFAULT_PERMISSIONS.views,
        observacoes
      } = req.body;

      // Validações obrigatórias
      if (!nome || !email || !username || !cpf || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Nome, email, username, CPF e senha são obrigatórios'
        });
      }

      // Validação de nome (mínimo 2 palavras)
      if (nome.trim().split(' ').length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Nome completo é obrigatório (nome e sobrenome)'
        });
      }

      // Validação de email
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      // Validação de username
      if (!validateUsername(username)) {
        return res.status(400).json({
          success: false,
          message: 'Username deve ter entre 3 e 30 caracteres, apenas letras, números e underscore'
        });
      }

      // Validação de CPF
      if (!validateCPF(cpf)) {
        return res.status(400).json({
          success: false,
          message: 'CPF inválido'
        });
      }

      // Validação de senha
      if (senha.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Senha deve ter pelo menos 6 caracteres'
        });
      }

      // Validação de role
      if (!Object.values(USER_ROLES).includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role inválida'
        });
      }

      // Apenas adminall pode criar outros adminall
      if (role === USER_ROLES.ADMINALL && req.user.role !== USER_ROLES.ADMINALL) {
        return res.status(403).json({
          success: false,
          message: 'Apenas super administradores podem criar outros super administradores'
        });
      }

      // Validação de telefone (opcional)
      if (telefone && !validatePhone(telefone)) {
        return res.status(400).json({
          success: false,
          message: 'Telefone inválido'
        });
      }

      // Validação de estado (opcional)
      if (estado && !ESTADOS_BRASIL.includes(estado.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido'
        });
      }

      // Validação de CEP (opcional)
      if (cep && !validateCEP(cep)) {
        return res.status(400).json({
          success: false,
          message: 'CEP inválido'
        });
      }

      // Validação de permissões
      if (!validatePermissions(modulosLiberados)) {
        return res.status(400).json({
          success: false,
          message: 'Estrutura de módulos liberados inválida'
        });
      }

      if (!validatePermissions(viewsLiberadas)) {
        return res.status(400).json({
          success: false,
          message: 'Estrutura de views liberadas inválida'
        });
      }

      // Verifica disponibilidade de email
      const emailExists = await UserModel.findByEmail(email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }

      // Verifica disponibilidade de username
      const usernameExists = await UserModel.findByUsername(username);
      if (usernameExists) {
        return res.status(409).json({
          success: false,
          message: 'Username já está em uso'
        });
      }

      // Verifica disponibilidade de CPF
      const cpfExists = await UserModel.findByCPF(cpf.replace(/[^\d]/g, ''));
      if (cpfExists) {
        return res.status(409).json({
          success: false,
          message: 'CPF já está em uso'
        });
      }

      // Hash da senha
      const hashedPassword = await hashPassword(senha);

      // Prepara dados do usuário
      const userData = {
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        username: username.trim(),
        cpf: cpf.replace(/[^\d]/g, ''), // Remove formatação do CPF
        senha: hashedPassword,
        role,
        cargo: cargo?.trim() || null,
        telefone: telefone?.replace(/[^\d]/g, '') || null, // Remove formatação do telefone
        status,
        endereco: endereco?.trim() || null,
        numero: numero?.trim() || null,
        complemento: complemento?.trim() || null,
        bairro: bairro?.trim() || null,
        cidade: cidade?.trim() || null,
        estado: estado?.toUpperCase() || null,
        cep: cep?.replace(/[^\d]/g, '') || null, // Remove formatação do CEP
        modulosLiberados,
        viewsLiberadas,
        observacoes: observacoes?.trim() || null,
        criadoPor: req.user.id
      };

      // Cria usuário
      const newUser = await UserModel.create(userData);

      // Retorna sucesso
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          user: {
            ...newUser,
            cpf: formatCPF(newUser.cpf), // Retorna CPF formatado
            cep: newUser.cep ? formatCEP(newUser.cep) : null // Retorna CEP formatado
          }
        }
      });

    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verifica disponibilidade de dados
   * POST /api/register/check-availability
   */
  static async checkAvailability(req, res) {
    try {
      const { email, username, cpf, excludeId } = req.body;

      const results = {};

      if (email) {
        results.email = await UserModel.isEmailAvailable(email, excludeId);
      }

      if (username) {
        results.username = await UserModel.isUsernameAvailable(username, excludeId);
      }

      if (cpf) {
        const cleanCPF = cpf.replace(/[^\d]/g, '');
        if (validateCPF(cleanCPF)) {
          results.cpf = await UserModel.isCPFAvailable(cleanCPF, excludeId);
        } else {
          results.cpf = false;
          results.cpfError = 'CPF inválido';
        }
      }

      res.json({
        success: true,
        data: results
      });

    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Retorna opções para formulário de registro
   * GET /api/register/options
   */
  static async getRegisterOptions(req, res) {
    try {
      res.json({
        success: true,
        data: {
          roles: Object.values(USER_ROLES).filter(role => {
          // Apenas adminall pode ver a opção adminall
            if (role === USER_ROLES.ADMINALL) {
              return req.user.role === USER_ROLES.ADMINALL;
            }
            return true;
          }),
          status: Object.values(USER_STATUS),
          estados: ESTADOS_BRASIL,
          defaultPermissions: DEFAULT_PERMISSIONS
        }
      });

    } catch (error) {
      console.error('Erro ao buscar opções de registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = RegisterController;