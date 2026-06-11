import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, Star, FileCheck, UserCheck } from 'lucide-react';
import { extractText } from './ResumeParser';
import { analyzeResumeWithAI } from './AIService';

export default function CandidateDashboard() {
  const [jdText, setJdText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!jdText.trim()) {
      setError("Please paste a target Job Description first.");
      return;
    }
    if (!file) {
      setError("Please upload your resume file.");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Extract text from uploaded resume
      const text = await extractText(file);
      
      // 2. Query AI / local service for comparison
      const analysis = await analyzeResumeWithAI(text, jdText, file.name);
      
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Score styling
  const scoreColorClass = result?.matchingScore >= 80 ? 'high' : result?.matchingScore >= 50 ? 'medium' : 'low';
  
  // Radial stroke calculation
  const strokeDashoffset = result ? 251.2 - (251.2 * result.matchingScore) / 100 : 251.2;

  return (
    <div className="candidate-view">
      {/* Upload Column / Section */}
      <div className="dual-columns">
        <div className="card">
          <h3 className="card-title">
            <UserCheck size={18} />
            <span>Target Job Description</span>
          </h3>
          <textarea
            className="textarea-field"
            style={{ height: '200px' }}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job requirements description you want to optimize your resume for..."
          />
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className="card-title">
            <FileText size={18} />
            <span>Upload Your Resume</span>
          </h3>
          
          <div 
            className={`upload-zone ${dragActive ? 'dragging' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            style={{ padding: '2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <div className="upload-icon" style={{ width: '50px', height: '50px' }}>
              <Upload size={22} />
            </div>
            
            {file ? (
              <div>
                <p className="upload-title" style={{ color: 'var(--primary)' }}>{file.name}</p>
                <p className="upload-subtitle">Click or drag another to replace</p>
              </div>
            ) : (
              <div>
                <p className="upload-title">Select Resume File</p>
                <p className="upload-subtitle">PDF, DOCX, TXT formats supported</p>
              </div>
            )}
            
            <input 
              type="file" 
              className="file-input"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Optimize & Match</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State Overlay / Panel */}
      {loading && (
        <div className="card loader-container">
          <div className="spinner"></div>
          <h3 className="pulse">Scrutinizing qualifications...</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Comparing skills, extracting alignments, and compiling optimization recommendations.</p>
        </div>
      )}

      {/* Results Panel */}
      {result && !loading && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="section-header-row" style={{ margin: 0 }}>
            <h3 className="card-title" style={{ margin: 0 }}>
              <FileCheck size={20} style={{ color: 'var(--success)' }} />
              <span>ATS Resume Alignment Report</span>
            </h3>
            
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Candidate: <strong>{result.candidateName}</strong>
            </span>
          </div>

          {/* Radial score gauge */}
          <div className="score-gauge-container">
            <div className="circular-progress">
              <svg>
                <circle className="bg-circle" cx="45" cy="45" r="40" />
                <circle 
                  className={`progress-circle ${scoreColorClass}`} 
                  cx="45" 
                  cy="45" 
                  r="40" 
                  style={{ strokeDashoffset }}
                />
              </svg>
              <div className="percentage-text" style={{ fontSize: '1.3rem' }}>{result.matchingScore}%</div>
            </div>
            
            <div className="score-meta">
              <h3>Match Quality: {result.matchingScore >= 80 ? 'Excellent' : result.matchingScore >= 50 ? 'Moderate' : 'Critical Gaps'}</h3>
              <p>Your resume overlaps with {result.matchedSkills.length} core job competencies. Let's look at the skill gap feedback to push it above 85%.</p>
            </div>
          </div>

          {/* Skills categorizations */}
          <div className="skills-section">
            {result.matchedSkills.length > 0 && (
              <div className="skills-category">
                <span className="category-title">Matched Skills ({result.matchedSkills.length})</span>
                <div className="skills-list">
                  {result.matchedSkills.map((s, i) => (
                    <span key={i} className="skill-chip matched">
                      <CheckCircle size={12} /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.missingSkills.length > 0 && (
              <div className="skills-category">
                <span className="category-title">Missing Core Skills ({result.missingSkills.length})</span>
                <div className="skills-list">
                  {result.missingSkills.map((s, i) => (
                    <span key={i} className="skill-chip missing">
                      &times; {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.extraSkills.length > 0 && (
              <div className="skills-category">
                <span className="category-title">Additional Assets ({result.extraSkills.length})</span>
                <div className="skills-list">
                  {result.extraSkills.map((s, i) => (
                    <span key={i} className="skill-chip extra">
                      + {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Insights (Strengths/Weaknesses) */}
          <div className="insights-grid">
            <div className="insight-card strengths">
              <div className="insight-title">
                <Star size={14} />
                <span>Resume Strengths</span>
              </div>
              <ul className="insight-list">
                {result.strengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="insight-card weaknesses">
              <div className="insight-title">
                <AlertCircle size={14} />
                <span>Identified Resume Gaps</span>
              </div>
              <ul className="insight-list">
                {result.weaknesses.map((weak, i) => (
                  <li key={i}>{weak}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Feedback */}
          <div className="feedback-card">
            <h3>
              <Sparkles size={16} />
              <span>ATS Optimization Advice</span>
            </h3>
            <p>{result.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
