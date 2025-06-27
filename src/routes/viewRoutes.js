const express = require('express');
const ViewController = require('../controllers/viewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rotas de views (requerem autenticação)
router.get('/views', authMiddleware, ViewController.listViews);
router.get('/views/:viewId', authMiddleware, ViewController.getView);
router.get('/views/alias/:alias', authMiddleware, ViewController.getViewByAlias);

// Rotas de módulos (requerem autenticação)
router.get('/modules', authMiddleware, ViewController.listModules);
router.get('/modules/:moduleName', authMiddleware, ViewController.getModule);

module.exports = router;