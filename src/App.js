import express from 'express';
import BusinessDayController from './controllers/BusinessDayController.js';

/**
 * Express application setup with dependency injection
 * Single Responsibility: Configure and start the web server
 */
class App {
  constructor() {
    this.app = express();
    this.businessDayController = new BusinessDayController();

    this._setupMiddleware();
    this._setupRoutes();
  }

  /**
   * Configures Express middleware
   * @private
   */
  _setupMiddleware() {
    this.app.use(express.json());

    // Basic error handling middleware
    this.app.use((error, req, res, next) => {
      if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid JSON in request body'
        });
      }
      next();
    });
  }

  /**
   * Configures application routes
   * @private
   */
  _setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Business Day Calculator API'
      });
    });

    // Business day calculation endpoint
    this.app.post('/calculate', (req, res) => {
      this.businessDayController.calculateBusinessDays(req, res);
    });

    // Legacy endpoint for backward compatibility
    this.app.post('/calcular', (req, res) => {
      // Map Portuguese field names to English
      const mappedBody = {
        startDate: req.body.dataInicial,
        businessDays: req.body.diasUteis
      };

      req.body = mappedBody;
      this.businessDayController.calculateBusinessDays(req, res);
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableEndpoints: [
          'GET /health',
          'POST /calculate',
          'POST /calcular (legacy)'
        ]
      });
    });
  }

  /**
   * Starts the server
   * @param {number} port - Port to listen on
   */
  start(port = process.env.PORT || 3001) {
    this.app.listen(port, () => {
      console.log(`🚀 Business Day Calculator API running on port ${port}`);
      console.log(`📋 Health check: http://localhost:${port}/health`);
      console.log(`🧮 Calculate endpoint: http://localhost:${port}/calculate`);
    });
  }

  /**
   * Gets the Express app instance (useful for testing)
   * @returns {express.Application} Express app instance
   */
  getApp() {
    return this.app;
  }
}

export default App;
