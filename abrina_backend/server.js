import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import doctorRoutes from "./routes/doctor.js";
import forensicRoutes from "./routes/forensic.js";
import postmortemRoutes from "./routes/postmortem.js";
import policeRoutes from "./routes/police.js";
import analyzeRoutes from "./routes/analyze.js";


console.log("🔑 OpenAI Key Loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");

const app = express();

app.use(cors());
app.use(express.json());

// Connect APIs
app.use("/api/doctor", doctorRoutes);
app.use("/api/forensic", forensicRoutes);
app.use("/api/postmortem", postmortemRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/analyze", analyzeRoutes);


app.get("/", (req, res) => {
  res.send("Poison Detection Backend Running Successfully!");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
