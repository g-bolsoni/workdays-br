import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import BusinessDayController from "../../src/controllers/BusinessDayController.js";

/**
 * Mock Calculator for testing
 */
class MockCalculator {
  constructor(shouldThrow = false, throwMessage = "Mock error") {
    this.shouldThrow = shouldThrow;
    this.throwMessage = throwMessage;
    this.lastCall = null;
  }

  async calculateEndDate(startDate, businessDays) {
    this.lastCall = { startDate, businessDays };

    if (this.shouldThrow) {
      throw new Error(this.throwMessage);
    }

    // Return a fixed date for testing (November 21, 2025)
    return new Date(2025, 10, 21, 12, 0, 0);
  }
}

/**
 * Creates mock Express request object
 */
function createMockRequest(body = {}) {
  return { body };
}

/**
 * Creates mock Express response object
 */
function createMockResponse() {
  const res = {
    statusCode: 200,
    responseData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    },
  };
  return res;
}

describe("BusinessDayController", () => {
  describe("constructor", () => {
    it("should accept a custom calculator", () => {
      const mockCalculator = new MockCalculator();
      const controller = new BusinessDayController(mockCalculator);

      assert.strictEqual(controller.calculator, mockCalculator);
    });
  });

  describe("calculateBusinessDays", () => {
    let controller;
    let mockCalculator;

    beforeEach(() => {
      mockCalculator = new MockCalculator();
      controller = new BusinessDayController(mockCalculator);
    });

    it("should return 400 when startDate is missing", async () => {
      const req = createMockRequest({ businessDays: 5 });
      const res = createMockResponse();

      await controller.calculateBusinessDays(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.responseData.error, "Missing required fields");
      assert.ok(res.responseData.requiredFields.includes("startDate"));
    });

    it("should return 400 when businessDays is missing", async () => {
      const req = createMockRequest({ startDate: "2025-11-17" });
      const res = createMockResponse();

      await controller.calculateBusinessDays(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.responseData.error, "Missing required fields");
      assert.ok(res.responseData.requiredFields.includes("businessDays"));
    });

    it("should return 400 when both fields are missing", async () => {
      const req = createMockRequest({});
      const res = createMockResponse();

      await controller.calculateBusinessDays(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.responseData.error, "Missing required fields");
    });

    it("should return success response with valid inputs", async () => {
      const req = createMockRequest({
        startDate: "2025-11-17",
        businessDays: 5,
      });
      const res = createMockResponse();

      await controller.calculateBusinessDays(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.responseData.success, true);
      assert.strictEqual(res.responseData.data.startDate, "2025-11-17");
      assert.strictEqual(res.responseData.data.businessDays, 5);
      assert.strictEqual(res.responseData.data.endDate, "2025-11-21");
    });

    it("should pass correct parameters to calculator", async () => {
      const req = createMockRequest({
        startDate: "2025-11-17",
        businessDays: 10,
      });
      const res = createMockResponse();

      await controller.calculateBusinessDays(req, res);

      assert.strictEqual(mockCalculator.lastCall.startDate, "2025-11-17");
      assert.strictEqual(mockCalculator.lastCall.businessDays, 10);
    });

    it("should return 400 for validation errors (format)", async () => {
      const errorCalculator = new MockCalculator(
        true,
        "Start date must be in YYYY-MM-DD format",
      );
      const errorController = new BusinessDayController(errorCalculator);

      const req = createMockRequest({
        startDate: "17-11-2025",
        businessDays: 5,
      });
      const res = createMockResponse();

      await errorController.calculateBusinessDays(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.responseData.error, "Validation Error");
    });

    it("should return 400 for validation errors (invalid)", async () => {
      const errorCalculator = new MockCalculator(
        true,
        "Business days must be a positive invalid integer",
      );
      const errorController = new BusinessDayController(errorCalculator);

      const req = createMockRequest({
        startDate: "2025-11-17",
        businessDays: -5,
      });
      const res = createMockResponse();

      await errorController.calculateBusinessDays(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.responseData.error, "Validation Error");
    });

    it("should return 500 for unexpected errors", async () => {
      const errorCalculator = new MockCalculator(
        true,
        "Database connection failed",
      );
      const errorController = new BusinessDayController(errorCalculator);

      const req = createMockRequest({
        startDate: "2025-11-17",
        businessDays: 5,
      });
      const res = createMockResponse();

      await errorController.calculateBusinessDays(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.responseData.error, "Internal Server Error");
    });

    it("should not expose internal error details in 500 response", async () => {
      const errorCalculator = new MockCalculator(
        true,
        "Secret database password leaked",
      );
      const errorController = new BusinessDayController(errorCalculator);

      const req = createMockRequest({
        startDate: "2025-11-17",
        businessDays: 5,
      });
      const res = createMockResponse();

      await errorController.calculateBusinessDays(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.ok(!res.responseData.message.includes("Secret"));
      assert.ok(!res.responseData.message.includes("password"));
    });

    it("should handle businessDays as number (not string)", async () => {
      const req = createMockRequest({
        startDate: "2025-11-17",
        businessDays: 5, // number, not "5"
      });
      const res = createMockResponse();

      await controller.calculateBusinessDays(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.responseData.success, true);
    });
  });

  describe("_handleError", () => {
    let controller;
    let mockCalculator;

    beforeEach(() => {
      mockCalculator = new MockCalculator();
      controller = new BusinessDayController(mockCalculator);
    });

    it('should return 400 for errors containing "format"', () => {
      const res = createMockResponse();
      const error = new Error("Invalid date format");

      controller._handleError(error, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.responseData.error, "Validation Error");
    });

    it('should return 400 for errors containing "invalid" (lowercase)', () => {
      const res = createMockResponse();
      const error = new Error("This is an invalid input");

      controller._handleError(error, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.responseData.error, "Validation Error");
    });

    it("should return 500 for generic errors", () => {
      const res = createMockResponse();
      const error = new Error("Something went wrong");

      controller._handleError(error, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.responseData.error, "Internal Server Error");
    });

    it("should include the original error message in validation errors", () => {
      const res = createMockResponse();
      const error = new Error("Start date must be in YYYY-MM-DD format");

      controller._handleError(error, res);

      assert.strictEqual(
        res.responseData.message,
        "Start date must be in YYYY-MM-DD format",
      );
    });
  });
});
