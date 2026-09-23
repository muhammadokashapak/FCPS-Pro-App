import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function QuizEngine({ quizList, onAnswer, onRecordResult, onFinish, config, addToast }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: { selected, isCorrect } }
  const [markedForReview, setMarkedForReview] = useState({}); // { [qId]: true }
  const [timerSeconds, setTimerSeconds] = useState(() => {
    if (config?.isMock || config?.limit) {
      const minutes = config?.limit || 120;
      return minutes * 60;
    }
    return null;
  });

  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [startTime] = useState(Date.now());

  const currentQ = quizList[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0 || isCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, isCompleted]);

  if (!currentQ && !isCompleted) {
    return (
      <div className="glass-panel text-center" style={{ padding: '3rem', margin: '2rem 0' }}>
        <h2>No questions found for the selected criteria.</h2>
        <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => onFinish && onFinish({})}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Option keys
  const options = currentQ ? [
    { key: 'A', text: currentQ.option_a },
    { key: 'B', text: currentQ.option_b },
    { key: 'C', text: currentQ.option_c },
    { key: 'D', text: currentQ.option_d },
    { key: 'E', text: currentQ.option_e }
  ].filter(o => o.text && o.text.trim() !== '') : [];

  const currentAnswer = currentQ ? userAnswers[currentQ.id] : null;
  const isMarked = currentQ ? markedForReview[currentQ.id] : false;

  // Handle Option Select (updates state without double-counting option changes)
  const handleSelectOption = (key) => {
    if (isCompleted) return;
    const isCorrect = key.toUpperCase() === currentQ.correct_answer.toUpperCase();
    
    const updatedAnswers = {
      ...userAnswers,
      [currentQ.id]: { selected: key, isCorrect }
    };
    setUserAnswers(updatedAnswers);
    if (typeof onAnswer === 'function') {
      onAnswer(currentQ, key, isCorrect);
    }
  };

  // Toggle Mark for Review
  const toggleMarkForReview = () => {
    if (!currentQ) return;
    setMarkedForReview(prev => {
      const next = { ...prev, [currentQ.id]: !prev[currentQ.id] };
      if (!prev[currentQ.id]) addToast(`Question #${currentIndex + 1} marked for review`, 'info');
      return next;
    });
  };

  // Final Submit Handler
  const handleFinalSubmit = (auto = false) => {
    setShowSubmitModal(false);
    setIsCompleted(true);

    const totalQ = quizList.length;
    let correctCount = 0;
    let attemptedCount = 0;
    const details = [];

    quizList.forEach((q, idx) => {
      const ans = userAnswers[q.id];
      const selected = ans ? ans.selected : null;
      const isCorrect = ans ? ans.isCorrect : false;

      if (selected !== null && selected !== undefined) {
        attemptedCount++;
        if (isCorrect) correctCount++;
        
        details.push({
          q,
          index: idx + 1,
          selected,
          isCorrect,
          correctAnswer: q.correct_answer,
          explanation: q.explanation
        });
      }
    });

    // Accuracy percentage based on ATTEMPTED questions ONLY
    const scorePercentage = attemptedCount > 0 
      ? Math.round((correctCount / attemptedCount) * 100) 
      : 0;

    const elapsedMs = Date.now() - startTime;
    const elapsedMins = Math.floor(elapsedMs / 60000);
    const elapsedSecs = Math.floor((elapsedMs % 60000) / 1000);
    const timeTakenStr = `${elapsedMins}m ${elapsedSecs}s`;

    const resultObj = {
      title: config?.isMock ? 'FCPS 200-MCQ Examination' : 'Practice Exam',
      totalQuestions: totalQ,
      attemptedCount,
      skippedCount: totalQ - attemptedCount,
      correctCount,
      scorePercentage,
      timeTaken: timeTakenStr,
      details, // ONLY attempted questions included in details!
      date: new Date().toLocaleDateString()
    };

    setExamResult(resultObj);
    if (onRecordResult) {
      onRecordResult(resultObj);
    }

    if (scorePercentage >= 70 && attemptedCount > 0) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      addToast(`Passed! Accuracy: ${scorePercentage}% (${correctCount}/${attemptedCount} Solved)`, 'success');
    } else {
      addToast(`Exam Submitted. Accuracy: ${scorePercentage}% (${correctCount}/${attemptedCount} Solved)`, 'warning');
    }
  };

  const formatTimer = (seconds) => {
    if (seconds === null) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Stats for palette & submit modal
  const answeredCount = Object.keys(userAnswers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = quizList.length - answeredCount;

  // RENDER EXAM RESULTS PAGE IF COMPLETED
  if (isCompleted && examResult) {
    return (
      <div className="animate-fade-in" style={{ padding: '2.5rem 0', maxWidth: '960px', margin: '0 auto' }}>
        {/* Results Header Card */}
        <div className="glass-panel text-center" style={{
          padding: '3rem 2rem',
          marginBottom: '2rem',
          background: examResult.scorePercentage >= 70 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)' 
            : 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%)',
          border: `1.5px solid ${examResult.scorePercentage >= 70 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: examResult.scorePercentage >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
            color: examResult.scorePercentage >= 70 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            fontSize: '2rem'
          }}>
            <i className={`fa-solid ${examResult.scorePercentage >= 70 ? 'fa-award' : 'fa-chart-pie'}`}></i>
          </div>

          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>
            {examResult.scorePercentage >= 70 ? 'FCPS Mock Passed!' : 'Exam Submitted'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1.75rem' }}>
            {examResult.skippedCount > 0 
              ? `${examResult.skippedCount} skipped questions were excluded from results.` 
              : 'All questions were attempted.'}
          </p>

          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            maxWidth: '750px',
            margin: '0 auto 2rem'
          }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Attempted Accuracy</span>
              <strong style={{ fontSize: '1.8rem', color: examResult.scorePercentage >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {examResult.scorePercentage}%
              </strong>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Correct / Solved</span>
              <strong style={{ fontSize: '1.8rem', color: 'var(--accent-cyan)' }}>
                {examResult.correctCount} / {examResult.attemptedCount}
              </strong>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Skipped (Unseen)</span>
              <strong style={{ fontSize: '1.8rem', color: 'var(--text-subdued)' }}>
                {examResult.skippedCount}
              </strong>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Time Elapsed</span>
              <strong style={{ fontSize: '1.8rem', color: 'var(--accent-purple)' }}>
                {examResult.timeTaken}
              </strong>
            </div>
          </div>

          <button className="btn-primary" onClick={() => onFinish && onFinish()}>
            <i className="fa-solid fa-house"></i> Return to Dashboard
          </button>
        </div>

        {/* Detailed Question Review List - ONLY ATTEMPTED QUESTIONS SHOWN */}
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-list-check" style={{ color: 'var(--accent-cyan)' }}></i>
          Attempted Questions Analysis ({examResult.details.length} Solved)
        </h3>

        {examResult.details.length === 0 ? (
          <div className="glass-panel text-center" style={{ padding: '2.5rem', color: 'var(--text-muted)' }}>
            No questions were solved during this test session.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {examResult.details.map((item) => (
              <div key={item.q.id} className="glass-panel" style={{
                padding: '1.75rem',
                borderLeft: `4px solid ${item.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="badge">{item.q.category}</span>
                  <span className="badge" style={{
                    background: item.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: item.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                    borderColor: item.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                  }}>
                    {item.isCorrect ? '✓ Correct Answer' : '✗ Incorrect Answer'}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Q{item.index}. {item.q.question}
                </h4>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                  <div><strong>Your Choice:</strong> Option {item.selected}</div>
                  <div><strong>Correct Answer:</strong> Option {item.correctAnswer.toUpperCase()}</div>
                  {item.explanation && (
                    <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <strong>Explanation:</strong> {item.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ACTIVE EXAM ENGINE VIEW
  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '960px', margin: '0 auto', position: 'relative' }}>
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge" style={{ marginBottom: '0.4rem' }}>
            <i className="fa-solid fa-tag"></i> {currentQ.category}
          </span>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Question {currentIndex + 1} of {quizList.length}
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {timerSeconds !== null && (
            <div className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.3)', padding: '0.45rem 0.9rem', fontSize: '0.95rem' }}>
              <i className="fa-solid fa-clock"></i> {formatTimer(timerSeconds)}
            </div>
          )}

          {/* Palette Drawer Toggle */}
          <button
            className="btn-secondary"
            onClick={() => setShowPalette(!showPalette)}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <i className="fa-solid fa-grid-2"></i> Palette ({answeredCount}/{quizList.length})
          </button>

          {/* Mark for Review Button */}
          <button
            className="btn-secondary"
            onClick={toggleMarkForReview}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              background: isMarked ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: isMarked ? 'var(--accent-purple)' : 'var(--text-main)',
              borderColor: isMarked ? 'var(--accent-purple)' : 'var(--border-subtle)'
            }}
          >
            <i className="fa-solid fa-bookmark"></i> {isMarked ? 'Marked' : 'Mark for Review'}
          </button>

          {/* Submit Exam Button */}
          <button
            className="btn-primary"
            onClick={() => setShowSubmitModal(true)}
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', background: 'var(--gradient-success)' }}
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Question Palette Grid Drawer */}
      {showPalette && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1.05rem' }}>Question Palette Navigator</h4>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span><i className="fa-solid fa-circle" style={{ color: 'var(--accent-cyan)' }}></i> Answered ({answeredCount})</span>
              <span><i className="fa-solid fa-circle" style={{ color: 'var(--accent-purple)' }}></i> Marked ({markedCount})</span>
              <span><i className="fa-solid fa-circle" style={{ color: 'var(--text-subdued)' }}></i> Unanswered ({unansweredCount})</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
            {quizList.map((q, idx) => {
              const isAns = !!userAnswers[q.id];
              const isM = !!markedForReview[q.id];
              const isCurr = idx === currentIndex;

              let bg = 'rgba(255,255,255,0.05)';
              let color = 'var(--text-muted)';
              let border = '1px solid var(--border-subtle)';

              if (isM) {
                bg = 'rgba(168, 85, 247, 0.25)';
                color = 'var(--accent-purple)';
                border = '1px solid var(--accent-purple)';
              } else if (isAns) {
                bg = 'rgba(6, 182, 212, 0.2)';
                color = 'var(--accent-cyan)';
                border = '1px solid var(--accent-cyan)';
              }

              if (isCurr) {
                border = '2px solid #ffffff';
              }

              return (
                <button
                  key={q.id || idx}
                  onClick={() => { setCurrentIndex(idx); setShowPalette(false); }}
                  style={{
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: bg,
                    color,
                    border,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${((currentIndex + 1) / quizList.length) * 100}%`,
          background: 'var(--gradient-primary)',
          transition: 'width 0.3s ease'
        }}></div>
      </div>

      {/* Question Card */}
      <div className="glass-panel" style={{ padding: '2.25rem', marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', lineHeight: 1.6, fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.75rem' }}>
          {currentQ.question}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {options.map((opt) => {
            const isSelected = currentAnswer?.selected === opt.key;

            return (
              <div
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                style={{
                  padding: '1.1rem 1.35rem',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)',
                  border: `1.5px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}>
                  {opt.key}
                </div>

                <span style={{ fontSize: '1rem', fontWeight: 500 }}>{opt.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn-secondary"
          onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
        >
          <i className="fa-solid fa-chevron-left"></i> Previous
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            onClick={() => setCurrentIndex(p => Math.min(quizList.length - 1, p + 1))}
          >
            Skip Question
          </button>

          {currentIndex < quizList.length - 1 ? (
            <button className="btn-primary" onClick={() => setCurrentIndex(p => p + 1)}>
              Next Question <i className="fa-solid fa-chevron-right"></i>
            </button>
          ) : (
            <button className="btn-primary" style={{ background: 'var(--gradient-success)' }} onClick={() => setShowSubmitModal(true)}>
              Submit Examination <i className="fa-solid fa-check"></i>
            </button>
          )}
        </div>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2000,
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
            <i className="fa-solid fa-circle-question" style={{ fontSize: '3rem', color: 'var(--accent-cyan)', marginBottom: '1rem' }}></i>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Ready to Submit Exam?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
              Only questions you actually answered will be analyzed in your review list.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '2rem',
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Answered</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>{answeredCount}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Marked</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--accent-purple)' }}>{markedCount}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Skipped</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--text-subdued)' }}>{unansweredCount}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setShowSubmitModal(false)}>
                Continue Exam
              </button>
              <button className="btn-primary" style={{ background: 'var(--gradient-success)' }} onClick={() => handleFinalSubmit(false)}>
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
