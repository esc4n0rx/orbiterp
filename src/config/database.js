const { PrismaClient } = require('@prisma/client');

// Configuração do Prisma para diferentes ambientes
const prismaConfig = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
  
  errorFormat: 'pretty',
  
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
};

// Singleton do Prisma Client
let prisma;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient(prismaConfig);
    
    // Middleware para logging em produção
    if (process.env.NODE_ENV === 'production') {
      prisma.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        
        console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
        return result;
      });
    }
  }
  
  return prisma;
}

// Função para desconectar (usado no graceful shutdown)
async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

// Função para testar conexão
async function testConnection() {
  try {
    const client = getPrismaClient();
    await client.$connect();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Erro na conexão com banco de dados:', error);
    return false;
  }
}

module.exports = {
  getPrismaClient,
  disconnectDatabase,
  testConnection
};