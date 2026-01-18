import { Trophy, TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function RankingPosition() {
  const { user } = useAuth();
  
  if (!user) return null;

  const rank = user.rank || 1;

  return (
    <div className="rounded-xl gradient-card shadow-card border border-border/50 p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-display font-semibold">Sua Posição</h2>
        <Trophy className="w-6 h-6 text-gold" />
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className={cn(
          'w-28 h-28 rounded-full flex items-center justify-center relative',
          rank <= 3 ? 'gradient-gold shadow-glow-primary' : 'gradient-primary'
        )}>
          <span className="text-4xl font-display font-bold text-primary-foreground">
            #{rank}
          </span>
          {rank <= 3 && (
            <Star className="absolute -top-2 -right-2 w-8 h-8 text-gold fill-gold" />
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-2xl font-display font-bold text-gradient-primary">
          {user.points.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">pontos acumulados</p>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-secondary/50 flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-success" />
        <div>
          <p className="text-sm font-medium">Continue assim!</p>
          <p className="text-xs text-muted-foreground">
            Você está entre os top performers
          </p>
        </div>
      </div>
    </div>
  );
}
