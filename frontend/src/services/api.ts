// ─── REST API Service ─────────────────────────────────────────────────────────
// Thin fetch wrapper for all backend HTTP endpoints.
// Automatically attaches the JWT token from localStorage.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// ─── Auth 

export const registerUser = async (email: string, password: string, display_name: string) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password, display_name }),
  });

  return handleResponse(res);
};

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const getMe = async () => {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
  return handleResponse(res);
};

// ─── Quizzes

export const getMyQuizzes = async () => {
  const res = await fetch(`${API_BASE}/quizzes`, { headers: getHeaders() });
  return handleResponse(res);
};

export const generateQuizDraft = async (topic: string, difficulty: string, numQuestions: number = 5) => {
  const res = await fetch(`${API_BASE}/quizzes/generate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ topic, difficulty, numQuestions }),
  });
  return handleResponse(res);
};

export const saveQuiz = async (title: string, topic: string, difficulty: string, questions: any[]) => {
  const res = await fetch(`${API_BASE}/quizzes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title, topic, difficulty, questions }),
  });
  return handleResponse(res);
};

export const deleteQuiz = async (id: number) => {
  const res = await fetch(`${API_BASE}/quizzes/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
};

// ─── Game 

export const hostGame = async (quizId: number) => {
  const res = await fetch(`${API_BASE}/game/host`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ quizId }),
  });
  return handleResponse(res);
};

export const getGameResults = async (pin: string) => {
  const res = await fetch(`${API_BASE}/game/${pin}/results`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};
