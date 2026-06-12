import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyQuizzes, generateQuizDraft, saveQuiz, hostGame, deleteQuiz } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import type { Quiz } from '../types';

export const useDashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [numQuestions, setNumQuestions] = useState(5);
  const [showGenerator, setShowGenerator] = useState(false);
  const [error, setError] = useState('');

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await getMyQuizzes();
      setQuizzes(data.quizzes || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError('');

    try {
      const draft = await generateQuizDraft(topic, difficulty, numQuestions);

      const questions = (draft.questions || []).map((q: any) => ({
        question_text: q.question_text,
        options: q.options,
        correct_option_index: q.correct_option_index,
        time_limit_seconds: draft.time_limit_seconds || q.time_limit_seconds || 20,
        points: draft.points || q.points || 200,
      }));

      await saveQuiz(
        draft.quiz_title || draft.title || topic,
        topic,
        difficulty,
        questions
      );

      await fetchQuizzes();
      setShowGenerator(false);
      setTopic('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleHost = async (quizId: number) => {
    try {
      const data = await hostGame(quizId);
      navigate(`/host/${data.pin}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (quizId: number) => {
    try {
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return {
    quizzes,
    loading,
    generating,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    numQuestions,
    setNumQuestions,
    showGenerator,
    setShowGenerator,
    error,
    setError,
    user,
    handleGenerate,
    handleHost,
    handleDelete,
    handleLogout
  };
};
