import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Setup() {
  const { supabaseUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [promoting, setPromoting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handlePromoteToAdmin = async () => {
    if (!supabaseUser) return;
    
    setPromoting(true);
    
    const { data, error } = await supabase.rpc('promote_to_admin', {
      target_user_id: supabaseUser.id
    });

    if (error) {
      toast.error('Erro ao promover para admin', {
        description: error.message,
      });
    } else if (data === true) {
      setSuccess(true);
      toast.success('Você agora é administrador!');
      // Full page reload to update auth context with new role
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    } else {
      toast.error('Já existe um administrador', {
        description: 'Peça a um admin existente para promovê-lo.',
      });
    }
    
    setPromoting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Configuração Concluída!</h1>
          <p className="text-muted-foreground">Redirecionando para o painel admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
          <GraduationCap className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">
          Configuração Inicial
        </h1>
        <p className="text-muted-foreground mb-8">
          Configure o primeiro administrador da plataforma
        </p>

        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-semibold mb-2">Tornar-se Administrador</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Como primeiro usuário, você pode se tornar o administrador da plataforma.
          </p>
          <Button
            variant="gradient"
            className="w-full"
            onClick={handlePromoteToAdmin}
            disabled={promoting}
          >
            {promoting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Promovendo...
              </>
            ) : (
              'Tornar-me Administrador'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
