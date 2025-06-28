const express = require('express');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

// Rota para verificar sessão (requer apenas autenticação)
router.get('/session', authMiddleware, UserController.getSession);

// Rota para busca de usuários (requer permissões de admin)
router.post('/users/search', authMiddleware, adminMiddleware, UserController.searchUsers);

// Rotas que requerem permissões de admin
router.get('/users', authMiddleware, adminMiddleware, UserController.listUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, UserController.getUserById);
router.put('/users/:id', authMiddleware, adminMiddleware, UserController.updateUser);
router.patch('/users/:id/status', authMiddleware, adminMiddleware, UserController.updateUserStatus);
router.delete('/users/:id', authMiddleware, adminMiddleware, UserController.deleteUser);
router.post('/users/:id/force-logout', authMiddleware, adminMiddleware, UserController.forceLogout);

module.exports = router;