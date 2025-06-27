const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createMasterUser() {
  try {
    console.log('🔧 Setup do OrbitERP - Criação do Usuário Master\n');

    // Verifica se já existe usuário master
    const existingMaster = await prisma.user.findFirst({
      where: { role: 'adminall' }
    });

    if (existingMaster) {
      console.log('⚠️  Usuário master já existe!');
      console.log(`📧 Email: ${existingMaster.email}`);
      console.log(`👤 Nome: ${existingMaster.nome}`);
      
      const overwrite = await question('\nDeseja sobrescrever o usuário master? (s/N): ');
      
      if (overwrite.toLowerCase() !== 's') {
        console.log('✅ Setup cancelado');
        rl.close();
        await prisma.$disconnect();
        return;
      }

      // Remove usuário master existente
      await prisma.user.delete({
        where: { id: existingMaster.id }
      });
      console.log('🗑️  Usuário master anterior removido');
    }

    // Coleta dados do novo usuário master
    const nome = await question('👤 Nome do usuário master: ');
    const email = await question('📧 Email do usuário master: ');
    const senha = await question('🔒 Senha do usuário master: ');

    // Validações básicas
    if (!nome || !email || !senha) {
      console.log('❌ Todos os campos são obrigatórios!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    if (senha.length < 6) {
      console.log('❌ A senha deve ter pelo menos 6 caracteres!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Verifica se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser && existingUser.role !== 'adminall') {
      console.log('❌ Email já está em uso por outro usuário!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Cria hash da senha
    const hashedPassword = await hashPassword(senha);

    // Cria usuário master
    const masterUser = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        role: 'adminall',
        statusLogin: 'OFFLINE'
      }
    });

    console.log('\n✅ Usuário master criado com sucesso!');
    console.log(`📧 Email: ${masterUser.email}`);
    console.log(`👤 Nome: ${masterUser.nome}`);
    console.log(`🔑 Role: ${masterUser.role}`);
    console.log(`📅 Criado em: ${masterUser.createdAt}`);
    console.log('\n🚀 Você já pode fazer login no sistema!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário master:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createMasterUser();