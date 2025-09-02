import HolidayService from '../services/HolidayService.js';
import DateUtils from '../utils/DateUtils.js';

/**
 * Calculator for business day operations
 * Single Responsibility: Calculate business days considering weekends and holidays
 */
class BusinessDayCalculator {
  constructor(holidayService = new HolidayService()) {
    this.holidayService = holidayService;
  }

  /**
   * Calculates the end date after adding business days to a start date
   * @param {string} startDateString - Start date in YYYY-MM-DD format
   * @param {number} businessDaysToAdd - Number of business days to add
   * @returns {Promise<Date>} The final date after adding business days
   * @throws {Error} If parameters are invalid
   */
  async calculateEndDate(startDateString, businessDaysToAdd) {
    this._validateInputs(startDateString, businessDaysToAdd);

    const startDate = DateUtils.createSafeDate(startDateString);
    const relevantYears = DateUtils.getRelevantYears(startDate, businessDaysToAdd);
    const holidays = await this.holidayService.getHolidaysForYears(relevantYears);

    return this._calculateBusinessDays(startDate, businessDaysToAdd, holidays);
  }

  /**
   * Validates calculation inputs
   * @private
   * @param {string} startDateString - Start date string
   * @param {number} businessDaysToAdd - Number of business days
   * @throws {Error} If inputs are invalid
   */
  _validateInputs(startDateString, businessDaysToAdd) {
    if (!startDateString || typeof startDateString !== 'string') {
      throw new Error('Start date must be a valid string in YYYY-MM-DD format');
    }

    if (!Number.isInteger(businessDaysToAdd) || businessDaysToAdd <= 0) {
      throw new Error('Business days must be a positive integer');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDateString)) {
      throw new Error('Start date must be in YYYY-MM-DD format');
    }
  }

  /**
   * Core business day calculation logic
   * @private
   * @param {Date} currentDate - Current date (will be modified)
   * @param {number} targetBusinessDays - Target number of business days
   * @param {string[]} holidays - Array of holiday dates
   * @returns {Date} Final calculated date
   */
  _calculateBusinessDays(currentDate, targetBusinessDays, holidays) {
    let businessDaysCount = 0;

    // Check if start date is a business day
    if (DateUtils.isBusinessDay(currentDate, holidays)) {
      businessDaysCount = 1;
      if (businessDaysCount === targetBusinessDays) {
        return new Date(currentDate);
      }
    }

    // Continue counting until we reach target business days
    while (businessDaysCount < targetBusinessDays) {
      DateUtils.addOneDay(currentDate);

      if (DateUtils.isBusinessDay(currentDate, holidays)) {
        businessDaysCount++;
      }

      // Update holidays if we moved to a new year
      if (this._shouldUpdateHolidaysCache(currentDate, holidays)) {
        // This is a simplified approach - in a real system you might want
        // to handle year transitions more elegantly
      }
    }

    return new Date(currentDate);
  }

  /**
   * Checks if holidays cache needs updating for new year
   * @private
   * @param {Date} currentDate - Current date being processed
   * @param {string[]} holidays - Current holidays array
   * @returns {boolean} Whether cache should be updated
   */
  _shouldUpdateHolidaysCache(currentDate, holidays) {
    const currentYear = currentDate.getFullYear();
    const currentYearString = currentYear.toString();

    // Check if we have holidays for current year
    return !holidays.some(holiday => holiday.startsWith(currentYearString));
  }
}

export default BusinessDayCalculator;
