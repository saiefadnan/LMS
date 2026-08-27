'use client';

import { useState } from 'react';
import { createQuiz, updateQuiz, deleteQuiz } from '@/lib/api';
import { type Quiz, type QuizQuestion, type Course } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionFormState[]>([defaultQuestion()]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const quizzes = course.quizzes || [];

  const handleStartAdd = () => {
    setTitle('');
    setQuestions([defaultQuestion()]);
    setEditingQuiz(null);
    setIsAdding(true);
    setError('');
  };

  const handleStartEdit = (quiz: Quiz) => {
    setTitle(quiz.title);
    setQuestions(
      quiz.questions && quiz.questions.length > 0
        ? quiz.questions.map((q) => ({
            question: q.question,
            options: q.options && q.options.length > 0 ? [...q.options] : ['', '', '', ''],
            correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          }))
        : [defaultQuestion()]
    );
    setEditingQuiz(quiz);
    setIsAdding(false);
    setError('');
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
    if (questions.length <= 1) {
      setError('A quiz must have at least one question.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
    setError('');
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question = text;
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

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Please enter a quiz title.');
      return false;
    }

    if (questions.length === 0) {
      setError('Please add at least one question.');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is empty. Please enter question text.`);
        return false;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Option ${String.fromCharCode(65 + j)} for Question ${i + 1} is empty.`);
          return false;
        }
      }
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError('');

      const cleanQuestions: QuizQuestion[] = questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctAnswer: q.correctAnswer,
      }));

      if (isAdding) {
        await createQuiz({
          title: title.trim(),
          questions: cleanQuestions,
          course: course.documentId,
        });
      } else if (editingQuiz) {
        await updateQuiz(editingQuiz.documentId, {
          title: title.trim(),
          questions: cleanQuestions,
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
          <h2 className="text-xl font-bold text-surface-900">
            Quizzes & Assessments ({quizzes.length})
          </h2>
          <p className="text-sm text-surface-500 mt-0.5">
            Test students' knowledge with auto-graded multiple choice quizzes.
          </p>
        </div>
        {!isAdding && !editingQuiz && (
          <Button onClick={handleStartAdd} variant="secondary" size="sm">
            + Add Quiz
          </Button>
        )}
      </div>

      {/* Quiz List */}
      {!isAdding && !editingQuiz && (
        <div className="space-y-3">
          {quizzes.length === 0 ? (
            <div className="text-surface-500 text-center py-8 border border-dashed border-surface-300 rounded-lg bg-surface-50">
              <span className="text-3xl block mb-2">📝</span>
              <p className="font-medium text-surface-700">No quizzes created yet</p>
              <p className="text-xs text-surface-400 mt-1">
                Add an MCQ quiz to evaluate learners at the end of this course.
              </p>
              <Button onClick={handleStartAdd} variant="ghost" size="sm" className="mt-3 text-brand-600">
                + Create First Quiz
              </Button>
            </div>
          ) : (
            quizzes.map((quiz, index) => {
              const qCount = quiz.questions?.length || 0;
              return (
                <div
                  key={quiz.documentId || quiz.id}
                  className="flex items-center justify-between p-4 bg-white border border-surface-200 rounded-lg hover:border-surface-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm border border-brand-100">
                      Q{index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-surface-900">{quiz.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-surface-500 mt-0.5">
                        <span>{qCount} Question{qCount === 1 ? '' : 's'}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">Auto-Graded</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleStartEdit(quiz)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(quiz.documentId)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
        <div className="bg-surface-50 p-6 rounded-xl border border-surface-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-surface-900">
              {isAdding ? 'Create New Quiz' : `Edit Quiz: ${editingQuiz?.title}`}
            </h3>
            <span className="text-xs bg-brand-100 text-brand-800 font-medium px-2.5 py-1 rounded-full">
              {questions.length} Question{questions.length === 1 ? '' : 's'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3.5 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <Input
                label="Quiz Title"
                placeholder="e.g., C Basics Mastery Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Questions Builder */}
            <div className="space-y-6 pt-2">
              <div className="flex justify-between items-center border-b border-surface-200 pb-2">
                <h4 className="font-semibold text-surface-800 text-sm uppercase tracking-wide">
                  Questions & Answers
                </h4>
                <span className="text-xs text-surface-500">
                  Select the radio button next to the correct answer for each question.
                </span>
              </div>

              {questions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="bg-white p-5 rounded-lg border border-surface-200 shadow-sm space-y-4 relative"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2 flex-grow">
                      <span className="w-6 h-6 rounded-full bg-surface-100 text-surface-700 text-xs font-bold flex items-center justify-center">
                        {qIndex + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Question ${qIndex + 1} text...`}
                        value={q.question}
                        onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                        className="w-full text-sm font-medium border-b border-surface-300 focus:border-brand-500 focus:outline-none py-1 px-1"
                        required
                      />
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className="text-surface-400 hover:text-red-500 text-sm font-semibold p-1"
                        title="Remove question"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options.map((opt, optIndex) => {
                      const isCorrect = q.correctAnswer === optIndex;
                      const letter = String.fromCharCode(65 + optIndex);
                      return (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                              : 'border-surface-200 hover:border-surface-300 bg-surface-50/50'
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
                                ? 'bg-emerald-200 text-emerald-800'
                                : 'bg-surface-200 text-surface-600'
                            }`}
                          >
                            {letter}
                          </span>
                          <input
                            type="text"
                            placeholder={`Option ${letter}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                            className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-surface-800"
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
                variant="secondary"
                size="sm"
                onClick={handleAddQuestion}
                className="w-full border-dashed border-2 py-3 text-brand-600 hover:bg-brand-50"
              >
                + Add Another Question
              </Button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
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
