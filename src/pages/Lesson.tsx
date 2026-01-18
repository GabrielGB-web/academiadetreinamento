import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Award } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockCourses } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Lesson as LessonType, Question } from '@/types';

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  // Find lesson in courses
  let lesson: LessonType | undefined;
  let course = mockCourses.find((c) =>
    c.modules.some((m) =>
      m.lessons.some((l) => {
        if (l.id === lessonId) {
          lesson = l;
          return true;
        }
        return false;
      })
    )
  );

  if (!lesson || !course) {
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

  const quiz = lesson.quiz;
  const questions = quiz?.questions || [];

  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);
    setAnswers([...answers, selectedAnswer]);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    return questions.reduce((acc, q, i) => {
      return acc + (answers[i] === q.correctOption ? 1 : 0);
    }, 0);
  };

  const scorePercentage = Math.round((calculateScore() / questions.length) * 100);
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
                  setShowResult(false);
                }}
              >
                Tentar Novamente
              </Button>
            )}
            <Button variant="gradient" onClick={() => navigate(`/cursos/${course?.id}`)}>
              Voltar ao Curso
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (showQuiz && quiz) {
    const question = questions[currentQuestion];
    const isCorrect = isAnswered && selectedAnswer === question.correctOption;

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
                const showCorrect = isAnswered && index === question.correctOption;
                const showWrong = isAnswered && isSelected && index !== question.correctOption;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={cn(
                      'w-full p-4 rounded-lg border text-left transition-all',
                      isSelected && !isAnswered && 'border-primary bg-primary/10',
                      showCorrect && 'border-success bg-success/10',
                      showWrong && 'border-destructive bg-destructive/10',
                      !isSelected && !showCorrect && !showWrong && 'border-border hover:border-primary/50 hover:bg-secondary/50',
                      isAnswered && 'cursor-default'
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

            {isAnswered && question.explanation && (
              <div className={cn(
                'mt-6 p-4 rounded-lg',
                isCorrect ? 'bg-success/10 border border-success/30' : 'bg-destructive/10 border border-destructive/30'
              )}>
                <p className="text-sm font-medium mb-1">
                  {isCorrect ? '✓ Correto!' : '✗ Incorreto'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {question.explanation}
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
                disabled={selectedAnswer === null}
                onClick={handleConfirmAnswer}
              >
                Confirmar Resposta
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

  return (
    <MainLayout>
      {/* Header */}
      <Link
        to={`/cursos/${course.id}`}
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Curso
      </Link>

      <div className="max-w-4xl mx-auto">
        {/* Video */}
        <div className="aspect-video rounded-xl overflow-hidden bg-card mb-6 animate-slide-up">
          <iframe
            src={lesson.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

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
          <Button variant="success" size="lg">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Marcar como Concluída
          </Button>
          
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
