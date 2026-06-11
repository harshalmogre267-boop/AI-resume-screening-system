import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, Download, Plus, Search, Filter, Trash2 } from 'lucide-react';
import { extractText } from './ResumeParser';
import { analyzeResumeWithAI } from './AIService';

// Pre-defined job description templates for easy recruiter testing
const JD_TEMPLATES = {
  frontend: `Role: Senior Frontend Developer
Required Skills: React, JavaScript, TypeScript, CSS, HTML, Redux, Vite, Tailwind CSS, UI/UX, Git, Webpack, Figma.
Responsibilities:
- Build high-performance, beautiful user interfaces using React.
- Collaborate with design teams to build glassmorphic UI systems.
- Optimize frontend components for maximum rendering speed.`,

  backend: `Role: Senior Backend & AI Engineer
Required Skills: Python, Django, FastAPI, SQL, PostgreSQL, Docker, Kubernetes, AWS, REST API, Git, Redis, Machine Learning, PyTorch.
Responsibilities:
- Architect scalable microservices in Python and FastAPI.
- Manage databases, optimize queries and set up container workloads.
- Integrate large language models and machine learning pipelines.`,

  pm: `Role: Technical Product Manager
Required Skills: Product Management, Agile, Scrum, Jira, SQL, Product Design, Communication, Leadership, Excel, Roadmapping.
Responsibilities:
- Define product requirements documents and long-term roadmap.
- Run agile sprints, manage backlogs and prioritize issues.
- Coordinate between engineering, sales and executive stakeholders.`
};

// Pre-defined demo resumes for one-click testing
const DEMO_RESUMES = [
  {
    name: "Jane_Doe_React_Developer.pdf",
    text: `Jane Doe
Email: jane.doe@example.com | Phone: 555-0199
SUMMARY
Passionate Senior Frontend Developer with 5+ years of experience designing and building beautiful, responsive web applications in React and JavaScript.
EXPERIENCE
Senior Frontend Developer | TechFlow Inc. (2022 - Present)
- Architected a custom UI component library using React, TypeScript, and Tailwind CSS.
- Replaced Webpack with Vite, reducing build times by 65%.
- Integrated state management systems with Redux Toolkit and REST APIs.
SKILLS
React, JavaScript, TypeScript, HTML, CSS, Tailwind CSS, Vite, Redux, Figma, Git, Webpack, UI/UX`
  },
  {
    name: "Alex_Smith_Python_Backend.docx",
    text: `Alex Smith
Email: alex.smith@example.com | Phone: 555-0143
PROFESSIONAL SUMMARY
Backend developer specializing in Python, microservices architecture, and cloud deployments. Broad expertise in FastAPI, PostgreSQL, and AWS systems.
WORK HISTORY
Lead Platform Developer | NetGrid Systems (2021 - Present)
- Built high-performance, asynchronous REST APIs using FastAPI and Django.
- Containerized system architecture with Docker and deployed workflows on Kubernetes (AWS EKS).
- Optimized PostgreSQL database indexes, boosting query responses by 40%.
TECHNICAL SKILLS
Python, FastAPI, Django, SQL, PostgreSQL, AWS, Docker, Kubernetes, Git, REST API, Redis`
  },
  {
    name: "Sarah_Jenkins_Product_Manager.pdf",
    text: `Sarah Jenkins
Email: sarah.j@example.com | Phone: 555-9921
CAREER OBJECTIVE
Detail-oriented Technical Product Manager with background in engineering, Agile development, and cross-functional leadership.
EMPLOYMENT HISTORY
Senior Product Manager | LaunchPad Labs (2023 - Present)
- Directed product roadmap and spearheaded sprint planning in Jira under Scrum methodologies.
- Authored several Product Requirement Documents (PRDs) and defined engineering metrics.
- Utilized SQL and Excel to extract user metrics and analytics.
CORE SKILLS
Product Management, Agile, Scrum, Jira, SQL, Product Design, Roadmapping, Excel, Communication, Leadership`
  }
];

