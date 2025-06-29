const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');
const { validateCPF, validateEmail, validateUsername } = require('../src/utils/validators');

const prisma = new PrismaClient();

async function setupMasterUser() {
  try {
    console.log('🔧 Configurando usuário master...');

    // Lê dados do usuário master das variáveis de ambiente
    const masterData = {
      nome: process.env.MASTER_NAME || 'Administrador Master',
      email: process.env.MASTER_EMAIL || 'admin@orbiterp.com',
      username: process.env.MASTER_USERNAME || 'admin',
      cpf: process.env.MASTER_CPF || '11111111111',
      senha: process.env.MASTER_PASSWORD || 'admin123'
    };

    // Validações básicas
    if (!masterData.nome || !masterData.email || !masterData.username || 
        !masterData.cpf || !masterData.senha) {
      throw new Error('❌ Dados do usuário master incompletos nas variáveis de ambiente');
    }

    // Valida nome completo
    if (masterData.nome.trim().split(' ').length < 2) {
      throw new Error('❌ MASTER_NAME deve conter nome e sobrenome');
    }

    // Valida email
    if (!validateEmail(masterData.email)) {
      throw new Error('❌ MASTER_EMAIL inválido');
    }

    // Valida username
    if (!validateUsername(masterData.username)) {
      throw new Error('❌ MASTER_USERNAME deve ter entre 3 e 30 caracteres, apenas letras, números e underscore');
    }

    // Valida CPF
    if (!validateCPF(masterData.cpf)) {
      throw new Error('❌ MASTER_CPF inválido');
    }

    // Valida senha
    if (masterData.senha.length < 6) {
      throw new Error('❌ MASTER_PASSWORD deve ter pelo menos 6 caracteres');
    }

    // Verifica se já existe usuário master
    const existingMaster = await prisma.user.findFirst({
      where: { role: 'adminall' }
    });

    if (existingMaster) {
      console.log('⚠️  Usuário master já existe, atualizando dados...');
      
      // Atualiza dados do usuário master existente
      const hashedPassword = await hashPassword(masterData.senha);
      
      const updatedUser = await prisma.user.update({
        where: { id: existingMaster.id },
        data: {
          nome: masterData.nome.trim(),
          email: masterData.email.toLowerCase().trim(),
          username: masterData.username.trim(),
          cpf: masterData.cpf.replace(/[^\d]/g, ''),
          senha: hashedPassword,
          status: 'ATIVO',
          statusLogin: 'OFFLINE'
        }
      });

      console.log('✅ Usuário master atualizado com sucesso!');
      console.log(`👤 Nome: ${updatedUser.nome}`);
      console.log(`📧 Email: ${updatedUser.email}`);
      console.log(`🆔 Username: ${updatedUser.username}`);
      
    } else {
      console.log('📝 Criando novo usuário master...');
      
      // Cria hash da senha
      const hashedPassword = await hashPassword(masterData.senha);

      // Cria usuário master
      const masterUser = await prisma.user.create({
        data: {
          nome: masterData.nome.trim(),
          email: masterData.email.toLowerCase().trim(),
          username: masterData.username.trim(),
          cpf: masterData.cpf.replace(/[^\d]/g, ''),
          senha: hashedPassword,
          role: 'adminall',
          status: 'ATIVO',
          statusLogin: 'OFFLINE',
          modulosLiberados: { type: 'all' },
          viewsLiberadas: { type: 'all' }
        }
      });

      console.log('✅ Usuário master criado com sucesso!');
      console.log(`👤 Nome: ${masterUser.nome}`);
      console.log(`📧 Email: ${masterUser.email}`);
      console.log(`🆔 Username: ${masterUser.username}`);
      console.log(`🔑 Role: ${masterUser.role}`);
    }

    console.log('🚀 Setup do usuário master finalizado!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar usuário master:', error.message);
    
    if (error.code === 'P2002') {
      console.log('💡 Dica: Verifique se email, username ou CPF já não estão em uso por outro usuário');
    }
    
    throw error;
  }
}

// Executa apenas se chamado diretamente
if (require.main === module) {
  setupMasterUser()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { setupMasterUser };