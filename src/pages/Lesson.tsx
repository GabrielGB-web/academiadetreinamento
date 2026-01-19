import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Award, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useLessonById, useQuizQuestionsForLesson, verifyAnswer } from '@/hooks/useLessonById';
import { toast } from 'sonner';

interface AnswerResult {
  isCorrect: boolean;
  correctOption: number;
  explanation: string | null;
}

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { markAsCompleted, saveQuizScore, isLessonCompleted, refetch: refetchProgress } = useLessonProgress();
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ selected: number; result: AnswerResult }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentAnswerResult, setCurrentAnswerResult] = useState<AnswerResult | null>(null);

  const { data: lesson, isLoading } = useLessonById(lessonId);
  const { data: questions = [] } = useQuizQuestionsForLesson(lessonId, showQuiz);

  // Refetch progress when lesson loads
  useEffect(() => {
    if (lesson) {
      refetchProgress();
    }
  }, [lesson, refetchProgress]);

  const isCompleted = lessonId ? isLessonCompleted(lessonId) : lesson?.completed || false;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Carregando aula...</p>
        </div>
      </MainLayout>
    );
  }

  if (!lesson) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aula não encontrada.</p>
          <Link to="/cursos">
            <Button className="mt-4">Voltar aos Cursos</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const quiz = lesson.quizInfo;

  const handleMarkAsCompleted = async () => {
    if (!lessonId) return;
    
    setIsSaving(true);
    const success = await markAsCompleted(lessonId);
    setIsSaving(false);
    
    if (success) {
      toast.success('Aula marcada como concluída!', {
        description: 'Seu progresso foi salvo.',
      });
    } else {
      toast.error('Erro ao salvar progresso', {
        description: 'Tente novamente.',
      });
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
  };

  const handleConfirmAnswer = async () => {
    if (selectedAnswer === null || !questions[currentQuestion]) return;
    
    setIsVerifying(true);
    try {
      const result = await verifyAnswer(questions[currentQuestion].id, selectedAnswer);
      setCurrentAnswerResult(result);
      setIsAnswered(true);
      setAnswers([...answers, { selected: selectedAnswer, result }]);
    } catch (error) {
      toast.error('Erro ao verificar resposta');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setCurrentAnswerResult(null);
    } else {
      setShowResult(true);
      // Save quiz result
      if (lessonId && quiz) {
        const correctAnswers = answers.filter(a => a.result.isCorrect).length;
        const percentage = Math.round((correctAnswers / questions.length) * 100);
        saveQuizScore(lessonId, percentage);
      }
    }
  };

  const calculateScore = () => {
    return answers.filter(a => a.result.isCorrect).length;
  };

  const scorePercentage = questions.length > 0 ? Math.round((calculateScore() / questions.length) * 100) : 0;
  const passed = scorePercentage >= (quiz?.passingScore || 70);
  const earnedPoints = passed ? quiz?.pointsReward || 0 : 0;

  if (showResult && quiz) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-12 animate-scale-in">
          <div className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6',
            passed ? 'gradient-success' : 'bg-destructive'
          )}>
            {passed ? (
              <Award className="w-12 h-12" />
            ) : (
              <span className="text-3xl">😔</span>
            )}
          </div>
          
          <h1 className="text-3xl font-display font-bold mb-2">
            {passed ? 'Parabéns!' : 'Tente novamente'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {passed
              ? 'Você passou no teste com sucesso!'
              : 'Você não atingiu a pontuação mínima. Revise o conteúdo e tente novamente.'}
          </p>

          <div className="p-6 rounded-xl gradient-card border border-border/50 mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-display font-bold">{scorePercentage}%</p>
                <p className="text-sm text-muted-foreground">Acertos</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold">
                  {calculateScore()}/{questions.length}
                </p>
                <p className="text-sm text-muted-foreground">Questões</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-gradient-gold">
                  +{earnedPoints}
                </p>
                <p className="text-sm text-muted-foreground">Pontos</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            {!passed && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowQuiz(true);
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setSelectedAnswer(null);
                  setIsAnswered(false);
                  setCurrentAnswerResult(null);
                  setShowResult(false);
                }}
              >
                Tentar Novamente
              </Button>
            )}
            <Button variant="gradient" onClick={() => navigate(`/cursos/${lesson.courseId}`)}>
              Voltar ao Curso
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (showQuiz && quiz && questions.length > 0) {
    const question = questions[currentQuestion];
    const isCorrect = currentAnswerResult?.isCorrect || false;

    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Questão {currentQuestion + 1} de {questions.length}
              </span>
              <span className="font-medium">
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="p-6 rounded-xl gradient-card border border-border/50 mb-6 animate-slide-up">
            <h2 className="text-xl font-display font-semibold mb-6">
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const showCorrect = isAnswered && currentAnswerResult && index === currentAnswerResult.correctOption;
                const showWrong = isAnswered && isSelected && currentAnswerResult && index !== currentAnswerResult.correctOption;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered || isVerifying}
                    className={cn(
                      'w-full p-4 rounded-lg border text-left transition-all',
                      isSelected && !isAnswered && 'border-primary bg-primary/10',
                      showCorrect && 'border-success bg-success/10',
                      showWrong && 'border-destructive bg-destructive/10',
                      !isSelected && !showCorrect && !showWrong && 'border-border hover:border-primary/50 hover:bg-secondary/50',
                      (isAnswered || isVerifying) && 'cursor-default'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm',
                        isSelected && !isAnswered && 'gradient-primary text-primary-foreground',
                        showCorrect && 'gradient-success',
                        showWrong && 'bg-destructive',
                        !isSelected && !showCorrect && !showWrong && 'bg-secondary'
                      )}>
                        {showCorrect ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {isAnswered && currentAnswerResult && (currentAnswerResult.explanation || question.explanation) && (
              <div className={cn(
                'mt-6 p-4 rounded-lg',
                isCorrect ? 'bg-success/10 border border-success/30' : 'bg-destructive/10 border border-destructive/30'
              )}>
                <p className="text-sm font-medium mb-1">
                  {isCorrect ? '✓ Correto!' : '✗ Incorreto'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentAnswerResult.explanation || question.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            {!isAnswered ? (
              <Button
                variant="gradient"
                size="lg"
                disabled={selectedAnswer === null || isVerifying}
                onClick={handleConfirmAnswer}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Confirmar Resposta'
                )}
              </Button>
            ) : (
              <Button variant="gradient" size="lg" onClick={handleNextQuestion}>
                {currentQuestion < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show message if quiz has no questions
  if (showQuiz && quiz && questions.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Quiz em construção</h2>
          <p className="text-muted-foreground mb-6">
            Este quiz ainda não possui questões. Por favor, volte mais tarde.
          </p>
          <Button variant="gradient" onClick={() => setShowQuiz(false)}>
            Voltar à Aula
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <Link
        to={`/cursos/${lesson.courseId}`}
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Curso
      </Link>

      <div className="max-w-4xl mx-auto">
        {/* Video */}
        {lesson.videoUrl ? (
          <div className="aspect-video rounded-xl overflow-hidden bg-card mb-6 animate-slide-up">
            <iframe
              src={lesson.videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video rounded-xl overflow-hidden bg-card mb-6 animate-slide-up flex items-center justify-center">
            <p className="text-muted-foreground">Vídeo não disponível</p>
          </div>
        )}

        {/* Lesson Info */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold mb-2">
                {lesson.title}
              </h1>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>
            <Badge variant="outline">{lesson.duration}</Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {isCompleted ? (
            <Button variant="outline" size="lg" disabled className="text-success border-success">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Aula Concluída
            </Button>
          ) : (
            <Button 
              variant="success" 
              size="lg" 
              onClick={handleMarkAsCompleted}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Marcar como Concluída
                </>
              )}
            </Button>
          )}
          
          {quiz && (
            <Button variant="gradient" size="lg" onClick={() => setShowQuiz(true)}>
              <Award className="w-5 h-5 mr-2" />
              Iniciar Prova ({quiz.pointsReward} pontos)
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