export default function RecruiterDashboard({ candidates, setCandidates, onSelectCandidate }) {
  const [jdText, setJdText] = useState(JD_TEMPLATES.frontend);
  const [activeJdTab, setActiveJdTab] = useState('frontend');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // file.name -> status ('parsing', 'analyzing', 'success', 'error')
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all'); // 'all', 'high' (>80), 'medium' (50-80), 'low' (<50)
  
  const fileInputRef = useRef(null);

  // Handle deleting a candidate
  const handleDeleteCandidate = (candidateId, fileName) => {
    if (window.confirm("Are you sure you want to delete this candidate's resume?")) {
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      if (fileName) {
        setUploadProgress(prev => {
          const copy = { ...prev };
          delete copy[fileName];
          return copy;
        });
      }
    }
  };

  // Handle preset JDs
  const handleJdPreset = (key) => {
    setActiveJdTab(key);
    setJdText(JD_TEMPLATES[key]);
  };

  // Process files
  const processFiles = async (files) => {
    const newProgress = { ...uploadProgress };
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newProgress[file.name] = 'parsing';
      setUploadProgress({ ...newProgress });

      try {
        // 1. Extract text from file
        const text = await extractText(file);
        
        // 2. Update status to analyzing
        newProgress[file.name] = 'analyzing';
        setUploadProgress({ ...newProgress });

        // 3. Analyze using API or Local match
        const analysis = await analyzeResumeWithAI(text, jdText, file.name);

        // 4. Add candidate
        setCandidates(prev => {
          // Check if candidate already exists (by name or file name) and update, else append
          const existsIdx = prev.findIndex(c => c.fileName === file.name);
          const updatedCandidate = {
            ...analysis,
            id: existsIdx >= 0 ? prev[existsIdx].id : Date.now() + i,
            fileName: file.name,
            extractedText: text,
            analyzedAt: new Date().toLocaleTimeString()
          };

          if (existsIdx >= 0) {
            const copy = [...prev];
            copy[existsIdx] = updatedCandidate;
            return copy;
          } else {
            return [...prev, updatedCandidate];
          }
        });

        newProgress[file.name] = 'success';
      } catch (err) {
        console.error(err);
        newProgress[file.name] = 'error';
      }
      setUploadProgress({ ...newProgress });
    }
  };

  // Drag-and-drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Demo Resumes injection
  const handleLoadDemoResumes = async () => {
    const newProgress = { ...uploadProgress };
    
    for (let i = 0; i < DEMO_RESUMES.length; i++) {
      const resume = DEMO_RESUMES[i];
      newProgress[resume.name] = 'analyzing';
      setUploadProgress({ ...newProgress });
      
      try {
        // Introduce small lag for premium visual loading feel
        await new Promise(r => setTimeout(r, 600));
        
        const analysis = await analyzeResumeWithAI(resume.text, jdText, resume.name);
        
        setCandidates(prev => {
          const existsIdx = prev.findIndex(c => c.fileName === resume.name);
          const updatedCandidate = {
            ...analysis,
            id: existsIdx >= 0 ? prev[existsIdx].id : Date.now() + i,
            fileName: resume.name,
            extractedText: resume.text,
            analyzedAt: new Date().toLocaleTimeString()
          };
          if (existsIdx >= 0) {
            const copy = [...prev];
            copy[existsIdx] = updatedCandidate;
            return copy;
          } else {
            return [...prev, updatedCandidate];
          }
        });
        
        newProgress[resume.name] = 'success';
      } catch (err) {
        newProgress[resume.name] = 'error';
      }
      setUploadProgress({ ...newProgress });
    }
  };

  // Clear upload history list
  const clearUploads = () => {
    setUploadProgress({});
  };

  // CSV Exporter
  const handleDownloadReport = () => {
    if (candidates.length === 0) return;
    
    // Sort candidates by score descending
    const sorted = [...candidates].sort((a, b) => b.matchingScore - a.matchingScore);
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rank,Candidate Name,Email,Phone,Match Score %,Matched Skills,Missing Skills\n";
    
    sorted.forEach((c, idx) => {
      const matched = `"${c.matchedSkills.join(', ')}"`;
      const missing = `"${c.missingSkills.join(', ')}"`;
      csvContent += `${idx + 1},"${c.candidateName}","${c.contactInfo.email}","${c.contactInfo.phone}",${c.matchingScore},${matched},${missing}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TalentLens_Screening_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sort and filter candidates
  const processedCandidates = candidates
    .filter(c => {
      // Search filter
      const matchesSearch = c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.matchedSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.missingSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Score filter
      if (scoreFilter === 'high') return matchesSearch && c.matchingScore >= 80;
      if (scoreFilter === 'medium') return matchesSearch && c.matchingScore >= 50 && c.matchingScore < 80;
      if (scoreFilter === 'low') return matchesSearch && c.matchingScore < 50;
      return matchesSearch;
    })
    // Sort descending by score
    .sort((a, b) => b.matchingScore - a.matchingScore)
    // Add Rank index dynamically based on sorted order
    .map((c, idx) => ({ ...c, rank: idx + 1 }));

  return (
    <div className="dashboard-grid">
      {/* Left panel: Config and upload */}
      <div className="left-panel">
        <div className="card">
          <h3 className="card-title">
            <FileText size={18} />
            <span>Job Description</span>
          </h3>
          
          <div className="jd-selector">
            <button 
              className={`jd-chip ${activeJdTab === 'frontend' ? 'active' : ''}`}
              onClick={() => handleJdPreset('frontend')}
            >
              Frontend React
            </button>
            <button 
              className={`jd-chip ${activeJdTab === 'backend' ? 'active' : ''}`}
              onClick={() => handleJdPreset('backend')}
            >
              Backend Python
            </button>
            <button 
              className={`jd-chip ${activeJdTab === 'pm' ? 'active' : ''}`}
              onClick={() => handleJdPreset('pm')}
            >
              Product Manager
            </button>
          </div>

          <textarea
            className="textarea-field"
            value={jdText}
            onChange={(e) => { setJdText(e.target.value); setActiveJdTab('custom'); }}
            placeholder="Paste target Job Description here..."
          />
        </div>

        <div className="card">
          <div className="section-header-row">
            <h3 className="card-title" style={{ marginBottom: 0 }}>
              <Upload size={18} />
              <span>Resumes Upload</span>
            </h3>
            {Object.keys(uploadProgress).length > 0 && (
              <button onClick={clearUploads} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
                Clear List
              </button>
            )}
          </div>

          <div 
            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <div className="upload-icon">
              <Upload size={28} />
            </div>
            <p className="upload-title">Drag & Drop Resumes</p>
            <p className="upload-subtitle">Supports PDF, DOCX or TXT files</p>
            <input 
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              className="file-input"
              ref={fileInputRef}
              onChange={handleFileChange}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Load Demo Files trigger */}
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleLoadDemoResumes}
              style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
            >
              <Sparkles size={16} />
              <span>Load 3 Demo Resumes</span>
            </button>
          </div>

          {/* Current file uploads progress list */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="file-list">
              {Object.entries(uploadProgress).map(([fileName, status]) => (
                <div key={fileName} className="file-item">
                  <div className="file-info">
                    <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="file-name" title={fileName}>{fileName}</span>
                  </div>
                  
                  <span className={`file-status ${status}`}>
                    {status === 'parsing' && <span>Parsing...</span>}
                    {status === 'analyzing' && <span>Analyzing...</span>}
                    {status === 'success' && <CheckCircle size={12} />}
                    {status === 'error' && <AlertCircle size={12} />}
                    {status === 'success' && <span>Ready</span>}
                    {status === 'error' && <span>Failed</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Candidates table */}
      <div className="right-panel">
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>
              <Sparkles size={20} style={{ color: 'var(--primary)' }} />
              <span>Ranked Candidates ({processedCandidates.length})</span>
            </h3>
            
            <div className="section-actions">
              <button 
                className="btn" 
                onClick={handleDownloadReport}
                disabled={candidates.length === 0}
                style={{ opacity: candidates.length === 0 ? 0.5 : 1 }}
              >
                <Download size={16} />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Search and filter controls */}
          <div style={{ display: 'flex', gap: '0.75rem', margin: '1rem 0', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search name, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select 
                className="input-field" 
                value={scoreFilter} 
                onChange={(e) => setScoreFilter(e.target.value)}
                style={{ padding: '0.5rem 2rem 0.5rem 1rem', width: '150px' }}
              >
                <option value="all">All Scores</option>
                <option value="high">High (&ge; 80%)</option>
                <option value="medium">Medium (50-79%)</option>
                <option value="low">Low (&lt; 50%)</option>
              </select>
            </div>
          </div>

          {/* Table display */}
          {processedCandidates.length === 0 ? (
            <div className="empty-state" style={{ margin: 'auto 0' }}>
              <div className="empty-state-icon">
                <FileText size={48} />
              </div>
              <h3>No Candidates Analyzed Yet</h3>
              <p>Drag and drop candidate resumes or click "Load 3 Demo Resumes" to see rankings instantly based on the job description.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="candidate-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Rank</th>
                    <th>Candidate</th>
                    <th style={{ width: '130px' }}>Match Score</th>
                    <th>Key Skills Matched</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processedCandidates.map((c) => {
                    const pillClass = c.matchingScore >= 80 ? 'high' : c.matchingScore >= 50 ? 'medium' : 'low';
                    const rankClass = c.rank === 1 ? 'rank-1' : c.rank === 2 ? 'rank-2' : c.rank === 3 ? 'rank-3' : 'rank-other';
                    
                    return (
                      <tr key={c.id}>
                        <td>
                          <span className={`rank-badge ${rankClass}`}>{c.rank}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.candidateName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.contactInfo.email}</div>
                        </td>
                        <td>
                          <span className={`score-pill ${pillClass}`}>{c.matchingScore}%</span>
                        </td>
                        <td>
                          <div className="badge-container">
                            {c.matchedSkills.slice(0, 4).map((s, i) => (
                              <span key={i} className="tag-badge">{s}</span>
                            ))}
                            {c.matchedSkills.length > 4 && (
                              <span className="tag-badge" style={{ color: 'var(--primary)' }}>+{c.matchedSkills.length - 4} more</span>
                            )}
                            {c.matchedSkills.length === 0 && (
                              <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>No direct matches</span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}
                              onClick={() => onSelectCandidate(c)}
                            >
                              Review
                            </button>
                            <button 
                              className="btn" 
                              style={{ 
                                padding: '0.35rem 0.5rem', 
                                fontSize: '0.8rem', 
                                borderRadius: '6px',
                                background: 'var(--danger-bg)',
                                borderColor: 'var(--danger-border)',
                                color: 'var(--danger)',
                              }}
                              onClick={() => handleDeleteCandidate(c.id, c.fileName)}
                              title="Delete Candidate"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
