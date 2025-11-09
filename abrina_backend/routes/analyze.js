import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { answers } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a forensic toxicology expert. Reply ONLY with valid JSON in this exact format: {\"poison\": \"\", \"confidence\": 0, \"comment\": \"\", \"suggested_tests\": []}. Identify any poison, including rare or plant-based ones.",
          },
          {
            role: "user",
            content: `Analyze this forensic poisoning report:\n${JSON.stringify(
              answers
            )}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) throw new Error("Empty AI response");

    const json = JSON.parse(text);
    res.json(json);
  } catch (err) {
    console.error("AI analysis failed:", err.message);
    res.status(500).json({ error: "AI analysis failed", details: err.message });
  }
});

export default router;
