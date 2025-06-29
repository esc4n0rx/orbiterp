const { testConnection } = require('../config/database');
const { version } = require('../../package.json');

class HealthController {
  /**
   * Health check básico
   * GET /health
   */
  static async basicHealth(req, res) {
    try {
      const startTime = Date.now();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version,
        environment: process.env.NODE_ENV || 'development',
        responseTime: Date.now() - startTime
      });
      
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  /**
   * Health check detalhado
   * GET /health/detailed
   */
  static async detailedHealth(req, res) {
    try {
      const startTime = Date.now();
      
      // Testa conexão com banco de dados
      const dbHealth = await testConnection();
      
      // Informações do sistema
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime()
      };
      
      const health = {
        status: dbHealth ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        version,
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: {
            status: dbHealth ? 'healthy' : 'unhealthy',
            responseTime: null
          },
          application: {
            status: 'healthy',
            uptime: process.uptime()
          }
        },
        system: systemInfo,
        responseTime: Date.now() - startTime
      };
      
      const statusCode = dbHealth ? 200 : 503;
      res.status(statusCode).json(health);
      
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        version,
        environment: process.env.NODE_ENV || 'development'
      });
    }
  }

  /**
   * Readiness probe
   * GET /health/ready
   */
  static async readiness(req, res) {
    try {
      const dbHealth = await testConnection();
      
      if (dbHealth) {
        res.json({
          status: 'ready',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: 'not_ready',
          timestamp: new Date().toISOString(),
          reason: 'Database connection failed'
        });
      }
      
    } catch (error) {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  /**
   * Liveness probe
   * GET /health/live
   */
  static async liveness(req, res) {
    res.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
}

module.exports = HealthController;