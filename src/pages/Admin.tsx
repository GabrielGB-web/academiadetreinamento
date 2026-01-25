import { useState } from 'react';
import { 
  Plus, 
  BookOpen, 
  FileText, 
  Users, 
  Video,
  Trash2,
  Loader2
} from 'lucide-react';
import { QuizManager } from '@/components/admin/QuizManager';
import { UserManager } from '@/components/admin/UserManager';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  useCourses,
  useCreateCourse,
  useDeleteCourse,
  useCreateModule,
  useDeleteModule,
  useCreateLesson,
  useDeleteLesson,
  useMaterials,
  useCreateMaterial,
  useDeleteMaterial,
} from '@/hooks/useCourses';

export default function Admin() {
  const { isAdmin } = useAuth();
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Form states
  const [courseForm, setCourseForm] = useState({ title: '', description: '', thumbnail: '', difficulty: '', category: '' });
  const [moduleForm, setModuleForm] = useState({ title: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', video_url: '', duration: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', type: '', url: '', category: '' });

  // Queries
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: materials = [], isLoading: materialsLoading } = useMaterials();
  const { data: users = [] } = useUsers();

  // Mutations
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const createModule = useCreateModule();
  const deleteModule = useDeleteModule();
  const createLesson = useCreateLesson();
  const deleteLesson = useDeleteLesson();
  const createMaterial = useCreateMaterial();
  const deleteMaterial = useDeleteMaterial();

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleCreateCourse = async () => {
    if (!courseForm.title || !courseForm.description || !courseForm.category || !courseForm.difficulty) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createCourse.mutateAsync(courseForm);
      toast.success('Curso criado com sucesso!');
      setIsAddCourseOpen(false);
      setCourseForm({ title: '', description: '', thumbnail: '', difficulty: '', category: '' });
    } catch (error) {
      toast.error('Erro ao criar curso');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;
    
    try {
      await deleteCourse.mutateAsync(id);
      toast.success('Curso excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir curso');
    }
  };

  const handleCreateModule = async () => {
    if (!moduleForm.title || !selectedCourseId) {
      toast.error('Preencha o título do módulo');
      return;
    }

    try {
      await createModule.mutateAsync({ course_id: selectedCourseId, title: moduleForm.title });
      toast.success('Módulo criado com sucesso!');
      setIsAddModuleOpen(false);
      setModuleForm({ title: '' });
    } catch (error) {
      toast.error('Erro ao criar módulo');
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo?')) return;
    
    try {
      await deleteModule.mutateAsync(id);
      toast.success('Módulo excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir módulo');
    }
  };

  const handleCreateLesson = async () => {
    if (!lessonForm.title || !selectedModuleId) {
      toast.error('Preencha o título da aula');
      return;
    }

    try {
      await createLesson.mutateAsync({ 
        module_id: selectedModuleId, 
        title: lessonForm.title,
        description: lessonForm.description || undefined,
        video_url: lessonForm.video_url || undefined,
        duration: lessonForm.duration || undefined,
      });
      toast.success('Aula criada com sucesso!');
      setIsAddLessonOpen(false);
      setLessonForm({ title: '', description: '', video_url: '', duration: '' });
    } catch (error) {
      toast.error('Erro ao criar aula');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return;
    
    try {
      await deleteLesson.mutateAsync(id);
      toast.success('Aula excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir aula');
    }
  };

  const handleCreateMaterial = async () => {
    if (!materialForm.title || !materialForm.type || !materialForm.url || !materialForm.category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createMaterial.mutateAsync(materialForm);
      toast.success('Material criado com sucesso!');
      setIsAddMaterialOpen(false);
      setMaterialForm({ title: '', description: '', type: '', url: '', category: '' });
    } catch (error) {
      toast.error('Erro ao criar material');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;
    
    try {
      await deleteMaterial.mutateAsync(id);
      toast.success('Material excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir material');
    }
  };

  const totalLessons = courses.reduce((acc, c) => 
    acc + c.modules.reduce((a, m) => a + m.lessons.length, 0), 0
  );

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Painel de Administração
        </h1>
        <p className="text-muted-foreground">
          Gerencie cursos, aulas e materiais da plataforma.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <BookOpen className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold">{courses.length}</p>
          <p className="text-sm text-muted-foreground">Cursos</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <Video className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold">{totalLessons}</p>
          <p className="text-sm text-muted-foreground">Aulas</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <FileText className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold">{materials.length}</p>
          <p className="text-sm text-muted-foreground">Materiais</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <Users className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-sm text-muted-foreground">Usuários</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <TabsList className="bg-card border border-border mb-6">
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Gerenciar Cursos</h2>
            <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Novo Curso</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do curso. Você poderá adicionar módulos e aulas depois.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Curso *</Label>
                    <Input 
                      id="title" 
                      placeholder="Ex: Técnicas Avançadas de Negociação" 
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Descreva o conteúdo do curso..." 
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select value={courseForm.category} onValueChange={(v) => setCourseForm({ ...courseForm, category: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="prospeccao">Prospecção</SelectItem>
                          <SelectItem value="softskills">Soft Skills</SelectItem>
                          <SelectItem value="tecnologia">Tecnologia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Dificuldade *</Label>
                      <Select value={courseForm.difficulty} onValueChange={(v) => setCourseForm({ ...courseForm, difficulty: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iniciante">Iniciante</SelectItem>
                          <SelectItem value="intermediario">Intermediário</SelectItem>
                          <SelectItem value="avancado">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">URL da Imagem de Capa</Label>
                    <Input 
                      id="thumbnail" 
                      placeholder="https://..." 
                      value={courseForm.thumbnail}
                      onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="gradient" onClick={handleCreateCourse} disabled={createCourse.isPending}>
                      {createCourse.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Criar Curso
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Loading State */}
          {coursesLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-2">Carregando cursos...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum curso cadastrado.</p>
              <p className="text-sm text-muted-foreground">Clique em "Novo Curso" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-24 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-16 rounded-lg bg-secondary flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {course.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline">{course.category}</Badge>
                        <Badge variant="secondary">{course.difficulty}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {course.modules.length} módulos • {course.modules.reduce((a, m) => a + m.lessons.length, 0)} aulas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="mt-4 pl-28">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Módulos</h4>
                      <Dialog open={isAddModuleOpen && selectedCourseId === course.id} onOpenChange={(open) => {
                        setIsAddModuleOpen(open);
                        if (open) setSelectedCourseId(course.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedCourseId(course.id)}>
                            <Plus className="w-3 h-3 mr-1" />
                            Módulo
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Módulo</DialogTitle>
                            <DialogDescription>
                              Crie um novo módulo para organizar as aulas.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="module-title">Título do Módulo</Label>
                              <Input 
                                id="module-title" 
                                placeholder="Ex: Fundamentos" 
                                value={moduleForm.title}
                                onChange={(e) => setModuleForm({ title: e.target.value })}
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline" onClick={() => setIsAddModuleOpen(false)}>
                                Cancelar
                              </Button>
                              <Button variant="gradient" onClick={handleCreateModule} disabled={createModule.isPending}>
                                {createModule.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {course.modules.length > 0 ? (
                      <div className="space-y-2">
                        {course.modules.map((module) => (
                          <div
                            key={module.id}
                            className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{module.title}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {module.lessons.length} aulas
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Dialog open={isAddLessonOpen && selectedModuleId === module.id} onOpenChange={(open) => {
                                  setIsAddLessonOpen(open);
                                  if (open) setSelectedModuleId(module.id);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedModuleId(module.id)}>
                                      <Video className="w-3 h-3 mr-1" />
                                      Aula
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Adicionar Aula</DialogTitle>
                                      <DialogDescription>
                                        Configure uma nova aula com vídeo.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                      <div className="space-y-2">
                                        <Label>Título da Aula *</Label>
                                        <Input 
                                          placeholder="Ex: Introdução ao tema" 
                                          value={lessonForm.title}
                                          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Descrição</Label>
                                        <Textarea 
                                          placeholder="Descreva o conteúdo..." 
                                          value={lessonForm.description}
                                          onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>URL do Vídeo</Label>
                                        <Input 
                                          placeholder="https://youtube.com/embed/..." 
                                          value={lessonForm.video_url}
                                          onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Duração</Label>
                                        <Input 
                                          placeholder="15:30" 
                                          value={lessonForm.duration}
                                          onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                        />
                                      </div>

                                      <div className="flex justify-end gap-2 pt-4">
                                        <Button variant="outline" onClick={() => setIsAddLessonOpen(false)}>
                                          Cancelar
                                        </Button>
                                        <Button variant="gradient" onClick={handleCreateLesson} disabled={createLesson.isPending}>
                                          {createLesson.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                          Adicionar Aula
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteModule(module.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Lessons list */}
                            {module.lessons.length > 0 && (
                              <div className="mt-2 pl-4 space-y-2">
                                {module.lessons.map((lesson) => (
                                  <div key={lesson.id} className="border-l-2 border-border/50 pl-3">
                                    <div className="flex items-center justify-between text-sm py-1">
                                      <div className="flex-1">
                                        <span className="font-medium">{lesson.title}</span>
                                        {lesson.description && (
                                          <p className="text-xs text-muted-foreground line-clamp-1">{lesson.description}</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {lesson.video_url && (
                                          <Video className="w-3 h-3 text-primary" />
                                        )}
                                        {lesson.duration && <span className="text-xs text-muted-foreground">{lesson.duration}</span>}
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <QuizManager lessonId={lesson.id} lessonTitle={lesson.title} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhum módulo adicionado ainda.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Gerenciar Materiais</h2>
            <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Material
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Material</DialogTitle>
                  <DialogDescription>
                    Adicione um novo material de apoio para os usuários.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input 
                      placeholder="Ex: Guia de Objeções" 
                      value={materialForm.title}
                      onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea 
                      placeholder="Descreva o material..." 
                      value={materialForm.description}
                      onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select value={materialForm.type} onValueChange={(v) => setMaterialForm({ ...materialForm, type: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="video">Vídeo</SelectItem>
                          <SelectItem value="document">Documento</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select value={materialForm.category} onValueChange={(v) => setMaterialForm({ ...materialForm, category: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="scripts">Scripts</SelectItem>
                          <SelectItem value="processos">Processos</SelectItem>
                          <SelectItem value="ferramentas">Ferramentas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>URL do Arquivo *</Label>
                    <Input 
                      placeholder="https://..." 
                      value={materialForm.url}
                      onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddMaterialOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="gradient" onClick={handleCreateMaterial} disabled={createMaterial.isPending}>
                      {createMaterial.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Adicionar Material
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Materials List */}
          {materialsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-2">Carregando materiais...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum material cadastrado.</p>
              <p className="text-sm text-muted-foreground">Clique em "Novo Material" para começar.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-medium">{material.title}</h3>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteMaterial(material.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {material.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{material.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{material.type.toUpperCase()}</Badge>
                    <Badge variant="secondary">{material.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UserManager />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
