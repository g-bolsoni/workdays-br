/**
 * Application configuration
 * Single Responsibility: Centralize configuration values
 */
class Config {
  static get server() {
    return {
      port: process.env.PORT || 3001,
      env: process.env.NODE_ENV || 'development'
    };
  }

  static get api() {
    return {
      brazilApi: {
        baseUrl: 'https://brasilapi.com.br/api/feriados/v1',
        timeout: 5000 // milliseconds
      }
    };
  }

  static get businessDays() {
    return {
      weekendDays: [0, 6], // Sunday = 0, Saturday = 6
      cacheSize: 100, // Number of years to cache
      maxBusinessDaysForNextYear: 200 // Threshold to fetch next year's holidays
    };
  }
}

export default Config;
