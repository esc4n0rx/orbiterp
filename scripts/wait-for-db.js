const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function waitForDatabase() {
  const maxRetries = 30;
  const retryInterval = 2000; // 2 segundos
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 Tentativa ${i + 1}/${maxRetries} - Conectando ao banco de dados...`);
      
      await prisma.$connect();
      console.log('✅ Conectado ao banco de dados!');
      
      // Testa uma query simples
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Banco de dados respondendo!');
      
      return true;
      
    } catch (error) {
      console.log(`❌ Falha na conexão: ${error.message}`);
      
      if (i < maxRetries - 1) {
        console.log(`⏳ Aguardando ${retryInterval/1000}s antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }
  }
  
  throw new Error('❌ Não foi possível conectar ao banco de dados após múltiplas tentativas');
}

// Executa apenas se chamado diretamente
if (require.main === module) {
  waitForDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { waitForDatabase };