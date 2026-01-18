import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  quizScore?: number;
  completedAt?: string;
}

export function useLessonProgress() {
  const { supabaseUser } = useAuth();
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all progress for the user
  const fetchProgress = useCallback(async () => {
    if (!supabaseUser) {
      setProgress([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', supabaseUser.id);

      if (error) {
        console.error('Error fetching progress:', error);
        return;
      }

      setProgress(
        data.map((p) => ({
          lessonId: p.lesson_id,
          completed: p.completed,
          quizScore: p.quiz_score ?? undefined,
          completedAt: p.completed_at ?? undefined,
        }))
      );
    } catch (error) {
      console.error('Error in fetchProgress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Mark a lesson as completed
  const markAsCompleted = async (lessonId: string): Promise<boolean> => {
    if (!supabaseUser) return false;

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: supabaseUser.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id',
        });

      if (error) {
        console.error('Error marking lesson as completed:', error);
        return false;
      }

      // Update local state
      setProgress((prev) => {
        const existing = prev.find((p) => p.lessonId === lessonId);
        if (existing) {
          return prev.map((p) =>
            p.lessonId === lessonId
              ? { ...p, completed: true, completedAt: new Date().toISOString() }
              : p
          );
        }
        return [
          ...prev,
          { lessonId, completed: true, completedAt: new Date().toISOString() },
        ];
      });

      return true;
    } catch (error) {
      console.error('Error in markAsCompleted:', error);
      return false;
    }
  };

  // Save quiz score
  const saveQuizScore = async (lessonId: string, score: number): Promise<boolean> => {
    if (!supabaseUser) return false;

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: supabaseUser.id,
          lesson_id: lessonId,
          completed: true,
          quiz_score: score,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id',
        });

      if (error) {
        console.error('Error saving quiz score:', error);
        return false;
      }

      // Update local state
      setProgress((prev) => {
        const existing = prev.find((p) => p.lessonId === lessonId);
        if (existing) {
          return prev.map((p) =>
            p.lessonId === lessonId
              ? { ...p, completed: true, quizScore: score, completedAt: new Date().toISOString() }
              : p
          );
        }
        return [
          ...prev,
          { lessonId, completed: true, quizScore: score, completedAt: new Date().toISOString() },
        ];
      });

      return true;
    } catch (error) {
      console.error('Error in saveQuizScore:', error);
      return false;
    }
  };

  // Check if a lesson is completed
  const isLessonCompleted = (lessonId: string): boolean => {
    return progress.some((p) => p.lessonId === lessonId && p.completed);
  };

  // Get quiz score for a lesson
  const getQuizScore = (lessonId: string): number | undefined => {
    return progress.find((p) => p.lessonId === lessonId)?.quizScore;
  };

  return {
    progress,
    isLoading,
    markAsCompleted,
    saveQuizScore,
    isLessonCompleted,
    getQuizScore,
    refetch: fetchProgress,
  };
}
