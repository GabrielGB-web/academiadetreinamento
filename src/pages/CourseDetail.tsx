import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  ChevronDown,
  Lock
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCourses } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [openModules, setOpenModules] = useState<string[]>([]);
  
  const course = mockCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Curso não encontrado.</p>
          <Link to="/cursos">
            <Button className="mt-4">Voltar aos Cursos</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const completedLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
    0
  );

  return (
    <MainLayout>
      {/* Back Button */}
      <Link to="/cursos" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar aos Cursos
      </Link>

      {/* Course Header */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 animate-slide-up">
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-3">
            {course.title}
          </h1>
          <p className="text-muted-foreground mb-4">{course.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {course.totalModules} módulos
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.totalDuration}
            </span>
            <Badge variant="outline">{course.category}</Badge>
          </div>
        </div>

        {/* Progress Card */}
        <div className="p-6 rounded-xl gradient-card shadow-card border border-border/50 h-fit animate-scale-in">
          <h3 className="font-display font-semibold mb-4">Seu Progresso</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {completedLessons} de {totalLessons} aulas
              </span>
              <span className="font-semibold">{course.progress || 0}%</span>
            </div>
            <Progress value={course.progress || 0} className="h-2" />
          </div>
          <Button variant="gradient" className="w-full" size="lg">
            <Play className="w-5 h-5 mr-2" />
            {(course.progress || 0) > 0 ? 'Continuar' : 'Começar'}
          </Button>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold mb-4">
          Conteúdo do Curso
        </h2>
        
        {course.modules.map((module, moduleIndex) => {
          const isOpen = openModules.includes(module.id);
          const moduleCompleted = module.lessons.every((l) => l.completed);
          const moduleProgress = Math.round(
            (module.lessons.filter((l) => l.completed).length / module.lessons.length) * 100
          );

          return (
            <Collapsible
              key={module.id}
              open={isOpen}
              onOpenChange={() => toggleModule(module.id)}
              className="animate-slide-up"
              style={{ animationDelay: `${moduleIndex * 0.05}s` }}
            >
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center justify-between bg-card hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center font-semibold',
                        moduleCompleted ? 'gradient-success' : 'bg-secondary'
                      )}>
                        {moduleCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          moduleIndex + 1
                        )}
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {module.lessons.length} aulas • {moduleProgress}% concluído
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      'w-5 h-5 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180'
                    )} />
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t border-border/50">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isLocked = lessonIndex > 0 && !module.lessons[lessonIndex - 1].completed;
                      
                      return (
                        <Link
                          key={lesson.id}
                          to={!isLocked ? `/aula/${lesson.id}` : '#'}
                          className={cn(
                            'flex items-center gap-4 p-4 border-b border-border/30 last:border-0 transition-colors',
                            isLocked 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-secondary/30'
                          )}
                          onClick={(e) => isLocked && e.preventDefault()}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            lesson.completed 
                              ? 'gradient-success' 
                              : isLocked 
                                ? 'bg-muted' 
                                : 'bg-primary/20 text-primary'
                          )}>
                            {lesson.completed ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.duration}
                            </p>
                          </div>
                          {lesson.quiz && (
                            <Badge variant="secondary" className="text-xs">
                              Prova
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </MainLayout>
  );
}
