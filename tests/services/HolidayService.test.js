import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import HolidayService from "../../src/services/HolidayService.js";

describe("HolidayService", () => {
  let service;

  beforeEach(() => {
    service = new HolidayService();
    // Clear cache before each test
    service.cache.clear();
  });

  describe("constructor", () => {
    it("should initialize with correct base URL", () => {
      assert.strictEqual(
        service.baseUrl,
        "https://brasilapi.com.br/api/feriados/v1",
      );
    });

    it("should initialize with empty cache", () => {
      assert.strictEqual(service.cache.size, 0);
    });

    it("should use Map for cache", () => {
      assert.ok(service.cache instanceof Map);
    });
  });

  describe("getHolidaysForYear - cache behavior", () => {
    it("should return cached data if available", async () => {
      const cachedHolidays = ["2025-01-01", "2025-12-25"];
      service.cache.set(2025, cachedHolidays);

      const result = await service.getHolidaysForYear(2025);

      assert.deepStrictEqual(result, cachedHolidays);
    });

    it("should not modify cached data", async () => {
      const cachedHolidays = ["2025-01-01", "2025-12-25"];
      service.cache.set(2025, cachedHolidays);

      const result1 = await service.getHolidaysForYear(2025);
      const result2 = await service.getHolidaysForYear(2025);

      assert.strictEqual(result1, result2);
      assert.deepStrictEqual(result1, cachedHolidays);
    });

    it("should return different arrays for different years from cache", async () => {
      service.cache.set(2025, ["2025-01-01"]);
      service.cache.set(2026, ["2026-01-01"]);

      const result2025 = await service.getHolidaysForYear(2025);
      const result2026 = await service.getHolidaysForYear(2026);

      assert.notStrictEqual(result2025, result2026);
    });
  });

  describe("getHolidaysForYear - API integration", () => {
    it("should fetch and cache holidays for a real year", async () => {
      // This is an integration test that hits the real API
      const result = await service.getHolidaysForYear(2025);

      // Should return an array
      assert.ok(Array.isArray(result));

      // Should have holidays (Brazil has ~12 national holidays)
      assert.ok(result.length > 0);

      // Should be cached now
      assert.strictEqual(service.cache.has(2025), true);

      // All dates should be in YYYY-MM-DD format
      result.forEach((date) => {
        assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
      });

      // Should include known fixed holidays
      assert.ok(result.includes("2025-01-01"), "Should include New Year");
      assert.ok(result.includes("2025-12-25"), "Should include Christmas");
    });

    it("should return same results when called twice (from cache)", async () => {
      const result1 = await service.getHolidaysForYear(2025);
      const result2 = await service.getHolidaysForYear(2025);

      assert.deepStrictEqual(result1, result2);
    });
  });

  describe("getHolidaysForYears", () => {
    it("should fetch holidays for multiple years from cache", async () => {
      service.cache.set(2025, ["2025-01-01", "2025-12-25"]);
      service.cache.set(2026, ["2026-01-01", "2026-12-25"]);

      const result = await service.getHolidaysForYears([2025, 2026]);

      assert.deepStrictEqual(result, [
        "2025-01-01",
        "2025-12-25",
        "2026-01-01",
        "2026-12-25",
      ]);
    });

    it("should return empty array for empty years array", async () => {
      const result = await service.getHolidaysForYears([]);

      assert.deepStrictEqual(result, []);
    });

    it("should handle single year array", async () => {
      service.cache.set(2025, ["2025-01-01"]);

      const result = await service.getHolidaysForYears([2025]);

      assert.deepStrictEqual(result, ["2025-01-01"]);
    });

    it("should combine and flatten results from multiple years", async () => {
      service.cache.set(2024, ["2024-01-01"]);
      service.cache.set(2025, ["2025-01-01", "2025-04-21"]);
      service.cache.set(2026, ["2026-01-01"]);

      const result = await service.getHolidaysForYears([2024, 2025, 2026]);

      assert.strictEqual(result.length, 4);
      assert.ok(result.includes("2024-01-01"));
      assert.ok(result.includes("2025-01-01"));
      assert.ok(result.includes("2025-04-21"));
      assert.ok(result.includes("2026-01-01"));
    });

    it("should preserve order (2024 holidays before 2025)", async () => {
      service.cache.set(2024, ["2024-12-25"]);
      service.cache.set(2025, ["2025-01-01"]);

      const result = await service.getHolidaysForYears([2024, 2025]);

      assert.strictEqual(result[0], "2024-12-25");
      assert.strictEqual(result[1], "2025-01-01");
    });
  });

  describe("cache management", () => {
    it("should allow manual cache clearing", () => {
      service.cache.set(2025, ["2025-01-01"]);
      assert.strictEqual(service.cache.size, 1);

      service.cache.clear();
      assert.strictEqual(service.cache.size, 0);
    });

    it("should cache multiple years independently", async () => {
      service.cache.set(2024, ["2024-01-01"]);
      service.cache.set(2025, ["2025-01-01"]);
      service.cache.set(2026, ["2026-01-01"]);

      assert.strictEqual(service.cache.size, 3);
      assert.ok(service.cache.has(2024));
      assert.ok(service.cache.has(2025));
      assert.ok(service.cache.has(2026));
    });
  });
});
