const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class UserModel {
  /**
   * Busca usuário por email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Busca usuário por username
   * @param {string} username - Username do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  static async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username }
    });
  }

  /**
   * Busca usuário por CPF
   * @param {string} cpf - CPF do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  static async findByCPF(cpf) {
    return await prisma.user.findUnique({
      where: { cpf }
    });
  }

  /**
   * Busca usuário por ID
   * @param {number} id - ID do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        username: true,
        cpf: true,
        role: true,
        cargo: true,
        telefone: true,
        status: true,
        statusLogin: true,
        endereco: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        estado: true,
        cep: true,
        modulosLiberados: true,
        viewsLiberadas: true,
        observacoes: true,
        criadoPor: true,
        createdAt: true,
        updatedAt: true,
        criador: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Lista todos os usuários com paginação
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} Lista de usuários e metadados
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = null,
      role = null,
      orderBy = 'createdAt',
      orderDirection = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    
    // Constrói filtros dinâmicos
    const where = {};
    
    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
        { cpf: { contains: search } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          username: true,
          cpf: true,
          role: true,
          cargo: true,
          telefone: true,
          status: true,
          statusLogin: true,
          cidade: true,
          estado: true,
          createdAt: true,
          updatedAt: true,
          criador: {
            select: {
              id: true,
              nome: true
            }
          }
        },
        orderBy: {
          [orderBy]: orderDirection
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Cria novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
  static async create(userData) {
    return await prisma.user.create({
      data: userData,
      select: {
        id: true,
        nome: true,
        email: true,
        username: true,
        cpf: true,
        role: true,
        cargo: true,
        telefone: true,
        status: true,
        statusLogin: true,
        endereco: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        estado: true,
        cep: true,
        modulosLiberados: true,
        viewsLiberadas: true,
        observacoes: true,
        criadoPor: true,
        createdAt: true,
        criador: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Atualiza usuário
   * @param {number} id - ID do usuário
   * @param {Object} userData - Dados a serem atualizados
   * @returns {Promise<Object>} Usuário atualizado
   */
  static async update(id, userData) {
    return await prisma.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        nome: true,
        email: true,
        username: true,
        cpf: true,
        role: true,
        cargo: true,
        telefone: true,
        status: true,
        statusLogin: true,
        endereco: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        estado: true,
        cep: true,
        modulosLiberados: true,
        viewsLiberadas: true,
        observacoes: true,
        updatedAt: true
      }
    });
  }

  /**
   * Atualiza status de login do usuário
   * @param {number} id - ID do usuário
   * @param {string} status - Status de login (LOGADO/OFFLINE)
   * @returns {Promise<Object>} Usuário atualizado
   */
  static async updateLoginStatus(id, status) {
    return await prisma.user.update({
      where: { id },
      data: { statusLogin: status }
    });
  }

  /**
   * Verifica se existe usuário master
   * @returns {Promise<boolean>} True se existir usuário master
   */
  static async hasMasterUser() {
    const masterUser = await prisma.user.findFirst({
      where: { role: 'adminall' }
    });
    return !!masterUser;
  }

  /**
   * Deleta usuário (soft delete via status)
   * @param {number} id - ID do usuário
   * @returns {Promise<Object>} Usuário atualizado
   */
  static async softDelete(id) {
    return await prisma.user.update({
      where: { id },
      data: { 
        status: 'INATIVO',
        statusLogin: 'OFFLINE'
      }
    });
  }

  /**
   * Verifica disponibilidade de username
   * @param {string} username - Username a ser verificado
   * @param {number} excludeId - ID do usuário a ser excluído da verificação
   * @returns {Promise<boolean>} True se disponível
   */
  static async isUsernameAvailable(username, excludeId = null) {
    const where = { username };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const user = await prisma.user.findUnique({ where });
    return !user;
  }

  /**
   * Verifica disponibilidade de email
   * @param {string} email - Email a ser verificado
   * @param {number} excludeId - ID do usuário a ser excluído da verificação
   * @returns {Promise<boolean>} True se disponível
   */
  static async isEmailAvailable(email, excludeId = null) {
    const where = { email };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const user = await prisma.user.findUnique({ where });
    return !user;
  }

  /**
   * Verifica disponibilidade de CPF
   * @param {string} cpf - CPF a ser verificado
   * @param {number} excludeId - ID do usuário a ser excluído da verificação
   * @returns {Promise<boolean>} True se disponível
   */
  static async isCPFAvailable(cpf, excludeId = null) {
    const where = { cpf };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const user = await prisma.user.findUnique({ where });
    return !user;
  }
}

module.exports = UserModel;