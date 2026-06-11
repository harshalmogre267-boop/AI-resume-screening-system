import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing (supporting large resume texts)
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Warn if API key is not configured
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️  WARNING: GEMINI_API_KEY environment variable is not set. All AI analysis requests will fail/fallback.");
}

// Endpoint to analyze resume
app.post('/api/analyze', async (req, res) => {
  const { resumeText, jobDescription, fileName, modelName = 'gemini-1.5-flash' } = req.body;

  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: "Missing resumeText or jobDescription in request body." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ 
      error: "Gemini API key is not configured on the backend server. Please set the GEMINI_API_KEY in the .env file." 
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = `
You are an expert ATS (Applicant Tracking System) recruiter parser.
Analyze the following candidate's Resume Text and compare it against the Job Description.

Job Description:
"""
${jobDescription}
"""

Resume Text:
"""
${resumeText}
"""

File Name: ${fileName || 'unnamed_resume'}

Your task is to extract candidate details and evaluate their match for the job description.
Return a STRICT JSON object in the following format:
{
  "candidateName": "Candidate's Full Name (extract from resume, or if impossible, deduce cleanly from file name: '${fileName || 'unnamed_resume'}')",
  "contactInfo": {
    "email": "extracted email or 'Not found'",
    "phone": "extracted phone or 'Not found'"
  },
  "matchingScore": (integer between 0 and 100 representing how well the candidate matches the job description based on skills, experience, and role alignment),
  "matchedSkills": ["array of skills in resume that match the job description"],
  "missingSkills": ["array of required skills mentioned in the job description that are missing from the resume"],
  "extraSkills": ["array of notable skills found in the resume that are NOT explicitly required in the job description"],
  "strengths": ["array of 2-3 specific strengths of the candidate relative to this job description"],
  "weaknesses": ["array of 1-2 key areas of improvement or gaps relative to this job description"],
  "feedback": "A concise paragraph of actionable ATS Optimization feedback for the candidate to improve their match score."
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    // Parse the output to verify it's valid JSON
    const data = JSON.parse(jsonText);

    // Ensure proper schema structure before sending back
    return res.json({
      candidateName: data.candidateName || (fileName ? fileName.replace(/\.[^/.]+$/, "") : "Candidate"),
      contactInfo: {
        email: data.contactInfo?.email || 'Not found',
        phone: data.contactInfo?.phone || 'Not found'
      },
      matchingScore: typeof data.matchingScore === 'number' ? data.matchingScore : 50,
      matchedSkills: Array.isArray(data.matchedSkills) ? data.matchedSkills : [],
      missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
      extraSkills: Array.isArray(data.extraSkills) ? data.extraSkills : [],
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
      feedback: data.feedback || "Good candidate. Ensure missing keywords are added to optimize for ATS."
    });

  } catch (error) {
    console.error("Gemini API backend error:", error);
    return res.status(500).json({ 
      error: `Gemini API execution failed: ${error.message || error}` 
    });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Secure AI Screening API Proxy listening on port ${PORT}`);
});
