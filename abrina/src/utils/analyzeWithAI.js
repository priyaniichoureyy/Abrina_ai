// frontend/src/utils/analyzeWithAI.js
import OpenAI from "openai";

export async function analyzeWithAI(role, formData) {
  // Prevent crash if API key missing
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing OpenAI API key. Check your .env file.");
    return {
      isPoisonLikely: false,
      probablePoison: "Unknown",
      confidence: 0,
      suggestedTests: ["Basic Toxicology Screen"],
      comment: "API key missing — cannot analyze case.",
    };
  }

  const client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  // Role-specific prompts
  const prompts = {
    doctor: `You are a forensic AI assisting a DOCTOR analyzing poisoning symptoms and treatments.`,
    police: `You are a forensic AI assisting POLICE analyzing scene evidence and witness reports.`,
    postmortem: `You are a forensic AI assisting POSTMORTEM officers analyzing tissue and organ findings.`,
    forensic: `You are a forensic AI analyzing lab test results and reagents.`,
  };

  const prompt = prompts[role] || prompts["forensic"];
  const input = Object.entries(formData)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `${prompt}\nReturn output only in JSON format.` },
        { role: "user", content: input },
      ],
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "";
    console.log("🧠 AI Raw Output:", raw);

    let parsed;
    try {
      const jsonText = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = {
        isPoisonLikely: false,
        probablePoison: "Unknown",
        confidence: 0,
        suggestedTests: ["Basic Toxicology Screen"],
        comment: "AI response unreadable or incomplete.",
      };
    }

    return parsed;
  } catch (err) {
    console.error("AI Error:", err);
    return {
      isPoisonLikely: false,
      probablePoison: "Unknown",
      confidence: 0,
      suggestedTests: ["Basic Toxicology Screen"],
      comment: "AI request failed or API key invalid.",
    };
  }
}
