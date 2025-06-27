const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');
const { validateCPF, validateEmail, formatCPF } = require('../src/utils/validators');
const { DEFAULT_PERMISSIONS } = require('../src/types/userTypes');
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
      console.log(`🆔 Username: ${existingMaster.username}`);
      console.log(`📄 CPF: ${formatCPF(existingMaster.cpf)}`);
      
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
      console.log('🗑️  Usuário master anterior removido\n');
    }

    // Coleta dados do novo usuário master
    console.log('📝 Dados do usuário master:');
    const nome = await question('👤 Nome completo: ');
    const email = await question('📧 Email: ');
    const username = await question('🆔 Username: ');
    const cpf = await question('📄 CPF: ');
    const senha = await question('🔒 Senha: ');

    // Validações básicas
    if (!nome || !email || !username || !cpf || !senha) {
      console.log('❌ Todos os campos são obrigatórios!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Valida nome completo
    if (nome.trim().split(' ').length < 2) {
      console.log('❌ Nome completo é obrigatório (nome e sobrenome)!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Valida email
    if (!validateEmail(email)) {
      console.log('❌ Email inválido!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Valida username
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      console.log('❌ Username deve ter entre 3 e 30 caracteres, apenas letras, números e underscore!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Valida CPF
    if (!validateCPF(cpf)) {
      console.log('❌ CPF inválido!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Valida senha
    if (senha.length < 6) {
      console.log('❌ A senha deve ter pelo menos 6 caracteres!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Verifica se email já existe
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingEmail && existingEmail.role !== 'adminall') {
      console.log('❌ Email já está em uso por outro usuário!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Verifica se username já existe
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (existingUsername && existingUsername.role !== 'adminall') {
      console.log('❌ Username já está em uso por outro usuário!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Verifica se CPF já existe
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    const existingCPF = await prisma.user.findUnique({
      where: { cpf: cleanCPF }
    });

    if (existingCPF && existingCPF.role !== 'adminall') {
      console.log('❌ CPF já está em uso por outro usuário!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Cria hash da senha
    const hashedPassword = await hashPassword(senha);

    // Cria usuário master
    const masterUser = await prisma.user.create({
      data: {
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        username: username.trim(),
        cpf: cleanCPF,
        senha: hashedPassword,
        role: 'adminall',
        status: 'ATIVO',
        statusLogin: 'OFFLINE',
        modulosLiberados: DEFAULT_PERMISSIONS.modules,
        viewsLiberadas: DEFAULT_PERMISSIONS.views
      }
    });

    console.log('\n✅ Usuário master criado com sucesso!');
    console.log(`👤 Nome: ${masterUser.nome}`);
    console.log(`📧 Email: ${masterUser.email}`);
    console.log(`🆔 Username: ${masterUser.username}`);
    console.log(`📄 CPF: ${formatCPF(masterUser.cpf)}`);
    console.log(`🔑 Role: ${masterUser.role}`);
    console.log(`📊 Status: ${masterUser.status}`);
    console.log(`📅 Criado em: ${masterUser.createdAt}`);
    console.log('\n🚀 Você já pode fazer login no sistema!');
    console.log(`🌐 Endpoints disponíveis:`);
    console.log(`   POST /api/login - Login`);
    console.log(`   POST /api/register - Registrar usuário`);
    console.log(`   GET /api/users - Listar usuários`);

  } catch (error) {
    console.error('❌ Erro ao criar usuário master:', error);
    
    if (error.code === 'P2002') {
      console.log('💡 Dica: Verifique se email, username ou CPF já não estão em uso');
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createMasterUser();