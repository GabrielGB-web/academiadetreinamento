import { useState } from 'react';
import { Plus, HelpCircle, Trash2, Loader2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import {
  useQuizzes,
  useCreateQuiz,
  useDeleteQuiz,
  useCreateQuestion,
  useDeleteQuestion,
  type QuizWithQuestions,
} from '@/hooks/useQuizzes';

interface QuizManagerProps {
  lessonId: string;
  lessonTitle: string;
}

export function QuizManager({ lessonId, lessonTitle }: QuizManagerProps) {
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', passing_score: '70', points_reward: '100' });
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_option: 0,
    explanation: '',
  });

  const { data: quizzes = [] } = useQuizzes();
  const createQuiz = useCreateQuiz();
  const deleteQuiz = useDeleteQuiz();
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const lessonQuiz = quizzes.find((q) => q.lesson_id === lessonId);

  const handleCreateQuiz = async () => {
    if (!quizForm.title) {
      toast.error('Preencha o título do quiz');
      return;
    }

    try {
      await createQuiz.mutateAsync({
        lesson_id: lessonId,
        title: quizForm.title,
        passing_score: parseInt(quizForm.passing_score) || 70,
        points_reward: parseInt(quizForm.points_reward) || 100,
      });
      toast.success('Quiz criado com sucesso!');
      setIsAddQuizOpen(false);
      setQuizForm({ title: '', passing_score: '70', points_reward: '100' });
    } catch (error) {
      toast.error('Erro ao criar quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Tem certeza que deseja excluir este quiz e todas as suas questões?')) return;

    try {
      await deleteQuiz.mutateAsync(quizId);
      toast.success('Quiz excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir quiz');
    }
  };

  const handleCreateQuestion = async (quizId: string) => {
    if (!questionForm.question_text || !questionForm.option1 || !questionForm.option2) {
      toast.error('Preencha a pergunta e pelo menos 2 opções');
      return;
    }

    const options = [
      questionForm.option1,
      questionForm.option2,
      questionForm.option3,
      questionForm.option4,
    ].filter(Boolean);

    if (questionForm.correct_option >= options.length) {
      toast.error('Selecione uma opção correta válida');
      return;
    }

    try {
      await createQuestion.mutateAsync({
        quiz_id: quizId,
        question_text: questionForm.question_text,
        options,
        correct_option: questionForm.correct_option,
        explanation: questionForm.explanation || undefined,
      });
      toast.success('Questão criada com sucesso!');
      setIsAddQuestionOpen(false);
      setQuestionForm({
        question_text: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: 0,
        explanation: '',
      });
    } catch (error) {
      toast.error('Erro ao criar questão');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) return;

    try {
      await deleteQuestion.mutateAsync(questionId);
      toast.success('Questão excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir questão');
    }
  };

  if (!lessonQuiz) {
    return (
      <Dialog open={isAddQuizOpen} onOpenChange={setIsAddQuizOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="text-xs">
            <HelpCircle className="w-3 h-3 mr-1" />
            Criar Quiz
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Quiz</DialogTitle>
            <DialogDescription>
              Adicione um quiz para a aula: {lessonTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Título do Quiz *</Label>
              <Input
                placeholder="Ex: Teste de conhecimento"
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nota mínima (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={quizForm.passing_score}
                  onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Pontos de recompensa</Label>
                <Input
                  type="number"
                  min="0"
                  value={quizForm.points_reward}
                  onChange={(e) => setQuizForm({ ...quizForm, points_reward: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddQuizOpen(false)}>
                Cancelar
              </Button>
              <Button variant="gradient" onClick={handleCreateQuiz} disabled={createQuiz.isPending}>
                {createQuiz.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Criar Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{lessonQuiz.title}</span>
              <Badge variant="secondary" className="text-xs">
                {lessonQuiz.questions.length} questões
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Nota mínima: {lessonQuiz.passing_score}% | Pontos: {lessonQuiz.points_reward}</span>
              <div className="flex gap-1">
                <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Questão
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Questão</DialogTitle>
                      <DialogDescription>
                        Crie uma nova questão para o quiz.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Pergunta *</Label>
                        <Textarea
                          placeholder="Digite a pergunta..."
                          value={questionForm.question_text}
                          onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>Opções de Resposta *</Label>
                        {[1, 2, 3, 4].map((num) => {
                          const key = `option${num}` as keyof typeof questionForm;
                          return (
                            <div key={num} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setQuestionForm({ ...questionForm, correct_option: num - 1 })}
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                  questionForm.correct_option === num - 1
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                {questionForm.correct_option === num - 1 ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <span className="text-xs">{num}</span>
                                )}
                              </button>
                              <Input
                                placeholder={`Opção ${num}${num > 2 ? ' (opcional)' : ' *'}`}
                                value={questionForm[key] as string}
                                onChange={(e) => setQuestionForm({ ...questionForm, [key]: e.target.value })}
                              />
                            </div>
                          );
                        })}
                        <p className="text-xs text-muted-foreground">
                          Clique no círculo para marcar a resposta correta
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Explicação (opcional)</Label>
                        <Textarea
                          placeholder="Explique por que esta é a resposta correta..."
                          value={questionForm.explanation}
                          onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsAddQuestionOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          variant="gradient"
                          onClick={() => handleCreateQuestion(lessonQuiz.id)}
                          disabled={createQuestion.isPending}
                        >
                          {createQuestion.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Adicionar Questão
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-destructive"
                  onClick={() => handleDeleteQuiz(lessonQuiz.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Questions list */}
            {lessonQuiz.questions.length > 0 ? (
              <div className="space-y-1">
                {lessonQuiz.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-start justify-between p-2 rounded bg-background/50 text-xs"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {index + 1}. {question.question_text}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {question.options.map((opt, i) => (
                          <Badge
                            key={i}
                            variant={question.correct_option === i ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {opt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                Nenhuma questão adicionada ainda.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
