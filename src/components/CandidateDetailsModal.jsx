import React from 'react';
import { X, CheckCircle, AlertCircle, Star, Sparkles, Mail, Phone, FileText, Check, Ban } from 'lucide-react';

export default function CandidateDetailsModal({ candidate, onClose, onUpdateStatus }) {
  if (!candidate) return null;

  const scoreColorClass = candidate.matchingScore >= 80 ? 'high' : candidate.matchingScore >= 50 ? 'medium' : 'low';
  
  // Circle stroke offset calculation
  const strokeDashoffset = 251.2 - (251.2 * candidate.matchingScore) / 100;

  return (
    <>
      {/* Background overlay */}
      <div className="drawer-overlay" onClick={onClose}></div>

      {/* Sliding Drawer Container */}
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h2>{candidate.candidateName}</h2>
            <div className="drawer-subtitle">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} /> {candidate.contactInfo.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} /> {candidate.contactInfo.phone}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <FileText size={14} /> Source: {candidate.fileName}
              </span>
            </div>
          </div>
          
          <button className="modal-close" onClick={onClose} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Action Row: Shortlist / Reject */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start' }}>
            <button 
              className={`btn ${candidate.status === 'shortlisted' ? 'btn-primary' : ''}`}
              style={{ 
                flex: 1, 
                background: candidate.status === 'shortlisted' ? 'var(--success)' : 'rgba(16, 185, 129, 0.05)', 
                borderColor: candidate.status === 'shortlisted' ? 'transparent' : 'var(--success-border)',
                color: candidate.status === 'shortlisted' ? 'white' : 'var(--success)' 
              }}
              onClick={() => onUpdateStatus(candidate.id, 'shortlisted')}
            >
              <Check size={16} />
              <span>{candidate.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}</span>
            </button>
            
            <button 
              className={`btn`}
              style={{ 
                flex: 1, 
                background: candidate.status === 'rejected' ? 'var(--danger)' : 'rgba(239, 68, 68, 0.05)', 
                borderColor: candidate.status === 'rejected' ? 'transparent' : 'var(--danger-border)',
                color: candidate.status === 'rejected' ? 'white' : 'var(--danger)' 
              }}
              onClick={() => onUpdateStatus(candidate.id, 'rejected')}
            >
              <Ban size={16} />
              <span>{candidate.status === 'rejected' ? 'Rejected' : 'Reject'}</span>
            </button>
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
              <div className="percentage-text">{candidate.matchingScore}%</div>
            </div>
            
            <div className="score-meta">
              <h3>Screening Fit: {candidate.matchingScore >= 80 ? 'Highly Qualified' : candidate.matchingScore >= 50 ? 'Potential Match' : 'Unsuitable'}</h3>
              <p>Ranked #{candidate.rank} in the current screening pool. Analyzed at {candidate.analyzedAt}.</p>
            </div>
          </div>

          {/* Skills categorizations */}
          <div className="skills-section">
            {candidate.matchedSkills.length > 0 && (
              <div className="skills-category">
                <span className="category-title">Matched Core Skills ({candidate.matchedSkills.length})</span>
                <div className="skills-list">
                  {candidate.matchedSkills.map((s, i) => (
                    <span key={i} className="skill-chip matched">
                      <CheckCircle size={12} /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {candidate.missingSkills.length > 0 && (
              <div className="skills-category">
                <span className="category-title">Missing Core Skills ({candidate.missingSkills.length})</span>
                <div className="skills-list">
                  {candidate.missingSkills.map((s, i) => (
                    <span key={i} className="skill-chip missing">
                      &times; {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {candidate.extraSkills.length > 0 && (
              <div className="skills-category">
                <span className="category-title">Additional Assets ({candidate.extraSkills.length})</span>
                <div className="skills-list">
                  {candidate.extraSkills.map((s, i) => (
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
                <span>Candidate Strengths</span>
              </div>
              <ul className="insight-list">
                {candidate.strengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="insight-card weaknesses">
              <div className="insight-title">
                <AlertCircle size={14} />
                <span>Areas of Concern</span>
              </div>
              <ul className="insight-list">
                {candidate.weaknesses.map((weak, i) => (
                  <li key={i}>{weak}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* ATS Feedback */}
          <div className="feedback-card">
            <h3>
              <Sparkles size={16} />
              <span>Recruiter Evaluation Note</span>
            </h3>
            <p>{candidate.feedback}</p>
          </div>
        </div>
      </div>
    </>
  );
}
