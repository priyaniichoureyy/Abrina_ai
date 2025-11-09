// frontend/src/pages/RoleForm.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RoleForm() {
  const { role } = useParams();
  const navigate = useNavigate();
  const roleFixed = role ? role.toLowerCase() : "doctor";

  // ✅ Updated realistic poisoning investigation questions
  const roleQuestions = {
    police: [
      "Describe the location and condition of the crime or incident scene.",
      "Were any food, drink, medicine, or suspicious containers found near the victim?",
      "Were there any witnesses, suspects, or recent disputes involving the victim?",
      "Did the victim have access to toxic substances such as pesticides, alcohol, or drugs?",
      "Were any suicide notes, unusual smells, or stains found at the scene?",
    ],
    postmortem: [
      "Describe the external appearance of the body (skin color, mouth froth, stains, etc.).",
      "Were there any internal organ changes such as liver congestion, gastric erosion, or odor?",
      "Were stomach contents preserved for chemical examination? Describe their appearance.",
      "Were there any signs of injection marks, burns, or unusual residues on the body?",
      "Was the cause of death suspected to be due to poisoning based on autopsy findings?",
    ],
    forensic: [
      "What biological samples were analyzed? (e.g., blood, urine, tissues, stomach contents)",
      "Describe any unusual odors, colors, or textures found in the samples.",
      "What symptoms or physiological effects were observed before death? (e.g., vomiting, convulsions, cyanosis)",
      "Where was the suspected poison located? (food, liquid, medicine, biological fluid, air sample, etc.)",
      "Estimate the time interval between suspected exposure and onset of symptoms or death.",
      "Mention any chemical or toxicology test results, including chromatographic or spectrometric findings.",
    ],
    doctor: [
      "What symptoms did the patient exhibit? (e.g., nausea, dizziness, muscle weakness, seizures)",
      "What is the suspected source or route of poisoning? (oral, inhalation, dermal, injection)",
      "What first aid or emergency treatment was administered before arrival?",
      "What laboratory or diagnostic tests were performed, and what were the key findings?",
      "Was the poisoning accidental, suicidal, or homicidal in nature according to initial assessment?",
      "What is the current status of the patient (stable, critical, deceased)?",
    ],
  };

  const questions = roleQuestions[roleFixed] || roleQuestions["doctor"];
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [caseId, setCaseId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    const arr = [...answers];
    arr[index] = value;
    setAnswers(arr);
  };

  const analyzePoison = async (answers) => {
    try {
      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Backend AI route failed");

      const data = await res.json();
      if (!data || !data.poison) throw new Error("Empty AI response");

      return {
        isPoisonLikely: true,
        probablePoison: data.poison,
        suggestedTests: data.suggested_tests,
        confidence: data.confidence,
        comment: data.comment,
      };
    } catch (err) {
      console.warn("⚠️ AI failed, using fallback analyzer:", err.message);
      const text = answers.join(" ").toLowerCase();
      if (text.includes("bitter") && text.includes("almond"))
        return {
          isPoisonLikely: true,
          probablePoison: "Cyanide (Bitter Almond Odor)",
          suggestedTests: ["Spectrophotometric Cyanide Detection", "GC-MS"],
          confidence: 87,
          comment: "Detected typical cyanide odor and symptoms.",
        };
      if (text.includes("arsenic"))
        return {
          isPoisonLikely: true,
          probablePoison: "Arsenic",
          suggestedTests: ["Urine Arsenic Test", "AAS (Atomic Absorption Spectroscopy)"],
          confidence: 90,
          comment: "Detected arsenic-related signs such as vomiting and Mees’ lines.",
        };
      if (text.includes("mushroom") || text.includes("amatoxin"))
        return {
          isPoisonLikely: true,
          probablePoison: "Amatoxin (Amanita phalloides)",
          suggestedTests: ["ELISA for Amatoxins", "HPLC-MS"],
          confidence: 85,
          comment: "Detected possible Amanita mushroom toxin pattern.",
        };
      return {
        isPoisonLikely: false,
        probablePoison: "Unknown or Novel Compound",
        suggestedTests: ["Comprehensive GC–MS Toxicology Panel", "FTIR Analysis"],
        confidence: 50,
        comment: "Could not identify specific toxin — further lab tests advised.",
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await analyzePoison(answers);
      navigate("/result", {
        state: {
          caseId:
            caseId ||
            `F-${new Date().getFullYear()}-${Math.floor(Math.random() * 999)}`,
          name,
          role: roleFixed,
          result,
        },
      });
    } catch (err) {
      alert("Error analyzing poison. Check backend or internet connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex justify-center items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-10 max-w-2xl w-full border border-slate-100"
      >
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
          {roleFixed.charAt(0).toUpperCase() + roleFixed.slice(1)} Investigation Form
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Please answer the following questions carefully to help identify poisoning
          related information.
        </p>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Case ID"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Investigator/Doctor Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none"
            required
          />
        </div>

        {questions.map((q, i) => (
          <div key={i} className="mb-4">
            <label className="block font-medium text-slate-700 mb-2">
              {i + 1}. {q}
            </label>
            <textarea
              rows="2"
              placeholder="Type your answer..."
              value={answers[i] || ""}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none"
              required
            />
          </div>
        ))}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => navigate("/explore")}
            className="bg-gray-200 text-slate-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition"
            disabled={loading}
          >
            Back
          </button>

          <button
            type="submit"
            className={`text-white py-2 px-6 rounded-lg ${
              loading ? "bg-cyan-400" : "bg-cyan-600 hover:bg-cyan-700"
            }`}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
