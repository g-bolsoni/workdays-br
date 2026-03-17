import { describe, it } from 'node:test';
import assert from 'node:assert';
import DateUtils from '../../src/utils/DateUtils.js';

describe('DateUtils', () => {
  describe('createSafeDate', () => {
    it('should create date correctly avoiding timezone issues', () => {
      const dateString = '2025-11-17';
      const date = DateUtils.createSafeDate(dateString);

      assert.strictEqual(date.getFullYear(), 2025);
      assert.strictEqual(date.getMonth(), 10); // November = 10 (0-indexed)
      assert.strictEqual(date.getDate(), 17);
      assert.strictEqual(date.getHours(), 12); // Noon to avoid timezone issues
    });
  });

  describe('formatToISODate', () => {
    it('should format date to YYYY-MM-DD string', () => {
      const date = new Date(2025, 10, 17, 12, 0, 0); // November 17, 2025
      const formatted = DateUtils.formatToISODate(date);

      assert.strictEqual(formatted, '2025-11-17');
    });
  });

  describe('isWeekend', () => {
    it('should return true for Sunday', () => {
      const sunday = new Date(2025, 10, 16, 12, 0, 0); // November 16, 2025 (Sunday)
      assert.strictEqual(DateUtils.isWeekend(sunday), true);
    });

    it('should return true for Saturday', () => {
      const saturday = new Date(2025, 10, 22, 12, 0, 0); // November 22, 2025 (Saturday)
      assert.strictEqual(DateUtils.isWeekend(saturday), true);
    });

    it('should return false for Monday', () => {
      const monday = new Date(2025, 10, 17, 12, 0, 0); // November 17, 2025 (Monday)
      assert.strictEqual(DateUtils.isWeekend(monday), false);
    });
  });

  describe('isHoliday', () => {
    it('should return true when date is in holidays array', () => {
      const date = new Date(2025, 10, 20, 12, 0, 0); // November 20, 2025
      const holidays = ['2025-11-20', '2025-12-25'];

      assert.strictEqual(DateUtils.isHoliday(date, holidays), true);
    });

    it('should return false when date is not in holidays array', () => {
      const date = new Date(2025, 10, 17, 12, 0, 0); // November 17, 2025
      const holidays = ['2025-11-20', '2025-12-25'];

      assert.strictEqual(DateUtils.isHoliday(date, holidays), false);
    });
  });

  describe('isBusinessDay', () => {
    it('should return true for weekday that is not a holiday', () => {
      const monday = new Date(2025, 10, 17, 12, 0, 0); // November 17, 2025 (Monday)
      const holidays = ['2025-11-20'];

      assert.strictEqual(DateUtils.isBusinessDay(monday, holidays), true);
    });

    it('should return false for weekend', () => {
      const saturday = new Date(2025, 10, 22, 12, 0, 0); // November 22, 2025 (Saturday)
      const holidays = [];

      assert.strictEqual(DateUtils.isBusinessDay(saturday, holidays), false);
    });

    it('should return false for holiday', () => {
      const holiday = new Date(2025, 10, 20, 12, 0, 0); // November 20, 2025 (Holiday)
      const holidays = ['2025-11-20'];

      assert.strictEqual(DateUtils.isBusinessDay(holiday, holidays), false);
    });
  });
});
