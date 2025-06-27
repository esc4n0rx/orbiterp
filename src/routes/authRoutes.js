const express = require('express');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rota de login (não requer autenticação)
router.post('/login', AuthController.login);

// Rota de logout (requer autenticação)
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;