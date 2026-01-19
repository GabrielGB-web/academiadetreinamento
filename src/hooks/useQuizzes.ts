import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
  points_reward: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string | null;
  order_index: number;
  created_at: string;
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

// Fetch quiz for a lesson
export function useQuizForLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['quiz', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (quizError) throw quizError;
      if (!quiz) return null;

      // Fetch questions from the public view (excludes correct_option)
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions_public')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      return {
        ...quiz,
        questions: (questions || []).map((q) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options as string[] : [],
        })),
      };
    },
    enabled: !!lessonId,
  });
}

// Fetch all quizzes (admin)
export function useQuizzes() {
  return useQuery({
    queryKey: ['quizzes-admin'],
    queryFn: async () => {
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (quizzesError) throw quizzesError;

      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      return (quizzes || []).map((quiz) => ({
        ...quiz,
        questions: (questions || [])
          .filter((q) => q.quiz_id === quiz.id)
          .map((q) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options as string[] : [],
          })),
      })) as QuizWithQuestions[];
    },
  });
}

// Create quiz
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quiz: { lesson_id: string; title: string; passing_score?: number; points_reward?: number }) => {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([quiz])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes-admin'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// Delete quiz
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes-admin'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// Create question
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: { 
      quiz_id: string; 
      question_text: string; 
      options: string[]; 
      correct_option: number; 
      explanation?: string;
      order_index?: number;
    }) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert([{
          ...question,
          options: question.options,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes-admin'] });
    },
  });
}

// Delete question
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes-admin'] });
    },
  });
}

// Verify quiz answer (calls edge function or checks locally)
export function useVerifyQuizAnswer() {
  return useMutation({
    mutationFn: async ({ questionId, selectedOption }: { questionId: string; selectedOption: number }) => {
      // For now, we need to fetch the correct answer from the full questions table
      // This should ideally be done through an edge function for security
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('correct_option, explanation')
        .eq('id', questionId)
        .single();

      if (error) throw error;

      return {
        isCorrect: data.correct_option === selectedOption,
        correctOption: data.correct_option,
        explanation: data.explanation,
      };
    },
  });
}
