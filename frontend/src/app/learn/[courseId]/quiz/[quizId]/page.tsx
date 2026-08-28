'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuiz, useMyQuizResults, useSubmitQuizResult } from '@/hooks/queries/useQuizzes';
import { useCourse } from '@/hooks/queries/useCourses';
import { useAuthStore } from '@/stores/auth';
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

  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId);
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: results = [], isLoading: resultsLoading } = useMyQuizResults(Boolean(user));
  const submitMutation = useSubmitQuizResult();

  const loading = quizLoading || courseLoading || resultsLoading;

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
  const [error, setError] = useState('');

  const previousResult = results.find(
    (r) => r.quiz?.documentId === quizId || (r.quiz as any)?.id === quiz?.id
  ) || null;

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
      setError('');

      // Auto-grading algorithm
      let score = 0;
      const questions = quiz.questions;
      const formattedAnswers: Record<string, number> = {};

      for (let i = 0; i < questions.length; i++) {
        const studentChoice = userAnswers[i];
        formattedAnswers[`q_${i}`] = studentChoice;
        const targetCorrect =
          questions[i].correctIndex !== undefined
            ? questions[i].correctIndex
            : questions[i].correctAnswer;
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
        await submitMutation.mutateAsync(resultPayload);
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
  const currentQuestion = questions[currentQuestionIndex];
  const activeResult = submittedResult || previousResult;

  // Convert previousResult formatted answers to numeric map if needed
  const reviewAnswers: Record<number, number> = {};
  if (submittedResult) {
    Object.assign(reviewAnswers, userAnswers);
  } else if (previousResult?.answers) {
    Object.entries(previousResult.answers).forEach(([key, val]) => {
      const idx = parseInt(key.replace('q_', ''), 10);
      if (!isNaN(idx)) {
        reviewAnswers[idx] = val;
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 sm:px-8 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/learn/${courseId}`}
          className="text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Lessons</span>
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5" />
          Passing Grade: {quiz.passingScore || 70}%
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-surface-900 p-6 sm:p-8 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-surface-50 tracking-tight mb-2">
          {quiz.title}
        </h1>
        {quiz.description && (
          <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed max-w-2xl">
            {quiz.description}
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* View 1: Active Assessment Results */}
      {activeResult && !submittedResult && previousResult && Object.keys(userAnswers).length === 0 ? (
        <div className="space-y-8">
          <QuizResultsBanner
            percentage={previousResult.percentage || Math.round(((previousResult.score || 0) / (previousResult.totalQuestions || 1)) * 100)}
            passed={Boolean(previousResult.passed)}
            score={previousResult.score}
            totalQuestions={previousResult.totalQuestions}
            courseId={courseId}
            onRetake={handleRetake}
          />

          <QuizReviewBreakdown
            questions={questions}
            userAnswers={reviewAnswers}
          />
        </div>
      ) : submittedResult ? (
        <div className="space-y-8">
          <QuizResultsBanner
            percentage={submittedResult.percentage}
            passed={submittedResult.passed}
            score={submittedResult.score}
            totalQuestions={submittedResult.totalQuestions}
            courseId={courseId}
            onRetake={handleRetake}
          />

          <QuizReviewBreakdown
            questions={questions}
            userAnswers={userAnswers}
          />
        </div>
      ) : (
        /* View 2: Taking the Quiz (Question by Question) */
        <div className="space-y-6">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between text-xs font-bold text-surface-600 dark:text-surface-400">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Completed</span>
          </div>

          <div className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 dark:bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Active Question Card */}
          {currentQuestion && (
            <QuizQuestionCard
              question={currentQuestion}
              questionIndex={currentQuestionIndex}
              selectedOptionIndex={userAnswers[currentQuestionIndex]}
              onSelectOption={(optIdx) => handleSelectOption(currentQuestionIndex, optIdx)}
            />
          )}

          {/* Question Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-surface-200 dark:border-surface-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="gap-1.5 cursor-pointer text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="gap-1.5 cursor-pointer text-xs font-bold"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleGradeAndSubmit}
                disabled={submitMutation.isPending}
                className="gap-1.5 cursor-pointer text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitMutation.isPending ? 'Grading Answers...' : 'Submit Assessment'}</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
