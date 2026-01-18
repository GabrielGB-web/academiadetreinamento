import { BookOpen, Trophy, Target, Flame, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { CourseCard } from '@/components/courses/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import { mockCourses } from '@/data/mockData';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  
  const inProgressCourses = mockCourses.filter(
    c => (c.progress || 0) > 0 && (c.progress || 0) < 100
  );
  
  const completedCourses = mockCourses.filter(c => c.progress === 100);
  const overallProgress = Math.round(
    mockCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / mockCourses.length
  );

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Continue sua jornada de aprendizado e conquiste novos pontos.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Cursos Concluídos"
          value={completedCourses.length}
          icon={<BookOpen className="w-5 h-5 text-primary-foreground" />}
          variant="primary"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Pontuação Total"
          value={user?.points?.toLocaleString() || 0}
          icon={<Trophy className="w-5 h-5 text-primary-foreground" />}
          variant="success"
          trend={{ value: 25, isPositive: true }}
        />
        <StatsCard
          title="Sua Posição"
          value={`#${user?.rank ?? 1}`}
          icon={<Target className="w-5 h-5 text-primary-foreground" />}
          variant="accent"
        />
        <StatsCard
          title="Sequência"
          value="7 dias"
          icon={<Flame className="w-5 h-5 text-primary-foreground" />}
          variant="default"
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Progress and Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          {inProgressCourses.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold">
                  Continue Aprendendo
                </h2>
                <Link to="/cursos">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ver todos
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {inProgressCourses.slice(0, 2).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {/* Recommended Courses */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold">
                Recomendados para Você
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {mockCourses
                .filter(c => (c.progress || 0) === 0)
                .slice(0, 2)
                .map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="p-6 rounded-xl gradient-card shadow-card border border-border/50 animate-scale-in">
            <h3 className="text-lg font-display font-semibold mb-4">
              Progresso Geral
            </h3>
            <div className="flex justify-center mb-4">
              <ProgressRing progress={overallProgress} size={140} strokeWidth={10} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xl font-bold">{completedCourses.length}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xl font-bold">{inProgressCourses.length}</p>
                <p className="text-xs text-muted-foreground">Em andamento</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-xl gradient-card shadow-card border border-border/50 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-display font-semibold mb-4">
              Ações Rápidas
            </h3>
            <div className="space-y-2">
              <Link to="/cursos">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explorar Cursos
                </Button>
              </Link>
              <Link to="/ranking">
                <Button variant="outline" className="w-full justify-start">
                  <Trophy className="w-4 h-4 mr-2" />
                  Ver Ranking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
