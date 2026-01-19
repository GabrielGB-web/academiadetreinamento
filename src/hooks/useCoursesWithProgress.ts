import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Course as LegacyCourse } from '@/types';

export interface CourseWithProgress extends LegacyCourse {
  dbId: string;
}

// Convert database course to legacy Course type with progress
export function useCoursesWithProgress() {
  const { supabaseUser } = useAuth();

  return useQuery({
    queryKey: ['courses-with-progress', supabaseUser?.id],
    queryFn: async () => {
      // Fetch courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Fetch modules
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;

      // Fetch lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;

      // Fetch quizzes to know which lessons have quizzes
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('lesson_id');

      if (quizzesError) throw quizzesError;

      // Fetch user progress if logged in
      let userProgress: { lesson_id: string; completed: boolean; quiz_score: number | null }[] = [];
      if (supabaseUser) {
        const { data: progress, error: progressError } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed, quiz_score')
          .eq('user_id', supabaseUser.id);

        if (!progressError && progress) {
          userProgress = progress;
        }
      }

      const quizLessonIds = new Set((quizzes || []).map((q) => q.lesson_id));
      const completedLessonIds = new Set(
        userProgress.filter((p) => p.completed).map((p) => p.lesson_id)
      );

      // Convert to legacy format
      const coursesWithProgress: CourseWithProgress[] = (courses || []).map((course) => {
        const courseModules = (modules || [])
          .filter((m) => m.course_id === course.id)
          .map((module) => {
            const moduleLessons = (lessons || [])
              .filter((l) => l.module_id === module.id)
              .map((lesson) => ({
                id: lesson.id,
                moduleId: module.id,
                title: lesson.title,
                description: lesson.description || '',
                videoUrl: lesson.video_url || '',
                duration: lesson.duration || '0:00',
                order: lesson.order_index,
                completed: completedLessonIds.has(lesson.id),
                quiz: quizLessonIds.has(lesson.id) ? {
                  id: `quiz-${lesson.id}`,
                  lessonId: lesson.id,
                  title: 'Quiz',
                  questions: [],
                  passingScore: 70,
                  pointsReward: 100,
                } : undefined,
              }));

            return {
              id: module.id,
              courseId: course.id,
              title: module.title,
              order: module.order_index,
              lessons: moduleLessons,
            };
          });

        // Calculate progress
        const totalLessons = courseModules.reduce((acc, m) => acc + m.lessons.length, 0);
        const completedLessons = courseModules.reduce(
          (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
          0
        );
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        // Calculate total duration
        const totalMinutes = courseModules.reduce((acc, m) => {
          return acc + m.lessons.reduce((lAcc, l) => {
            const parts = l.duration.split(':');
            const mins = parseInt(parts[0]) || 0;
            const secs = parseInt(parts[1]) || 0;
            return lAcc + mins + secs / 60;
          }, 0);
        }, 0);

        const hours = Math.floor(totalMinutes / 60);
        const mins = Math.round(totalMinutes % 60);
        const totalDuration = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;

        return {
          id: course.id,
          dbId: course.id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
          totalModules: courseModules.length,
          totalDuration,
          difficulty: course.difficulty as 'iniciante' | 'intermediario' | 'avancado',
          category: course.category,
          progress,
          modules: courseModules,
        };
      });

      return coursesWithProgress;
    },
  });
}

// Get a single course with progress
export function useCourseWithProgress(courseId: string | undefined) {
  const { data: courses, isLoading, error } = useCoursesWithProgress();

  const course = courses?.find((c) => c.id === courseId);

  return {
    data: course,
    isLoading,
    error,
  };
}
