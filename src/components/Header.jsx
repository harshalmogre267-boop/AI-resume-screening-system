import React from 'react';
import { Briefcase, User, Sparkles } from 'lucide-react';

export default function Header({ role, setRole }) {
  return (
    <header className="header">
      <a href="#" className="brand">
        <div className="brand-logo">
          <Sparkles size={20} />
        </div>
        <span className="brand-name">TalentLens AI</span>
      </a>

      <div className="header-controls">
        {/* Role Toggle Switches */}
        <div className="role-toggle">
          <button 
            className={`role-btn ${role === 'recruiter' ? 'active' : ''}`}
            onClick={() => setRole('recruiter')}
          >
            <Briefcase size={16} />
            <span>Recruiter</span>
          </button>
          <button 
            className={`role-btn ${role === 'candidate' ? 'active' : ''}`}
            onClick={() => setRole('candidate')}
          >
            <User size={16} />
            <span>Candidate</span>
          </button>
        </div>
      </div>
    </header>
  );
}
