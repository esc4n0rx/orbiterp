const express = require('express');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

// Rota para verificar sessão (requer apenas autenticação)
router.get('/session', authMiddleware, UserController.getSession);

// Rotas que requerem permissões de admin
router.get('/users', authMiddleware, adminMiddleware, UserController.listUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, UserController.getUserById);
router.patch('/users/:id/status', authMiddleware, adminMiddleware, UserController.updateUserStatus);
router.post('/users/:id/force-logout', authMiddleware, adminMiddleware, UserController.forceLogout);

module.exports = router;