import React from 'react';

export default function Dashboard({ questions, stats, history, startQuiz }) {
  const accuracy = stats.attemptedCount > 0 
    ? Math.round((stats.correctCount / stats.attemptedCount) * 100) 
    : 0;

  // Calculate Best & Average Score from attempt history
  const totalTests = history ? history.length : 0;
  const completedTests = history ? history.filter(h => h.completed || h.scorePercentage !== undefined).length : 0;
  const scores = history && history.length > 0 ? history.map(h => h.scorePercentage) : [accuracy];
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Group categories into broad subjects
  const categories = React.useMemo(() => {
    const map = {};
    questions.forEach(q => {
      const subject = q.category.split('-')[0].trim();
      map[subject] = (map[subject] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [questions]);

  // Identify Weak Subjects from mistakes list
  const weakSubjects = React.useMemo(() => {
    if (!stats.mistakesList || stats.mistakesList.length === 0) return [];
    const counts = {};
    stats.mistakesList.forEach(m => {
      const subj = m.category.split('-')[0].trim();
      counts[subj] = (counts[subj] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [stats.mistakesList]);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      {/* Hero Banner with ONLY 3 EXAM LAUNCHER BUTTONS */}
      <div className="glass-panel" style={{
        padding: '2.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
        border: '1px solid var(--border-glow)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="badge" style={{ marginBottom: '0.85rem' }}>
            <i className="fa-solid fa-graduation-cap"></i> FCPS Part-1 Medical Preparation Platform
          </div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }}>
            Master <span className="gradient-text">3,967 High-Yield Clinical MCQs</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '680px', fontSize: '1.05rem', marginBottom: '1.75rem' }}>
            Interactive question bank with detailed clinical explanations, 200-question FCPS exam mode with question palette, anti-cheat monitoring, and spaced repetition analytics.
          </p>

          {/* THE 3 EXPLICIT TEST LAUNCH BUTTONS */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => startQuiz({ mode: 'full_fcps', limit: 200 })}>
              <i className="fa-solid fa-trophy" style={{ color: 'var(--accent-amber)' }}></i> Launch 200-MCQ FCPS Part-1 Exam
            </button>

            <button className="btn-secondary" onClick={() => startQuiz({ mode: 'mock', limit: 100 })}>
              <i className="fa-solid fa-stopwatch"></i> 100-MCQ Timed Practice Mock
            </button>

            <button className="btn-secondary" onClick={() => startQuiz({ mode: 'all' })}>
              <i className="fa-solid fa-play"></i> Full Practice Session
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Total Exams Taken</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-file-signature"></i>
            </div>
          </div>
          <h2 style={{ fontSize: '2rem' }}>{totalTests}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subdued)' }}>{completedTests} Submitted & Analyzed</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Average Score</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-chart-line"></i>
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', color: avgScore >= 70 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
            {avgScore}%
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subdued)' }}>Overall Average Performance</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Best Score</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-crown"></i>
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--accent-amber)' }}>{bestScore}%</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subdued)' }}>Highest Exam Percentage</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Mistakes Revision</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--accent-rose)' }}>{stats.mistakesCount}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subdued)' }}>Questions requiring review</span>
        </div>
      </div>

      {/* Analytics Breakdown: Weak Subjects & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Weak Subjects Card */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: 'var(--accent-rose)' }}></i>
            Weak Subjects (Focus Areas)
          </h3>

          {weakSubjects.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', padding: '1rem 0' }}>
              <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-emerald)', marginRight: '0.5rem' }}></i>
              No specific weak areas detected yet! Keep practicing to track performance.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {weakSubjects.map(([subject, count]) => (
                <div key={subject} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-rose)' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{subject}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} Incorrect Answers</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Exam Activity History */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--accent-cyan)' }}></i>
            Recent Exam Activity
          </h3>

          {!history || history.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', padding: '1rem 0' }}>
              No exam attempts recorded yet. Click one of the 3 buttons above to start an exam!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.slice(0, 3).map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{h.title || 'FCPS Mock Exam'}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {h.date} &bull; {h.attemptedCount || h.totalQuestions} Solved &bull; {h.timeTaken}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: h.scorePercentage >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                      {h.scorePercentage}%
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subdued)' }}>{h.correctCount} / {h.attemptedCount || h.totalQuestions} Marks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subject-Wise Information Cards (Informative overview, tests ONLY launch from the 3 main buttons) */}
      <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <i className="fa-solid fa-layer-group" style={{ color: 'var(--accent-cyan)' }}></i>
        Subject-Wise Question Breakdown
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        {categories.slice(0, 8).map(([subject, count]) => (
          <div
            key={subject}
            className="glass-panel"
            style={{
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{subject}</h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{count} Verified MCQs</span>
            </div>

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.1)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 700
            }}>
              <i className="fa-solid fa-check"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
