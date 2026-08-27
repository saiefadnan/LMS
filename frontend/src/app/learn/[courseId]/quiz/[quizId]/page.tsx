'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQuiz, submitQuizResult, getMyQuizResults, getCourse } from '@/lib/api';
import { type Quiz, type QuizResult, type Course } from '@/types';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight, ArrowLeft, Award } from 'lucide-react';

export default function QuizPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousResult, setPreviousResult] = useState<QuizResult | null>(null);

  // Taking quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittedResult, setSubmittedResult] = useState<{
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    answers: Record<string, number>;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadQuizData() {
      try {
        setLoading(true);
        const [quizRes, courseRes, resultsRes] = await Promise.all([
          getQuiz(quizId),
          getCourse(courseId),
          getMyQuizResults().catch(() => ({ data: [] })),
        ]);

        const currentQuiz = quizRes.data;
        if (!currentQuiz) {
          router.push(`/learn/${courseId}`);
          return;
        }

        setQuiz(currentQuiz);
        setCourse(courseRes.data);

        // Find existing result for this quiz
        if (resultsRes.data && resultsRes.data.length > 0) {
          const existing = resultsRes.data.find(
            (r) =>
              (r.quiz?.documentId === quizId || (r.quiz as any)?.id === currentQuiz.id)
          );
          if (existing) {
            setPreviousResult(existing);
          }
        }
      } catch (err) {
        console.error('Failed to load quiz data', err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }

    if (quizId && courseId) {
      loadQuizData();
    }
  }, [quizId, courseId, router]);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleGradeAndSubmit = async () => {
    if (!quiz || !quiz.questions) return;

    // Verify all questions are answered
    const unanswered = quiz.questions.findIndex((_, idx) => userAnswers[idx] === undefined);
    if (unanswered !== -1) {
      setError(`Please answer Question ${unanswered + 1} before submitting.`);
      setCurrentQuestionIndex(unanswered);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Auto-grading algorithm
      let score = 0;
      const questions = quiz.questions;
      const formattedAnswers: Record<string, number> = {};

      for (let i = 0; i < questions.length; i++) {
        const studentChoice = userAnswers[i];
        formattedAnswers[`q_${i}`] = studentChoice;
        if (studentChoice === questions[i].correctAnswer) {
          score += 1;
        }
      }

      const totalQuestions = questions.length;
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      const passed = percentage >= 70; // 70% passing threshold

      const resultPayload = {
        quiz: quiz.documentId,
        score,
        totalQuestions,
        answers: formattedAnswers,
        passed,
      };

      // Persist to backend database
      await submitQuizResult(resultPayload);

      setSubmittedResult({
        score,
        totalQuestions,
        percentage,
        passed,
        answers: formattedAnswers,
      });
    } catch (err: any) {
      console.error('Failed to submit quiz result:', err);
      setError(err.message || 'Failed to submit results. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setSubmittedResult(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-surface-900 mb-2">Quiz Not Found</h2>
        <Link href={`/learn/${courseId}`}>
          <Button variant="secondary">Back to Course</Button>
        </Link>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = questions.length > 0 ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto py-8 px-6 pb-24">
      {/* Quiz Header */}
      <div className="mb-8 pb-6 border-b border-surface-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4" />
          <span>Course Assessment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-surface-900">{quiz.title}</h1>
        <p className="text-sm text-surface-500 mt-1">
          Passing score: 70% • Total questions: {questions.length} • Auto-graded
        </p>
      </div>

      {/* ── RESULTS VIEW (After Submission) ── */}
      {submittedResult ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Score Banner */}
          <div
            className={`p-8 rounded-2xl border text-center relative overflow-hidden ${
              submittedResult.passed
                ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200'
                : 'bg-gradient-to-b from-amber-50 to-white border-amber-200'
            }`}
          >
            <div className="inline-flex p-4 rounded-full mb-4 bg-white shadow-sm border border-surface-100">
              {submittedResult.passed ? (
                <Award className="w-12 h-12 text-emerald-600" />
              ) : (
                <RotateCcw className="w-12 h-12 text-amber-600" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-surface-900 mb-1">
              {submittedResult.passed ? '🎉 Congratulations! You Passed!' : 'Keep Practicing!'}
            </h2>
            <p className="text-surface-600 text-sm max-w-md mx-auto mb-6">
              {submittedResult.passed
                ? `You mastered this assessment with a score of ${submittedResult.percentage}%. Your certificate progress has been updated.`
                : `You scored ${submittedResult.percentage}%. You need at least 70% to pass. Review the answers below and try again!`}
            </p>

            <div className="flex justify-center items-center gap-6 py-4 px-6 bg-white/80 backdrop-blur rounded-xl max-w-xs mx-auto border border-surface-200 shadow-sm">
              <div className="text-center">
                <span className="text-xs text-surface-400 font-medium block">SCORE</span>
                <span className="text-2xl font-black text-surface-900">
                  {submittedResult.score} / {submittedResult.totalQuestions}
                </span>
              </div>
              <div className="h-8 w-px bg-surface-200" />
              <div className="text-center">
                <span className="text-xs text-surface-400 font-medium block">PERCENTAGE</span>
                <span
                  className={`text-2xl font-black ${
                    submittedResult.passed ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {submittedResult.percentage}%
                </span>
              </div>
            </div>

            <div className="flex justify-center items-center gap-3 mt-8">
              <Button onClick={handleRetake} variant="secondary" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </Button>
              <Link href={`/learn/${courseId}`}>
                <Button variant="primary" className="gap-2">
                  Back to Course
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Question by Question Review */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-surface-900 flex items-center gap-2">
              <span>Detailed Breakdown</span>
              <span className="text-xs font-normal text-surface-500">
                (Review correct answers vs your choices)
              </span>
            </h3>

            {questions.map((q, qIndex) => {
              const studentChoice = userAnswers[qIndex];
              const isCorrect = studentChoice === q.correctAnswer;

              return (
                <div
                  key={qIndex}
                  className={`p-6 rounded-xl border bg-white shadow-sm space-y-4 ${
                    isCorrect ? 'border-emerald-200' : 'border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {qIndex + 1}
                      </span>
                      <h4 className="font-semibold text-surface-900">{q.question}</h4>
                    </div>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {q.options.map((opt, optIdx) => {
                      const wasSelected = studentChoice === optIdx;
                      const isOptionCorrect = q.correctAnswer === optIdx;
                      const letter = String.fromCharCode(65 + optIdx);

                      let badgeStyle = 'border-surface-200 bg-surface-50 text-surface-700';
                      if (isOptionCorrect) {
                        badgeStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500 font-medium';
                      } else if (wasSelected && !isCorrect) {
                        badgeStyle = 'border-red-400 bg-red-50 text-red-900 font-medium';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border flex items-center justify-between text-sm ${badgeStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-xs opacity-75">{letter}.</span>
                            <span>{opt}</span>
                          </div>
                          {isOptionCorrect && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Correct Answer
                            </span>
                          )}
                          {wasSelected && !isOptionCorrect && (
                            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── ACTIVE QUIZ TAKER ── */
        <div className="space-y-6">
          {/* Previous Result Banner if retaking */}
          {previousResult && !submittedResult && (
            <div className="p-4 bg-surface-100 border border-surface-200 rounded-xl flex items-center justify-between text-sm">
              <span className="text-surface-700">
                Previous Score:{' '}
                <strong>
                  {previousResult.score}/{previousResult.totalQuestions} ({previousResult.passed ? 'Passed' : 'Not passed'})
                </strong>
              </span>
              <span className="text-xs text-surface-500">
                You can retake this quiz anytime to improve your score.
              </span>
            </div>
          )}

          {/* Stepper Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-surface-500 uppercase tracking-wider">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{answeredCount} of {questions.length} answered</span>
            </div>
            <div className="w-full h-2.5 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Question Card */}
          {currentQ && (
            <div className="p-8 bg-white border border-surface-200 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {currentQuestionIndex + 1}
                </span>
                <h2 className="text-xl font-bold text-surface-900 leading-snug">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIndex) => {
                  const isSelected = userAnswers[currentQuestionIndex] === optIndex;
                  const letter = String.fromCharCode(65 + optIndex);

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestionIndex, optIndex)}
                      className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500 shadow-sm'
                          : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50 text-surface-800'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-surface-100 text-surface-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="font-medium text-base">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Question
            </Button>

            <div className="flex items-center gap-3">
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="gap-2"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleGradeAndSubmit}
                  isLoading={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-md hover:shadow-lg"
                >
                  Submit & Grade Quiz 🎯
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
