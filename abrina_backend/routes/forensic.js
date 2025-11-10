
import dotenv from "dotenv";

dotenv.config();
import OpenAI from "openai";
import express from "express";

const router = express.Router();

// Initialize OpenAI client with API key
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { caseId, name, role, q1, q2, q3, q4 } = req.body;

    const prompt = `
You are a forensic toxicologist AI assistant.
Based on the following investigation report, decide:
1. Whether poisoning is likely.
2. What probable poison or chemical was found.
3. What tests should be suggested.
4. Give a confidence percentage (0–100).

Respond ONLY in JSON format as:
{
  "isPoisonLikely": true/false,
  "probablePoison": "name",
  "suggestedTests": ["test1", "test2"],
  "confidence": number
}

Investigation Report:
Case ID: ${caseId}
Investigator: ${name}
Role: ${role}
Sample details: ${q1}
Detected chemical: ${q2}
Found in: ${q3}
Estimated time: ${q4}
`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    let text = completion.output_text.trim();
    let result;

    try {
      result = JSON.parse(text);
    } catch {
      console.log("⚠️ AI response not JSON:", text);
      result = {
        isPoisonLikely: false,
        probablePoison: "Unknown",
        suggestedTests: [],
        confidence: 0,
      };
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Backend Error:", err.message);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
});

export default router;
