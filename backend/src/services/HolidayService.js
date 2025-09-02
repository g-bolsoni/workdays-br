import fetch from 'node-fetch';

/**
 * Service responsible for fetching Brazilian national holidays
 * Single Responsibility: Only handles holiday data retrieval
 */
class HolidayService {
  constructor() {
    this.baseUrl = 'https://brasilapi.com.br/api/feriados/v1';
    this.cache = new Map();
  }

  /**
   * Fetches national holidays for a given year
   * @param {number} year - The year to fetch holidays for
   * @returns {Promise<string[]>} Array of holiday dates in YYYY-MM-DD format
   */
  async getHolidaysForYear(year) {
    // Check cache first
    if (this.cache.has(year)) {
      return this.cache.get(year);
    }

    try {
      const url = `${this.baseUrl}/${year}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch holidays for year ${year}: ${response.status}`);
        return [];
      }

      const holidays = await response.json();
      const holidayDates = holidays.map(holiday => holiday.date);

      // Cache the result
      this.cache.set(year, holidayDates);

      return holidayDates;
    } catch (error) {
      console.error(`Error fetching holidays for year ${year}:`, error.message);
      return [];
    }
  }

  /**
   * Fetches holidays for multiple years
   * @param {number[]} years - Array of years to fetch holidays for
   * @returns {Promise<string[]>} Combined array of all holiday dates
   */
  async getHolidaysForYears(years) {
    const holidayPromises = years.map(year => this.getHolidaysForYear(year));
    const holidayArrays = await Promise.all(holidayPromises);
    return holidayArrays.flat();
  }
}

export default HolidayService;
