import BusinessDayCalculator from '../calculators/BusinessDayCalculator.js';
import DateUtils from '../utils/DateUtils.js';

/**
 * Controller for business day calculation endpoints
 * Single Responsibility: Handle HTTP requests and responses for business day operations
 */
class BusinessDayController {
  constructor(calculator = new BusinessDayCalculator()) {
    this.calculator = calculator;
  }

  /**
   * Handles POST /calculate endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async calculateBusinessDays(req, res) {
    try {
      const { startDate, businessDays } = req.body;

      // Validate required fields
      if (!startDate || !businessDays) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Both startDate and businessDays are required',
          requiredFields: ['startDate', 'businessDays']
        });
      }

      // Calculate end date
      const endDate = await this.calculator.calculateEndDate(startDate, businessDays);
      const formattedEndDate = DateUtils.formatToISODate(endDate);

      // Success response
      res.json({
        success: true,
        data: {
          startDate,
          businessDays,
          endDate: formattedEndDate
        }
      });

    } catch (error) {
      this._handleError(error, res);
    }
  }

  /**
   * Handles errors and sends appropriate HTTP responses
   * @private
   * @param {Error} error - The error that occurred
   * @param {Object} res - Express response object
   */
  _handleError(error, res) {
    console.error('Business day calculation error:', error.message);

    // Handle validation errors
    if (error.message.includes('format') || error.message.includes('invalid')) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message
      });
    }

    // Handle other errors
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while calculating business days'
    });
  }
}

export default BusinessDayController;
