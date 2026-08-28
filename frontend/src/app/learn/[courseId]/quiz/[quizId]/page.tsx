'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQuiz, submitQuizResult, getMyQuizResults, getCourse } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { type Quiz, type QuizResult, type Course } from '@/types';
import { Button } from '@/components/ui/Button';
import { QuizResultsBanner } from '@/components/features/quiz/QuizResultsBanner';
import { QuizReviewBreakdown } from '@/components/features/quiz/QuizReviewBreakdown';
import { QuizQuestionCard } from '@/components/features/quiz/QuizQuestionCard';
import { Trophy, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function QuizPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || 'student';
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
        const targetCorrect = questions[i].correctIndex !== undefined ? questions[i].correctIndex : questions[i].correctAnswer;
        if (studentChoice === targetCorrect) {
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

      // Persist to backend database for students only (Instructors/Admins preview locally)
      if (roleType === 'student') {
        await submitQuizResult(resultPayload);
      }

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
      <div className="h-full w-full flex items-center justify-center min-h-[350px]">
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
      <div className="mb-8 pb-6 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4" />
          <span>Course Assessment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">{quiz.title}</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Passing score: 70% • Total questions: {questions.length} • Auto-graded
        </p>
      </div>

      {/* ── RESULTS VIEW (After Submission) ── */}
      {submittedResult ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          <QuizResultsBanner
            score={submittedResult.score}
            totalQuestions={submittedResult.totalQuestions}
            percentage={submittedResult.percentage}
            passed={submittedResult.passed}
            courseId={courseId}
            onRetake={handleRetake}
          />

          <QuizReviewBreakdown
            questions={questions}
            userAnswers={userAnswers}
          />
        </div>
      ) : (
        /* ── ACTIVE QUIZ TAKER ── */
        <div className="space-y-6">
          {/* Previous Result Banner if retaking */}
          {previousResult && !submittedResult && (
            <div className="p-4 bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl flex items-center justify-between text-sm">
              <span className="text-surface-700 dark:text-surface-300">
                Previous Score:{' '}
                <strong>
                  {previousResult.score}/{previousResult.totalQuestions} ({previousResult.passed ? 'Passed' : 'Not passed'})
                </strong>
              </span>
              <span className="text-xs text-surface-500 dark:text-surface-400">
                You can retake this quiz anytime to improve your score.
              </span>
            </div>
          )}

          {/* Stepper Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{answeredCount} of {questions.length} answered</span>
            </div>
            <div className="w-full h-2.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 dark:bg-brand-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Question Card */}
          {currentQ && (
            <QuizQuestionCard
              question={currentQ}
              questionIndex={currentQuestionIndex}
              selectedOptionIndex={userAnswers[currentQuestionIndex]}
              onSelectOption={(optIndex) => handleSelectOption(currentQuestionIndex, optIndex)}
            />
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="gap-2 cursor-pointer"
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
                  className="gap-2 cursor-pointer"
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
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Assessment</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
