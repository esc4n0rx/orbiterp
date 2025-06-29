const app = require('./src/app');
const { getPrismaClient, disconnectDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Testa conexão com o banco de dados
    const prisma = getPrismaClient();
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados MySQL');

    // Inicia o servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor OrbitERP rodando na porta ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 API Base: http://localhost:${PORT}/api`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    // Trata o fechamento gracioso da aplicação
    const gracefulShutdown = async (signal) => {
      console.log(`\n🔄 Recebido ${signal}, fechando servidor...`);
      
      server.close(async () => {
        console.log('✅ Servidor HTTP fechado');
        
        try {
          await disconnectDatabase();
          console.log('✅ Conexão com banco de dados fechada');
          process.exit(0);
        } catch (error) {
          console.error('❌ Erro ao fechar conexão com banco:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();