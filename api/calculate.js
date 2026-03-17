import BusinessDayCalculator from "../src/calculators/BusinessDayCalculator.js";
import DateUtils from "../src/utils/DateUtils.js";

/**
 * Serverless function for business day calculation
 * POST /api/calculate
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Only POST method is allowed",
    });
  }

  try {
    const { startDate, businessDays } = req.body;

    // Validate required fields
    if (!startDate || !businessDays) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Both startDate and businessDays are required",
        requiredFields: ["startDate", "businessDays"],
      });
    }

    // Calculate end date
    const calculator = new BusinessDayCalculator();
    const endDate = await calculator.calculateEndDate(startDate, businessDays);
    const formattedEndDate = DateUtils.formatToISODate(endDate);

    // Success response
    res.status(200).json({
      success: true,
      data: {
        startDate,
        businessDays,
        endDate: formattedEndDate,
      },
    });
  } catch (error) {
    console.error("Business day calculation error:", error.message);

    // Handle validation errors
    if (error.message.includes("format") || error.message.includes("invalid")) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.message,
      });
    }

    // Handle other errors
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while calculating business days",
    });
  }
}
