const express = require('express');
const RegisterController = require('../controllers/registerController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

// Todas as rotas de registro requerem autenticação e permissões de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Rota para registrar novo usuário
router.post('/register', RegisterController.register);

// Rota para verificar disponibilidade de dados
router.post('/register/check-availability', RegisterController.checkAvailability);

// Rota para obter opções do formulário de registro
router.get('/register/options', RegisterController.getRegisterOptions);

module.exports = router;