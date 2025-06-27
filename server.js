const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Testa conexão com o banco de dados
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados MySQL');

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor OrbitERP rodando na porta ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 API Base: http://localhost:${PORT}/api`);
      console.log('\n⚠️  Para criar o usuário master, execute: npm run setup');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Trata o fechamento gracioso da aplicação
process.on('SIGINT', async () => {
  console.log('\n🔄 Fechando servidor...');
  await prisma.$disconnect();
  console.log('✅ Conexão com banco de dados fechada');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Fechando servidor...');
  await prisma.$disconnect();
  console.log('✅ Conexão com banco de dados fechada');
  process.exit(0);
});

startServer();