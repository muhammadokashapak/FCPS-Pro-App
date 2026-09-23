import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import QuizEngine from './components/QuizEngine';
import MistakesBank from './components/MistakesBank';
import ToastNotification from './components/ToastNotification';
import questionsData from './data/questions.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('fcps_theme') || 'dark');
  const [quizState, setQuizState] = useState(null); // { list, config }

  // Global Toasts State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Persistent User Progress Stats
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('fcps_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      attemptedCount: 0,
      correctCount: 0,
      mistakesCount: 0,
      mistakesList: []
    };
  });

  // Persistent Exam History
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('fcps_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Theme Sync
  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('fcps_theme', theme);
  }, [theme]);

  // Save Stats & History
  useEffect(() => {
    localStorage.setItem('fcps_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('fcps_history', JSON.stringify(history));
  }, [history]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Launch Quiz Helper - ONLY called when explicitly starting a test
  const startQuiz = ({ mode, subject, limit }) => {
    let list = [...questionsData];

    if (mode === 'full_fcps') {
      list.sort(() => Math.random() - 0.5);
      list = list.slice(0, 200);
      addToast('Launching Official FCPS 200-MCQ Examination (120 Minutes)', 'info');
    } else if (mode === 'mock') {
      list.sort(() => Math.random() - 0.5);
      if (limit) list = list.slice(0, limit);
      addToast(`Launching Timed Mock Exam (${list.length} MCQs)`, 'info');
    } else if (mode === 'mistakes') {
      list = stats.mistakesList.length > 0 ? [...stats.mistakesList] : [...questionsData];
      addToast(`Practicing Mistakes Bank (${list.length} MCQs)`, 'info');
    } else {
      list.sort(() => Math.random() - 0.5);
      addToast('Starting Full Practice Session', 'info');
    }

    setQuizState({
      list,
      config: {
        isMock: mode === 'mock' || mode === 'full_fcps',
        limit: mode === 'full_fcps' ? 120 : (mode === 'mock' ? (limit || 60) : null)
      }
    });
    setActiveTab('practice');
  };

  // Record Exam Result cleanly upon submit
  const recordExamResult = (examResultObj) => {
    if (!examResultObj) return;

    setHistory(prev => [examResultObj, ...prev]);

    setStats(prev => {
      const newAttempted = prev.attemptedCount + (examResultObj.attemptedCount || 0);
      const newCorrect = prev.correctCount + (examResultObj.correctCount || 0);

      let updatedMistakes = [...prev.mistakesList];

      if (examResultObj.details && Array.isArray(examResultObj.details)) {
        examResultObj.details.forEach(item => {
          if (!item.isCorrect) {
            if (!updatedMistakes.some(m => m.id === item.q.id)) {
              updatedMistakes.push(item.q);
            }
          } else {
            updatedMistakes = updatedMistakes.filter(m => m.id !== item.q.id);
          }
        });
      }

      return {
        attemptedCount: newAttempted,
        correctCount: newCorrect,
        mistakesCount: updatedMistakes.length,
        mistakesList: updatedMistakes
      };
    });
  };

  // Finish Quiz Handler - Resets quizState and navigates to dashboard
  const handleFinishQuiz = () => {
    setQuizState(null);
    setActiveTab('dashboard');
    addToast('Returned to Dashboard', 'info');
  };

  const removeSingleMistake = (qId) => {
    setStats(prev => {
      const filtered = prev.mistakesList.filter(m => m.id !== qId);
      return {
        ...prev,
        mistakesCount: filtered.length,
        mistakesList: filtered
      };
    });
    addToast('Question removed from Mistakes Bank', 'info');
  };

  // Clear Progress
  const resetProgress = () => {
    setStats({
      attemptedCount: 0,
      correctCount: 0,
      mistakesCount: 0,
      mistakesList: []
    });
    setHistory([]);
    localStorage.removeItem('fcps_stats');
    localStorage.removeItem('fcps_history');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ToastNotification toasts={toasts} removeToast={removeToast} />

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab === 'practice' && !quizState) {
            startQuiz({ mode: 'all' });
          } else {
            setActiveTab(tab);
          }
        }} 
        stats={stats} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <main style={{ flex: 1, maxWidth: '1300px', width: '100%', margin: '0 auto', padding: '0 1.5rem' }}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            questions={questionsData} 
            stats={stats} 
            history={history} 
            startQuiz={startQuiz} 
          />
        )}

        {activeTab === 'practice' && (
          <QuizEngine 
            quizList={quizState?.list || questionsData} 
            onRecordResult={recordExamResult} 
            onFinish={handleFinishQuiz} 
            config={quizState?.config} 
            addToast={addToast} 
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakesBank 
            mistakesList={stats.mistakesList} 
            startMistakesQuiz={() => startQuiz({ mode: 'mistakes' })} 
            clearMistakes={resetProgress} 
            removeSingleMistake={removeSingleMistake} 
          />
        )}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        color: 'var(--text-subdued)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: '3rem',
        fontSize: '0.85rem'
      }}>
        FCPS Pro &bull; Medical Exam Platform &bull; 3,967 Questions
      </footer>
    </div>
  );
}
