const { waitForDatabase } = require('./wait-for-db');
const { setupMasterUser } = require('./setup-master');
const { spawn } = require('child_process');

async function start() {
  try {
    console.log('🚀 Iniciando OrbitERP...');
    
    // 1. Aguarda o banco de dados estar disponível
    console.log('\n📡 Verificando conexão com banco de dados...');
    await waitForDatabase();
    
    // 2. Executa migrações do Prisma
    console.log('\n📊 Executando migrações do banco de dados...');
    await runCommand('npx', ['prisma', 'migrate', 'deploy']);
    
    // 3. Gera o Prisma Client
    console.log('\n🔧 Gerando Prisma Client...');
    await runCommand('npx', ['prisma', 'generate']);
    
    // 4. Configura usuário master
    console.log('\n👤 Configurando usuário master...');
    await setupMasterUser();
    
    // 5. Inicia o servidor
    console.log('\n🌟 Iniciando servidor...');
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      env: process.env
    });
    
    // Trata sinais de término
    process.on('SIGTERM', () => {
      console.log('\n🔄 Recebido SIGTERM, encerrando servidor...');
      server.kill('SIGTERM');
    });
    
    process.on('SIGINT', () => {
      console.log('\n🔄 Recebido SIGINT, encerrando servidor...');
      server.kill('SIGINT');
    });
    
    server.on('exit', (code) => {
      console.log(`\n📋 Servidor encerrado com código: ${code}`);
      process.exit(code);
    });
    
  } catch (error) {
    console.error('❌ Erro durante a inicialização:', error);
    process.exit(1);
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit'
    });
    
    process.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });
    
    process.on('error', reject);
  });
}

start();