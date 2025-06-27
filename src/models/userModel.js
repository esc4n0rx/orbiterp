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
        role: true,
        statusLogin: true,
        createdAt: true
      }
    });
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
        role: true,
        statusLogin: true,
        createdAt: true
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
}

module.exports = UserModel;