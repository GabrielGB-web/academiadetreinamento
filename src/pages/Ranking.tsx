import { MainLayout } from '@/components/layout/MainLayout';
import { RankingPosition } from '@/components/ranking/RankingPosition';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { Trophy, Target, Flame, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Ranking() {
  const { user } = useAuth();

  const achievements = [
    { name: 'Primeiro Curso', icon: Star, earned: true },
    { name: '7 dias seguidos', icon: Flame, earned: true },
    { name: '1000 pontos', icon: Trophy, earned: true },
    { name: 'Top 10', icon: Target, earned: false },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Seu Ranking
        </h1>
        <p className="text-muted-foreground">
          Acompanhe sua posição e continue conquistando pontos!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Ranking Card */}
        <div className="lg:col-span-1">
          <RankingPosition />
        </div>

        {/* Stats and Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="p-6 rounded-xl gradient-card shadow-card border border-border/50 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-3 text-gold" />
              <p className="text-2xl font-display font-bold">{user?.points}</p>
              <p className="text-sm text-muted-foreground">Pontos Totais</p>
            </div>
            <div className="p-6 rounded-xl gradient-card shadow-card border border-border/50 text-center">
              <Target className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-2xl font-display font-bold">85%</p>
              <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
            </div>
            <div className="p-6 rounded-xl gradient-card shadow-card border border-border/50 text-center">
              <Flame className="w-8 h-8 mx-auto mb-3 text-destructive" />
              <p className="text-2xl font-display font-bold">7</p>
              <p className="text-sm text-muted-foreground">Dias Seguidos</p>
            </div>
          </div>

          {/* How it works */}
          <div className="p-6 rounded-xl gradient-card shadow-card border border-border/50 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <h3 className="text-lg font-display font-semibold mb-4">
              Como Funciona
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Complete aulas e provas</p>
                  <p className="text-sm text-muted-foreground">
                    Cada prova concluída com sucesso gera pontos.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Acumule pontos</p>
                  <p className="text-sm text-muted-foreground">
                    Quanto mais você acertar, mais pontos ganha.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Suba no ranking</p>
                  <p className="text-sm text-muted-foreground">
                    Sua posição é comparada com toda a equipe de vendas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="p-6 rounded-xl gradient-card shadow-card border border-border/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-display font-semibold mb-4">
              Conquistas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`p-4 rounded-lg text-center transition-all ${
                    achievement.earned
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-secondary/50 opacity-50'
                  }`}
                >
                  <achievement.icon
                    className={`w-8 h-8 mx-auto mb-2 ${
                      achievement.earned ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <p className="text-xs font-medium">{achievement.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
