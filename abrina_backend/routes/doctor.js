// routes/doctor.js
import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { answers } = req.body;

    // ✅ answers comes as an object like {0: "vomiting", 1: "...", 2: "..."}
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ message: "No answers provided" });
    }

    // Combine all text
    const inputText = Object.values(answers).join(" ").toLowerCase();

    // 🔬 Keyword-based detection (you can expand this)
    let result = {
      isPoisonLikely: false,
      probablePoison: "None detected",
      suggestedTests: [
        "Basic toxicology screen",
        "Blood and urine test for unknown toxins",
      ],
      confidence: 60,
    };

    // 💉 Poison detection logic
    if (inputText.includes("vomit") || inputText.includes("diarrhea")) {
      result = {
        isPoisonLikely: true,
        probablePoison: "Arsenic or Food Poisoning",
        suggestedTests: [
          "Urine arsenic test",
          "Blood heavy metal test",
          "Stool examination",
        ],
        confidence: 85,
      };
    } else if (
      inputText.includes("convulsion") ||
      inputText.includes("seizure") ||
      inputText.includes("spasm")
    ) {
      result = {
        isPoisonLikely: true,
        probablePoison: "Strychnine Poisoning",
        suggestedTests: [
          "Urine test for strychnine",
          "Blood toxicology screen",
        ],
        confidence: 90,
      };
    } else if (inputText.includes("blue") || inputText.includes("cyanosis")) {
      result = {
        isPoisonLikely: true,
        probablePoison: "Cyanide Poisoning",
        suggestedTests: [
          "Blood cyanide level",
          "Lactate level",
          "Pulse oximetry",
        ],
        confidence: 92,
      };
    } else if (
      inputText.includes("burning") ||
      inputText.includes("acid") ||
      inputText.includes("corrosion")
    ) {
      result = {
        isPoisonLikely: true,
        probablePoison: "Corrosive Ingestion (Acid/Alkali)",
        suggestedTests: [
          "Endoscopy",
          "pH test of vomitus",
          "Oral cavity examination",
        ],
        confidence: 88,
      };
    } else if (inputText.includes("garlic") || inputText.includes("odor")) {
      result = {
        isPoisonLikely: true,
        probablePoison: "Phosphorus or Organophosphate Poisoning",
        suggestedTests: [
          "Cholinesterase activity test",
          "Plasma phosphorus test",
        ],
        confidence: 80,
      };
    }

    return res.json(result);
  } catch (err) {
    console.error("Error in /api/doctor:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
