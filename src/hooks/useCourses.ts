import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  title: string;
  description: string | null;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  category: string;
  course_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseWithModules extends Course {
  modules: (Module & { lessons: Lesson[] })[];
}

// Fetch all courses with modules and lessons
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;

      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;

      // Combine data
      const coursesWithModules: CourseWithModules[] = (courses || []).map((course) => ({
        ...course,
        difficulty: course.difficulty as 'iniciante' | 'intermediario' | 'avancado',
        modules: (modules || [])
          .filter((m) => m.course_id === course.id)
          .map((module) => ({
            ...module,
            lessons: (lessons || []).filter((l) => l.module_id === module.id),
          })),
      }));

      return coursesWithModules;
    },
  });
}

// Create course
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (course: { title: string; description: string; thumbnail?: string; difficulty: string; category: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([course])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// Update course
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...course }: { id: string; title?: string; description?: string; thumbnail?: string; difficulty?: string; category?: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(course)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// Delete course
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// Create module
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (module: { course_id: string; title: string; order_index?: number }) => {
      const { data, error } = await supabase
        .from('modules')
        .insert([module])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// Delete module
export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// Create lesson
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lesson: { module_id: string; title: string; description?: string; video_url?: string; duration?: string; order_index?: number }) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert([lesson])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// Delete lesson
export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// Fetch all materials
export function useMaterials() {
  return useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Material[];
    },
  });
}

// Create material
export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (material: { title: string; description?: string; type: string; url: string; category: string; course_id?: string }) => {
      const { data, error } = await supabase
        .from('materials')
        .insert([material])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

// Delete material
export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}
