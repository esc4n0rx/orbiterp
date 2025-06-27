const express = require('express');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rota para verificar sessão (requer autenticação)
router.get('/session', authMiddleware, UserController.getSession);

module.exports = router;