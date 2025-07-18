const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const registerRoutes = require('./routes/registerRoutes');
const viewRoutes = require('./routes/viewRoutes');
const healthRoutes = require('./routes/healthRoutes'); // Nova linha

const app = express();

// Middlewares globais
app.use(cors({
  origin: 'https://orbiterp.vercel.app', // URL padrão definida diretamente
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de log de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health checks (sem prefixo /api)
app.use('/', healthRoutes);

// Rotas da API
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', registerRoutes);
app.use('/api', viewRoutes);

// Middleware de tratamento de rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  // Erro de validação do Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Dados duplicados. Verifique email, username ou CPF'
    });
  }

  // Erro de dados não encontrados do Prisma
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado'
    });
  }

  // Erro de payload muito grande
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload muito grande'
    });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error.message
  });
});

module.exports = app;
