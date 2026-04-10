'use client';
import { useState } from 'react';
import type { Course } from '@/types';

const G = '#10B981';

interface Question {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface Props {
  course: Course;
}

type QuizState = 'idle' | 'loading' | 'active' | 'feedback' | 'complete';

export default function AIQuiz({ course }: Props) {
  const [state,        setState]        = useState<QuizState>('idle');
  const [questions,    setQuestions]    = useState<Question[]>([]);
  const [currentQ,     setCurrentQ]     = useState(0);
  const [selected,     setSelected]     = useState<string | null>(null);
  const [feedback,     setFeedback]     = useState('');
  const [feedbackLoad, setFeedbackLoad] = useState(false);
  const [isCorrect,    setIsCorrect]    = useState(false);
  const [score,        setScore]        = useState(0);
  const [error,        setError]        = useState('');

  const generateQuiz = async () => {
    setState('loading');
    setError('');
    setScore(0);
    setCurrentQ(0);

    try {
      const res  = await fetch('/api/ai-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          courseTitle:  course.title,
          subject:      course.subject,
          level:        course.category,
          subCategory:  course.sub_category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        setState('active');
      } else {
        setError(data.error || 'Failed to generate quiz.');
        setState('idle');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setState('idle');
    }
  };

  const submitAnswer = async () => {
    if (!selected) return;
    const q = questions[currentQ];
    setFeedbackLoad(true);

    try {
      const res  = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question:      q.question,
          studentAnswer: selected,
          correctAnswer: q.correct,
          explanation:   q.explanation,
          subject:       course.subject,
          level:         course.category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(data.feedback);
        setIsCorrect(data.isCorrect);
        if (data.isCorrect) setScore(s => s + 1);
        setState('feedback');
      }
    } catch {
      setError('Could not get feedback.');
    }
    setFeedbackLoad(false);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setState('complete');
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setFeedback('');
      setState('active');
    }
  };

  const reset = () => {
    setState('idle');
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setFeedback('');
    setScore(0);
  };

  const q = questions[currentQ];

  // ── Idle ────────────────────────────────────────────────────
  if (state === 'idle') return (
    <div className="rounded-2xl p-5 mt-4" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(16,185,129,0.15)' }}>
          <svg className="w-5 h-5" style={{ color: G }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#fff' }}>AI Quiz</p>
          <p className="text-xs" style={{ color: '#a3a3a3' }}>5 questions · instant AI feedback</p>
        </div>
      </div>
      {error && <p className="text-xs mb-3" style={{ color: '#f87171' }}>{error}</p>}
      <button onClick={generateQuiz} className="btn-primary text-sm py-2.5">
        Generate Quiz for this lesson
      </button>
    </div>
  );

  // ── Loading ──────────────────────────────────────────────────
  if (state === 'loading') return (
    <div className="rounded-2xl p-5 mt-4 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
      <div className="w-5 h-5 rounded-full border-2 animate-spin flex-shrink-0" style={{ borderColor: '#2a2a2a', borderTopColor: G }} />
      <p className="text-sm" style={{ color: '#a3a3a3' }}>Generating quiz questions...</p>
    </div>
  );

  // ── Complete ─────────────────────────────────────────────────
  if (state === 'complete') {
    const pct = Math.round((score / questions.length) * 100);
    const msg = pct === 100 ? 'Perfect score! Outstanding work!' :
                pct >= 80  ? 'Excellent! You know this topic well.' :
                pct >= 60  ? 'Good effort! Review the questions you missed.' :
                             'Keep studying — you\'ll get there!';
    return (
      <div className="rounded-2xl p-5 mt-4" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="text-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: pct >= 60 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)' }}>
            <p className="text-xl font-bold" style={{ color: pct >= 60 ? G : '#ef4444' }}>{pct}%</p>
          </div>
          <p className="text-base font-bold mb-1" style={{ color: '#fff' }}>Quiz Complete!</p>
          <p className="text-sm mb-1" style={{ color: G }}>{score} / {questions.length} correct</p>
          <p className="text-xs" style={{ color: '#a3a3a3' }}>{msg}</p>
        </div>
        <button onClick={generateQuiz} className="btn-primary text-sm py-2.5 mb-2">Try another quiz</button>
        <button onClick={reset} className="btn-secondary text-sm py-2.5">Close</button>
      </div>
    );
  }

  // ── Active / Feedback ────────────────────────────────────────
  return (
    <div className="rounded-2xl p-5 mt-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold" style={{ color: '#737373' }}>
          Question {currentQ + 1} of {questions.length}
        </p>
        <p className="text-xs font-semibold" style={{ color: G }}>Score: {score}</p>
      </div>
      <div className="prog-track mb-4">
        <div className="prog-fill" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <p className="text-sm font-bold mb-4 leading-snug" style={{ color: '#fff' }}>{q.question}</p>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {q.options.map(opt => {
          const letter   = opt.charAt(0);
          const isSel    = selected === letter;
          const isRight  = state === 'feedback' && letter === q.correct;
          const isWrong  = state === 'feedback' && isSel && letter !== q.correct;

          let bg     = '#222';
          let border = '#2a2a2a';
          let color  = '#e5e5e5';

          if (isRight)      { bg = 'rgba(16,185,129,0.15)'; border = G;         color = G; }
          else if (isWrong) { bg = 'rgba(239,68,68,0.12)';  border = '#ef4444'; color = '#f87171'; }
          else if (isSel)   { bg = 'rgba(16,185,129,0.08)'; border = G;         color = '#fff'; }

          return (
            <button key={opt}
              onClick={() => state === 'active' && setSelected(letter)}
              disabled={state === 'feedback'}
              className="w-full text-left p-3 rounded-xl text-sm !min-h-0 transition-all"
              style={{ background: bg, border: `1px solid ${border}`, color }}>
              {opt}
            </button>
          );
        })}
      </div>

      {/* AI Feedback */}
      {state === 'feedback' && (
        <div className="rounded-xl p-3 mb-4 text-sm leading-relaxed"
          style={isCorrect
            ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }
            : { background: 'rgba(239,68,68,0.08)',  border: '1px solid rgba(239,68,68,0.2)',  color: '#fca5a5' }}>
          <p className="font-bold mb-1">{isCorrect ? '✓ Correct!' : '✗ Not quite'}</p>
          <p>{feedback}</p>
        </div>
      )}

      {/* Action button */}
      {state === 'active' && (
        <button onClick={submitAnswer} disabled={!selected || feedbackLoad}
          className="btn-primary text-sm py-2.5">
          {feedbackLoad
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"/>Getting feedback...</span>
            : 'Submit Answer'}
        </button>
      )}

      {state === 'feedback' && (
        <button onClick={nextQuestion} className="btn-primary text-sm py-2.5">
          {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}
