export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  points: number;
  rank?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  totalModules: number;
  totalDuration: string;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  category: string;
  progress?: number;
  modules: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  order: number;
  completed?: boolean;
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: Question[];
  passingScore: number;
  pointsReward: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  category: string;
  courseId?: string;
}

export interface UserProgress {
  lessonId: string;
  completed: boolean;
  quizScore?: number;
  completedAt?: string;
}
