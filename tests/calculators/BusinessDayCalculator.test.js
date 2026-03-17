import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import BusinessDayCalculator from "../../src/calculators/BusinessDayCalculator.js";

/**
 * Mock HolidayService for testing
 */
class MockHolidayService {
  constructor(holidays = []) {
    this.holidays = holidays;
  }

  async getHolidaysForYears(years) {
    return this.holidays;
  }

  async getHolidaysForYear(year) {
    return this.holidays.filter((h) => h.startsWith(year.toString()));
  }
}

describe("BusinessDayCalculator", () => {
  describe("_validateInputs", () => {
    let calculator;

    beforeEach(() => {
      calculator = new BusinessDayCalculator(new MockHolidayService());
    });

    it("should throw error for null startDate", () => {
      assert.throws(() => calculator._validateInputs(null, 5), {
        message: "Start date must be a valid string in YYYY-MM-DD format",
      });
    });

    it("should throw error for undefined startDate", () => {
      assert.throws(() => calculator._validateInputs(undefined, 5), {
        message: "Start date must be a valid string in YYYY-MM-DD format",
      });
    });

    it("should throw error for non-string startDate", () => {
      assert.throws(() => calculator._validateInputs(12345, 5), {
        message: "Start date must be a valid string in YYYY-MM-DD format",
      });
    });

    it("should throw error for invalid date format (dd/mm/yyyy)", () => {
      assert.throws(() => calculator._validateInputs("17/11/2025", 5), {
        message: "Start date must be in YYYY-MM-DD format",
      });
    });

    it("should throw error for invalid date format (mm-dd-yyyy)", () => {
      assert.throws(() => calculator._validateInputs("11-17-2025", 5), {
        message: "Start date must be in YYYY-MM-DD format",
      });
    });

    it("should throw error for zero businessDays", () => {
      assert.throws(() => calculator._validateInputs("2025-11-17", 0), {
        message: "Business days must be a positive integer",
      });
    });

    it("should throw error for negative businessDays", () => {
      assert.throws(() => calculator._validateInputs("2025-11-17", -5), {
        message: "Business days must be a positive integer",
      });
    });

    it("should throw error for non-integer businessDays", () => {
      assert.throws(() => calculator._validateInputs("2025-11-17", 5.5), {
        message: "Business days must be a positive integer",
      });
    });

    it("should throw error for string businessDays", () => {
      assert.throws(() => calculator._validateInputs("2025-11-17", "5"), {
        message: "Business days must be a positive integer",
      });
    });

    it("should not throw for valid inputs", () => {
      assert.doesNotThrow(() => calculator._validateInputs("2025-11-17", 5));
    });
  });

  describe("calculateEndDate", () => {
    it("should return same date when businessDays is 1 and start is a business day", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));
      // Monday, November 17, 2025
      const result = await calculator.calculateEndDate("2025-11-17", 1);

      assert.strictEqual(result.getFullYear(), 2025);
      assert.strictEqual(result.getMonth(), 10); // November
      assert.strictEqual(result.getDate(), 17);
    });

    it("should skip weekends correctly", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));
      // Friday, November 21, 2025 + 2 business days = Tuesday, November 25, 2025
      const result = await calculator.calculateEndDate("2025-11-21", 2);

      assert.strictEqual(result.getFullYear(), 2025);
      assert.strictEqual(result.getMonth(), 10);
      assert.strictEqual(result.getDate(), 24); // Monday
    });

    it("should skip holidays correctly", async () => {
      const holidays = ["2025-11-20"]; // Thursday is a holiday
      const calculator = new BusinessDayCalculator(
        new MockHolidayService(holidays),
      );
      // Wednesday November 19, 2025 + 2 = Friday November 21, 2025 (skipping Thursday holiday)
      const result = await calculator.calculateEndDate("2025-11-19", 2);

      assert.strictEqual(result.getFullYear(), 2025);
      assert.strictEqual(result.getMonth(), 10);
      assert.strictEqual(result.getDate(), 21); // Friday
    });

    it("should skip consecutive holidays", async () => {
      const holidays = ["2025-11-20", "2025-11-21"]; // Thursday and Friday are holidays
      const calculator = new BusinessDayCalculator(
        new MockHolidayService(holidays),
      );
      // Wednesday November 19, 2025 + 2 = Monday November 24, 2025
      const result = await calculator.calculateEndDate("2025-11-19", 2);

      assert.strictEqual(result.getFullYear(), 2025);
      assert.strictEqual(result.getMonth(), 10);
      assert.strictEqual(result.getDate(), 24); // Monday
    });

    it("should handle starting on a Saturday", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));
      // Saturday November 22, 2025 + 1 = Monday November 24, 2025
      const result = await calculator.calculateEndDate("2025-11-22", 1);

      assert.strictEqual(result.getFullYear(), 2025);
      assert.strictEqual(result.getMonth(), 10);
      assert.strictEqual(result.getDate(), 24); // Monday
    });

    it("should handle starting on a Sunday", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));
      // Sunday November 23, 2025 + 1 = Monday November 24, 2025
      const result = await calculator.calculateEndDate("2025-11-23", 1);

      assert.strictEqual(result.getFullYear(), 2025);
      assert.strictEqual(result.getMonth(), 10);
      assert.strictEqual(result.getDate(), 24); // Monday
    });

    it("should handle starting on a holiday", async () => {
      const holidays = ["2025-11-17"]; // Monday is a holiday
      const calculator = new BusinessDayCalculator(
        new MockHolidayService(holidays),
      );
      // Monday November 17, 2025 (holiday) + 1 = Tuesday November 18, 2025
      const result = await calculator.calculateEndDate("2025-11-17", 1);

      assert.strictEqual(result.getFullYear(), 2025);
      assert.strictEqual(result.getMonth(), 10);
      assert.strictEqual(result.getDate(), 18); // Tuesday
    });

    it("should handle 5 business days (one full week)", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));
      // Monday November 17, 2025 + 5 = Friday November 21, 2025
      const result = await calculator.calculateEndDate("2025-11-17", 5);

      assert.strictEqual(result.getFullYear(), 2025);
      assert.strictEqual(result.getMonth(), 10);
      assert.strictEqual(result.getDate(), 21); // Friday
    });

    it("should handle 10 business days (two full weeks)", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));
      // Monday November 17, 2025 + 10 = Friday November 28, 2025
      const result = await calculator.calculateEndDate("2025-11-17", 10);

      assert.strictEqual(result.getFullYear(), 2025);
      assert.strictEqual(result.getMonth(), 10);
      assert.strictEqual(result.getDate(), 28); // Friday
    });

    it("should handle year transition", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));
      // Wednesday December 31, 2025 + 2 = Thursday January 1, 2026 (no holidays in mock)
      const result = await calculator.calculateEndDate("2025-12-31", 2);

      assert.strictEqual(result.getFullYear(), 2026);
      assert.strictEqual(result.getMonth(), 0); // January
      assert.strictEqual(result.getDate(), 1); // Thursday
    });

    it("should handle February correctly (non-leap year)", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));
      // Friday February 27, 2026 + 2 = Monday March 2, 2026 (skips weekend)
      const result = await calculator.calculateEndDate("2026-02-27", 2);

      assert.strictEqual(result.getFullYear(), 2026);
      assert.strictEqual(result.getMonth(), 2); // March
      assert.strictEqual(result.getDate(), 2);
    });

    it("should handle leap year February", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));
      // Thursday February 27, 2028 + 2 = Monday February 29, 2028 (leap year)
      const result = await calculator.calculateEndDate("2028-02-27", 2);

      assert.strictEqual(result.getFullYear(), 2028);
      assert.strictEqual(result.getMonth(), 1); // February
      assert.strictEqual(result.getDate(), 29);
    });

    it("should reject invalid date format", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));

      await assert.rejects(() => calculator.calculateEndDate("17-11-2025", 5), {
        message: "Start date must be in YYYY-MM-DD format",
      });
    });

    it("should reject zero business days", async () => {
      const calculator = new BusinessDayCalculator(new MockHolidayService([]));

      await assert.rejects(() => calculator.calculateEndDate("2025-11-17", 0), {
        message: "Business days must be a positive integer",
      });
    });
  });

  describe("_shouldUpdateHolidaysCache", () => {
    let calculator;

    beforeEach(() => {
      calculator = new BusinessDayCalculator(new MockHolidayService());
    });

    it("should return true when holidays array has no entries for current year", () => {
      const date = new Date(2026, 0, 1); // January 1, 2026
      const holidays = ["2025-12-25"]; // Only 2025 holidays

      const result = calculator._shouldUpdateHolidaysCache(date, holidays);
      assert.strictEqual(result, true);
    });

    it("should return false when holidays array has entries for current year", () => {
      const date = new Date(2025, 10, 17); // November 17, 2025
      const holidays = ["2025-11-20", "2025-12-25"];

      const result = calculator._shouldUpdateHolidaysCache(date, holidays);
      assert.strictEqual(result, false);
    });
  });
});
