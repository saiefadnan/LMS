'use client';

import { useState } from 'react';
import { createQuiz, updateQuiz, deleteQuiz } from '@/lib/api';
import { type Quiz, type QuizQuestion, type Course } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { HelpCircle, AlertCircle, Plus, Trash2, Edit3, CheckCircle2, X } from 'lucide-react';

interface QuizManagerProps {
  course: Course;
  onQuizChanged: () => void;
}

interface QuestionFormState {
  question: string;
  options: string[];
  correctAnswer: number;
}

const defaultQuestion = (): QuestionFormState => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
});

export function QuizManager({ course, onQuizChanged }: QuizManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionFormState[]>([defaultQuestion()]);

  const quizzes = course.quizzes || [];

  const handleStartAdd = () => {
    setTitle('');
    setQuestions([defaultQuestion()]);
    setError('');
    setEditingQuiz(null);
    setIsAdding(true);
  };

  const handleStartEdit = (quiz: Quiz) => {
    setTitle(quiz.title);
    setQuestions(
      quiz.questions?.length
        ? quiz.questions.map((q) => ({
            question: q.question,
            options: [...q.options],
            correctAnswer: q.correctAnswer ?? 0,
          }))
        : [defaultQuestion()]
    );
    setError('');
    setIsAdding(false);
    setEditingQuiz(quiz);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingQuiz(null);
    setError('');
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].question = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  const handleCorrectAnswerSelect = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = optIndex;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} prompt cannot be empty.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Question ${i + 1}, Option ${String.fromCharCode(65 + j)} cannot be empty.`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      const formattedQuestions: QuizQuestion[] = questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctAnswer: q.correctAnswer,
      }));

      if (isAdding) {
        await createQuiz({
          title: title.trim(),
          questions: formattedQuestions,
          course: course.id,
        });
      } else if (editingQuiz) {
        await updateQuiz(editingQuiz.documentId, {
          title: title.trim(),
          questions: formattedQuestions,
        });
      }

      setIsAdding(false);
      setEditingQuiz(null);
      onQuizChanged();
    } catch (err: any) {
      console.error('Failed to save quiz:', err);
      setError(err.message || 'Failed to save quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (quizDocId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await deleteQuiz(quizDocId);
      onQuizChanged();
    } catch (err: any) {
      alert(err.message || 'Failed to delete quiz');
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">
            Quizzes & Assessments ({quizzes.length})
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Evaluate learners at the end of the course with auto-graded multiple choice assessments.
          </p>
        </div>
        {!isAdding && !editingQuiz && (
          <Button onClick={handleStartAdd} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Quiz</span>
          </Button>
        )}
      </div>

      {/* Quiz List */}
      {!isAdding && !editingQuiz && (
        <div className="space-y-3">
          {quizzes.length === 0 ? (
            <div className="text-surface-500 dark:text-surface-400 text-center py-10 border border-dashed border-surface-200 dark:border-surface-800 rounded-xl bg-surface-50/50 dark:bg-surface-900/50">
              <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 flex items-center justify-center mx-auto mb-2.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <p className="font-semibold text-surface-800 dark:text-surface-200 text-sm">No quizzes created yet</p>
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
                Add an MCQ quiz to evaluate learners at the end of this course.
              </p>
              <Button onClick={handleStartAdd} variant="outline" size="sm" className="mt-3 gap-1 text-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>Create Assessment</span>
              </Button>
            </div>
          ) : (
            quizzes.map((quiz, index) => {
              const qCount = quiz.questions?.length || 0;
              return (
                <div
                  key={quiz.documentId || quiz.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl hover:border-surface-300 dark:hover:border-surface-700 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs border border-brand-100 dark:border-brand-900">
                      Q{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-surface-900 dark:text-surface-100 text-sm">{quiz.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                        <span>{qCount} Question{qCount === 1 ? '' : 's'}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Auto-Graded</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleStartEdit(quiz)} className="text-xs">
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(quiz.documentId)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add / Edit Form */}
      {(isAdding || editingQuiz) && (
        <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-surface-900 dark:text-surface-50">
              {isAdding ? 'Create New Quiz' : `Edit Quiz: ${editingQuiz?.title}`}
            </h3>
            <span className="text-xs bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-200 font-medium px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-900">
              {questions.length} Question{questions.length === 1 ? '' : 's'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <Input
                label="Quiz Title"
                placeholder="e.g., Module Assessment Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Questions Builder */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center border-b border-surface-200 dark:border-surface-800 pb-2">
                <h4 className="font-bold text-surface-800 dark:text-surface-200 text-xs uppercase tracking-wider">
                  Questions & Answer Key
                </h4>
                <span className="text-xs text-surface-500 dark:text-surface-400">
                  Select the radio button next to the correct answer.
                </span>
              </div>

              {questions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="bg-white dark:bg-surface-950 p-4.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs space-y-3 relative"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2.5 flex-grow">
                      <span className="w-6 h-6 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {qIndex + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Question ${qIndex + 1} prompt...`}
                        value={q.question}
                        onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                        className="w-full text-sm font-medium border-b border-surface-200 dark:border-surface-700 focus:border-brand-500 focus:outline-none py-1 px-1 bg-transparent text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500"
                        required
                      />
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className="text-surface-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Remove question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, optIndex) => {
                      const isCorrect = q.correctAnswer === optIndex;
                      const letter = String.fromCharCode(65 + optIndex);
                      return (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all ${
                            isCorrect
                              ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                              : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 bg-surface-50/50 dark:bg-surface-900/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={isCorrect}
                            onChange={() => handleCorrectAnswerSelect(qIndex, optIndex)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            title="Mark as correct answer"
                          />
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              isCorrect
                                ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                                : 'bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                            }`}
                          >
                            {letter}
                          </span>
                          <input
                            type="text"
                            placeholder={`Option ${letter}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                            className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="w-full border-dashed border-surface-300 dark:border-surface-700 py-2.5 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 gap-1.5 text-xs font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Question</span>
              </Button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting}>
                {isAdding ? 'Create Quiz' : 'Save Quiz Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
