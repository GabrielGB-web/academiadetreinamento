import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson as LegacyLesson } from '@/types';

interface LessonWithCourseInfo extends LegacyLesson {
  courseId: string;
  courseTitle: string;
  hasQuiz: boolean;
  quizInfo?: {
    id: string;
    title: string;
    passingScore: number;
    pointsReward: number;
  };
}

export function useLessonById(lessonId: string | undefined) {
  const { supabaseUser } = useAuth();

  return useQuery({
    queryKey: ['lesson', lessonId, supabaseUser?.id],
    queryFn: async () => {
      if (!lessonId) return null;

      // Fetch the lesson
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lesson) return null;

      // Fetch the module to get course info
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select('*, courses(*)')
        .eq('id', lesson.module_id)
        .maybeSingle();

      if (moduleError) throw moduleError;
      if (!module) return null;

      // Fetch quiz info if exists
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('id, title, passing_score, points_reward')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      // Check if lesson is completed (for current user)
      let isCompleted = false;
      if (supabaseUser) {
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('completed')
          .eq('user_id', supabaseUser.id)
          .eq('lesson_id', lessonId)
          .maybeSingle();

        isCompleted = progress?.completed || false;
      }

      const course = module.courses as { id: string; title: string };

      const result: LessonWithCourseInfo = {
        id: lesson.id,
        moduleId: lesson.module_id,
        title: lesson.title,
        description: lesson.description || '',
        videoUrl: lesson.video_url || '',
        duration: lesson.duration || '0:00',
        order: lesson.order_index,
        completed: isCompleted,
        courseId: course?.id || '',
        courseTitle: course?.title || '',
        hasQuiz: !!quiz,
        quizInfo: quiz ? {
          id: quiz.id,
          title: quiz.title,
          passingScore: quiz.passing_score,
          pointsReward: quiz.points_reward,
        } : undefined,
        quiz: quiz ? {
          id: quiz.id,
          lessonId: lessonId,
          title: quiz.title,
          questions: [], // Will be loaded separately
          passingScore: quiz.passing_score,
          pointsReward: quiz.points_reward,
        } : undefined,
      };

      return result;
    },
    enabled: !!lessonId,
  });
}

// Fetch quiz questions for taking the quiz (uses public view without correct answers)
export function useQuizQuestionsForLesson(lessonId: string | undefined, shouldFetch: boolean) {
  return useQuery({
    queryKey: ['quiz-questions-public', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];

      // First get the quiz ID
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (quizError) throw quizError;
      if (!quiz) return [];

      // Fetch questions from public view (no correct_option)
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions_public')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      return (questions || []).map((q) => ({
        id: q.id || '',
        text: q.question_text || '',
        options: Array.isArray(q.options) ? (q.options as string[]) : [],
        explanation: q.explanation || undefined,
      }));
    },
    enabled: !!lessonId && shouldFetch,
  });
}

// Verify answer by calling the server
export async function verifyAnswer(questionId: string, selectedOption: number): Promise<{
  isCorrect: boolean;
  correctOption: number;
  explanation: string | null;
}> {
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
}
