import { useState } from 'react';
import { 
  Plus, 
  BookOpen, 
  FileText, 
  Users, 
  Settings,
  Edit,
  Trash2,
  Video,
  ClipboardList
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockCourses, mockMaterials } from '@/data/mockData';
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

export default function Admin() {
  const { isAdmin } = useAuth();
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

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
          <p className="text-2xl font-bold">{mockCourses.length}</p>
          <p className="text-sm text-muted-foreground">Cursos</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <Video className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold">
            {mockCourses.reduce((acc, c) => 
              acc + c.modules.reduce((a, m) => a + m.lessons.length, 0), 0
            )}
          </p>
          <p className="text-sm text-muted-foreground">Aulas</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <FileText className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold">{mockMaterials.length}</p>
          <p className="text-sm text-muted-foreground">Materiais</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <Users className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold">15</p>
          <p className="text-sm text-muted-foreground">Vendedores</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <TabsList className="bg-card border border-border mb-6">
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
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
                    <Label htmlFor="title">Título do Curso</Label>
                    <Input id="title" placeholder="Ex: Técnicas Avançadas de Negociação" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" placeholder="Descreva o conteúdo do curso..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select>
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
                      <Label>Dificuldade</Label>
                      <Select>
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
                    <Input id="thumbnail" placeholder="https://..." />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="gradient" onClick={() => setIsAddCourseOpen(false)}>
                      Criar Curso
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Courses List */}
          <div className="space-y-4">
            {mockCourses.map((course) => (
              <div
                key={course.id}
                className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-24 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {course.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline">{course.category}</Badge>
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
                    <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
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
                            <Input id="module-title" placeholder="Ex: Fundamentos" />
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsAddModuleOpen(false)}>
                              Cancelar
                            </Button>
                            <Button variant="gradient" onClick={() => setIsAddModuleOpen(false)}>
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
                              <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <Video className="w-3 h-3 mr-1" />
                                    Aula
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Adicionar Aula</DialogTitle>
                                    <DialogDescription>
                                      Configure uma nova aula com vídeo e prova opcional.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                      <Label>Título da Aula</Label>
                                      <Input placeholder="Ex: Introdução ao tema" />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Descrição</Label>
                                      <Textarea placeholder="Descreva o conteúdo..." />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>URL do Vídeo</Label>
                                      <Input placeholder="https://youtube.com/embed/..." />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Duração</Label>
                                      <Input placeholder="15:30" />
                                    </div>
                                    
                                    <div className="border-t border-border pt-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                          <ClipboardList className="w-5 h-5 text-primary" />
                                          <span className="font-medium">Prova (opcional)</span>
                                        </div>
                                        <Button size="sm" variant="outline">
                                          <Plus className="w-3 h-3 mr-1" />
                                          Adicionar Prova
                                        </Button>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        Adicione uma prova para avaliar o aprendizado do vendedor.
                                      </p>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                      <Button variant="outline" onClick={() => setIsAddLessonOpen(false)}>
                                        Cancelar
                                      </Button>
                                      <Button variant="gradient" onClick={() => setIsAddLessonOpen(false)}>
                                        Adicionar Aula
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="ghost">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
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
                    Adicione um novo material de apoio para os vendedores.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input placeholder="Ex: Guia de Objeções" />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea placeholder="Descreva o material..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select>
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
                      <Label>Categoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="negociacao">Negociação</SelectItem>
                          <SelectItem value="prospeccao">Prospecção</SelectItem>
                          <SelectItem value="documentos">Documentos</SelectItem>
                          <SelectItem value="apresentacao">Apresentação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>URL do Arquivo</Label>
                    <Input placeholder="https://..." />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddMaterialOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="gradient" onClick={() => setIsAddMaterialOpen(false)}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Materials List */}
          <div className="grid sm:grid-cols-2 gap-4">
            {mockMaterials.map((material) => (
              <div
                key={material.id}
                className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium">{material.title}</h3>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {material.description}
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">{material.type.toUpperCase()}</Badge>
                  <Badge variant="secondary">{material.category}</Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
