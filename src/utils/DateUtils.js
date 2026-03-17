/**
 * Utility class for date operations
 * Single Responsibility: Handle date manipulations and validations
 */
class DateUtils {
  static WEEKEND_DAYS = [0, 6]; // Sunday = 0, Saturday = 6
  static MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

  /**
   * Creates a date object from string, avoiding timezone issues
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {Date} Date object set to noon local time
   */
  static createSafeDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  /**
   * Formats date to YYYY-MM-DD string
   * @param {Date} date - Date object to format
   * @returns {string} Formatted date string
   */
  static formatToISODate(date) {
    return date.toISOString().slice(0, 10);
  }

  /**
   * Checks if a date is a weekend (Saturday or Sunday)
   * @param {Date} date - Date to check
   * @returns {boolean} True if weekend, false otherwise
   */
  static isWeekend(date) {
    return this.WEEKEND_DAYS.includes(date.getDay());
  }

  /**
   * Checks if a date is a holiday
   * @param {Date} date - Date to check
   * @param {string[]} holidays - Array of holiday dates in YYYY-MM-DD format
   * @returns {boolean} True if holiday, false otherwise
   */
  static isHoliday(date, holidays) {
    const dateString = this.formatToISODate(date);
    return holidays.includes(dateString);
  }

  /**
   * Checks if a date is a business day (not weekend and not holiday)
   * @param {Date} date - Date to check
   * @param {string[]} holidays - Array of holiday dates
   * @returns {boolean} True if business day, false otherwise
   */
  static isBusinessDay(date, holidays) {
    return !this.isWeekend(date) && !this.isHoliday(date, holidays);
  }

  /**
   * Advances date by one day
   * @param {Date} date - Date to advance (modified in place)
   */
  static addOneDay(date) {
    date.setDate(date.getDate() + 1);
  }

  /**
   * Gets years that might be needed for calculation
   * @param {Date} startDate - Starting date
   * @param {number} businessDays - Number of business days to add
   * @returns {number[]} Array of years that might contain relevant dates
   */
  static getRelevantYears(startDate, businessDays) {
    const years = [startDate.getFullYear()];

    // If calculating many business days, include next year
    if (businessDays > 200) {
      years.push(startDate.getFullYear() + 1);
    }

    return years;
  }
}

export default DateUtils;
