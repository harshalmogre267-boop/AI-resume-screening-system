import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RecruiterDashboard from './components/RecruiterDashboard';
import CandidateDashboard from './components/CandidateDashboard';
import CandidateDetailsModal from './components/CandidateDetailsModal';
import { Sparkles, Terminal, FileText, Globe } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('recruiter'); // 'recruiter' or 'candidate'
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Update candidate review status (Shortlisted, Rejected, Pending)
  const handleUpdateCandidateStatus = (candidateId, status) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        // Toggle: if clicking the same status, revert to pending/unassigned
        const newStatus = c.status === status ? 'pending' : status;
        
        // Update selected candidate details in-place
        if (selectedCandidate && selectedCandidate.id === candidateId) {
          setSelectedCandidate(prevSelected => ({ ...prevSelected, status: newStatus }));
        }
        
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  return (
    <>
      {/* Top Banner and Navigation */}
      <Header 
        role={role} 
        setRole={setRole} 
      />

      {/* Main Dashboards Switch */}
      <main style={{ flex: 1 }}>
        {role === 'recruiter' ? (
          <RecruiterDashboard 
            candidates={candidates}
            setCandidates={setCandidates}
            onSelectCandidate={setSelectedCandidate}
          />
        ) : (
          <CandidateDashboard />
        )}
      </main>

      {/* Candidate Profile Details sliding Drawer */}
      {selectedCandidate && (
        <CandidateDetailsModal 
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdateStatus={handleUpdateCandidateStatus}
        />
      )}

      {/* Footer */}
      <footer style={{ 
        padding: '2rem 0', 
        borderTop: '1px solid var(--border-glass)', 
        marginTop: '3rem', 
        textAlign: 'center', 
        fontSize: '0.85rem', 
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={14} />
          <span>TalentLens AI Screening &copy; {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Globe size={12} /> GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
