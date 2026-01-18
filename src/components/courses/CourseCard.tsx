import { Link } from 'react-router-dom';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';
import { Course } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
  course: Course;
}

const difficultyColors = {
  iniciante: 'bg-success/20 text-success border-success/30',
  intermediario: 'bg-warning/20 text-warning border-warning/30',
  avancado: 'bg-destructive/20 text-destructive border-destructive/30',
};

const difficultyLabels = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export function CourseCard({ course }: CourseCardProps) {
  const isCompleted = course.progress === 100;
  const hasStarted = (course.progress || 0) > 0;

  return (
    <Link
      to={`/cursos/${course.id}`}
      className="group block"
    >
      <div className="rounded-xl overflow-hidden gradient-card shadow-card border border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          
          {/* Progress overlay */}
          {hasStarted && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  isCompleted ? 'gradient-success' : 'gradient-primary'
                )}
                style={{ width: `${course.progress}%` }}
              />
            </div>
          )}

          {/* Badge */}
          <Badge
            className={cn(
              'absolute top-3 right-3 border',
              difficultyColors[course.difficulty]
            )}
          >
            {difficultyLabels[course.difficulty]}
          </Badge>

          {isCompleted && (
            <Badge className="absolute top-3 left-3 gradient-success border-0">
              ✓ Concluído
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description}
          </p>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {course.totalModules} módulos
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.totalDuration}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
          </div>
        </div>
      </div>
    </Link>
  );
}
