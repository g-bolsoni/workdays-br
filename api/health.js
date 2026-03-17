/**
 * Serverless function for health check
 * GET /api/health
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Only GET method is allowed",
    });
  }

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Business Day Calculator API",
    environment: "Vercel Serverless",
  });
}
