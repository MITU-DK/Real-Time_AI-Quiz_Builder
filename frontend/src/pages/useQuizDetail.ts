import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById } from '../services/api';
import type { Quiz } from '../types';

export const useQuizDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchQuiz = async () => {
      try {
        const data = await getQuizById(parseInt(id, 10));
        setQuiz(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  return {
    quiz,
    loading,
    error,
    goBack: () => navigate('/dashboard'),
  };
};
