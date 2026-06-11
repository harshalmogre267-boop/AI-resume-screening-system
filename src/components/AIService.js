

// A comprehensive list of common professional skills for local/sandbox parsing fallback
const SKILLS_DATABASE = [
  'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'nodejs', 'express',
  'next.js', 'nextjs', 'nest.js', 'python', 'django', 'flask', 'fastapi', 'java', 'spring',
  'c++', 'c#', 'ruby', 'rails', 'php', 'laravel', 'go', 'golang', 'rust', 'sql', 'mysql',
  'postgresql', 'mongodb', 'redis', 'graphql', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'ci/cd', 'github', 'git', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery',
  'webpack', 'vite', 'redux', 'mobx', 'graphql', 'rest api', 'apollo', 'figma', 'ui/ux',
  'scrum', 'agile', 'jira', 'confluence', 'machine learning', 'deep learning', 'tensorflow',
  'pytorch', 'data analysis', 'excel', 'tableau', 'power bi', 'pandas', 'numpy', 'spark',
  'project management', 'product management', 'product design', 'marketing', 'seo', 'sem',
  'copywriting', 'communication', 'leadership', 'teamwork', 'problem solving', 'sales'
];

/**
 * Normalizes text for keyword matching.
 * @param {string} text 
 */
function normalizeText(text) {
  return text.toLowerCase()
    .replace(/[^\w\s.#+]/g, ' ') // keep dots for next.js, hash for c#, plus for c++
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts skills from a given text using our database.
 * @param {string} text 
 * @returns {string[]}
 */
export function extractSkillsLocally(text) {
  const norm = normalizeText(text);
  const found = new Set();
  
  SKILLS_DATABASE.forEach(skill => {
    // Word boundary checks to prevent false matches (e.g. "go" matching "google" or "golang")
    let regex;
    if (skill === 'go') {
      regex = new RegExp('\\bgo\\b');
    } else if (skill === 'c++') {
      regex = new RegExp('c\\+\\+');
    } else if (skill === 'c#') {
      regex = new RegExp('c#');
    } else if (skill === '.net') {
      regex = new RegExp('\\.net\\b');
    } else {
      regex = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`);
    }
    
    if (regex.test(norm)) {
      // capitalize nicely
      const prettyName = skill === 'javascript' ? 'JavaScript'
        : skill === 'typescript' ? 'TypeScript'
        : skill === 'react' ? 'React'
        : skill === 'vue' ? 'Vue.js'
        : skill === 'angular' ? 'Angular'
        : skill === 'node.js' || skill === 'nodejs' ? 'Node.js'
        : skill === 'next.js' || skill === 'nextjs' ? 'Next.js'
        : skill === 'python' ? 'Python'
        : skill === 'aws' ? 'AWS'
        : skill === 'gcp' ? 'GCP'
        : skill === 'ui/ux' ? 'UI/UX'
        : skill.charAt(0).toUpperCase() + skill.slice(1);
      
      found.add(prettyName);
    }
  });

  return Array.from(found);
}

/**
 * Analyzes resume locally (Sandbox Mode fallback).
 * @param {string} resumeText 
 * @param {string} jobDescription 
 * @param {string} fileName 
 */
export function analyzeResumeLocally(resumeText, jobDescription, fileName) {
  const candidateSkills = extractSkillsLocally(resumeText);
  const jdSkills = extractSkillsLocally(jobDescription);
  
  // Try to extract name: look at the first line of the resume, cleaning up spaces
  const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let candidateName = "Unknown Candidate";
  
  if (lines.length > 0) {
    // Simple heuristic: The first line is often the candidate name if it is short
    const firstLine = lines[0];
    if (firstLine.length > 2 && firstLine.length < 35 && !firstLine.toLowerCase().includes('resume') && !firstLine.toLowerCase().includes('curriculum')) {
      candidateName = firstLine;
    } else {
      // Fallback to cleaning up the filename
      const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      candidateName = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  
  // Try to extract email and phone using simple regex
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  
  const emails = resumeText.match(emailRegex);
  const phones = resumeText.match(phoneRegex);
  
  const contactInfo = {
    email: emails ? emails[0] : 'Not found',
    phone: phones ? phones[0] : 'Not found'
  };
  
  // Calculate match score
  let matchingScore = 50; // baseline
  let matchedSkills = [];
  let missingSkills = [];
  let extraSkills = [];
  
  if (jdSkills.length > 0) {
    matchedSkills = candidateSkills.filter(s => jdSkills.some(j => j.toLowerCase() === s.toLowerCase()));
    missingSkills = jdSkills.filter(s => !candidateSkills.some(c => c.toLowerCase() === s.toLowerCase()));
    extraSkills = candidateSkills.filter(s => !jdSkills.some(j => j.toLowerCase() === s.toLowerCase()));
    
    const scoreFraction = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) : 0.5;
    matchingScore = Math.round(scoreFraction * 100);
    // bound between 10 and 99 for realism
    matchingScore = Math.max(10, Math.min(99, matchingScore));
  } else {
    // If no skills detected in JD, do a simple word overlap
    matchedSkills = candidateSkills.slice(0, 3);
    missingSkills = ["N/A (Provide skills in Job Description)"];
    extraSkills = candidateSkills.slice(3);
    matchingScore = 60;
  }
  
  // Generate feedback
  const strengths = [];
  const weaknesses = [];
  
  if (matchedSkills.length > 0) {
    strengths.push(`Possesses key skills matching the job requirements: ${matchedSkills.slice(0, 3).join(', ')}.`);
  } else {
    strengths.push("Shows general professional experience and structured presentation.");
  }
  
  if (resumeText.length > 1500) {
    strengths.push("Comprehensive resume with detailed project descriptions.");
  } else {
    strengths.push("Concise and easy-to-read one-page format.");
  }
  
  if (missingSkills.length > 0) {
    weaknesses.push(`Lacks explicit mentions of required skills like: ${missingSkills.slice(0, 3).join(', ')}.`);
  } else {
    weaknesses.push("No major skill gaps identified for the listed core skills.");
  }
  
  let feedbackText = `To improve your compatibility, consider incorporating projects that demonstrate your experience in ${missingSkills.length > 0 ? missingSkills.slice(0, 2).join(' and ') : 'advanced system design'}. Highlight key metrics and achievements.`;
  
  return {
    candidateName,
    contactInfo,
    matchingScore,
    matchedSkills,
    missingSkills,
    extraSkills,
    strengths,
    weaknesses,
    feedback: feedbackText
  };
}

/**
 * Analyzes resume using Google Gemini API via the secure backend proxy.
 * @param {string} resumeText 
 * @param {string} jobDescription 
 * @param {string} fileName 
 * @param {string} modelName
 */
export async function analyzeResumeWithAI(resumeText, jobDescription, fileName, modelName = 'gemini-1.5-flash') {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
        fileName,
        modelName,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Secure API Proxy Error:", error);
    // If backend proxy fails, gracefully fallback to local parser and add a warning
    const localResult = analyzeResumeLocally(resumeText, jobDescription, fileName);
    localResult.feedback = `[Fallback Mode: ${error.message}] ` + localResult.feedback;
    return localResult;
  }
}
