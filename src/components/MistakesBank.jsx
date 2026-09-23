import React, { useState, useMemo } from 'react';

export default function MistakesBank({ mistakesList, startMistakesQuiz, clearMistakes, removeSingleMistake }) {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  // Subjects breakdown
  const subjects = useMemo(() => {
    const set = new Set();
    mistakesList.forEach(m => {
      const subj = m.category.split('-')[0].trim();
      set.add(subj);
    });
    return Array.from(set).sort();
  }, [mistakesList]);

  // Filtered mistakes
  const filtered = useMemo(() => {
    return mistakesList.filter(m => {
      const matchSubj = selectedSubject === 'ALL' || m.category.toLowerCase().includes(selectedSubject.toLowerCase());
      const matchQuery = !search.trim() || 
        m.question.toLowerCase().includes(search.toLowerCase()) || 
        (m.explanation && m.explanation.toLowerCase().includes(search.toLowerCase()));
      return matchSubj && matchQuery;
    });
  }, [mistakesList, selectedSubject, search]);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge" style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.3)', marginBottom: '0.5rem' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> Spaced Repetition Mistakes Review
          </span>
          <h2 style={{ fontSize: '2rem' }}>Mistakes Bank ({mistakesList.length})</h2>
          <p style={{ color: 'var(--text-muted)' }}>Questions you answered incorrectly are stored here for targeted revision.</p>
        </div>

        {mistakesList.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={clearMistakes} style={{ color: 'var(--accent-rose)' }}>
              <i className="fa-solid fa-trash"></i> Reset All Mistakes
            </button>

            <button className="btn-primary" onClick={startMistakesQuiz}>
              <i className="fa-solid fa-rotate-right"></i> Practice Mistakes ({mistakesList.length})
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search controls */}
      {mistakesList.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              placeholder="Search within mistakes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '0.92rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Subjects ({subjects.length})</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {mistakesList.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '4rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.8rem' }}>
            <i className="fa-solid fa-check-double"></i>
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your Mistakes Bank is Clean!</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            Great job! You have no pending incorrect questions. Keep practicing to test your knowledge.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map((q, idx) => (
            <div key={q.id || idx} className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge">{q.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-subdued)' }}>MCQ #{q.id}</span>
                  <button
                    onClick={() => removeSingleMistake(q.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '0.9rem' }}
                    title="Remove from Mistakes Bank"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', lineHeight: 1.5 }}>{q.question}</h4>
              <div style={{ padding: '1rem', background: 'rgba(244,63,94,0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-rose)', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                <strong>Correct Answer:</strong> Option {q.correct_answer.toUpperCase()}
                {q.explanation && <div style={{ marginTop: '0.5rem' }}>{q.explanation}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
