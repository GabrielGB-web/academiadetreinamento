import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CourseCard } from '@/components/courses/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockCourses } from '@/data/mockData';
import { cn } from '@/lib/utils';

const categories = ['Todos', 'Vendas', 'Prospecção', 'Soft Skills', 'Tecnologia'];
const statuses = ['Todos', 'Em Andamento', 'Concluídos', 'Não Iniciados'];

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || course.category === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus === 'Em Andamento') {
      matchesStatus = (course.progress || 0) > 0 && (course.progress || 0) < 100;
    } else if (selectedStatus === 'Concluídos') {
      matchesStatus = course.progress === 100;
    } else if (selectedStatus === 'Não Iniciados') {
      matchesStatus = (course.progress || 0) === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Cursos Disponíveis
        </h1>
        <p className="text-muted-foreground">
          Explore nossa biblioteca de treinamentos e desenvolva suas habilidades.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                selectedCategory === category && 'gradient-primary border-0'
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Badge
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all hover:bg-primary/20',
                selectedStatus === status && 'bg-primary'
              )}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </Badge>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <div
            key={course.id}
            className="animate-slide-up"
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
          >
            <CourseCard course={course} />
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum curso encontrado.</p>
        </div>
      )}
    </MainLayout>
  );
}
