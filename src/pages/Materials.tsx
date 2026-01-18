import { useState } from 'react';
import { Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MaterialCard } from '@/components/materials/MaterialCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockMaterials } from '@/data/mockData';
import { cn } from '@/lib/utils';

const categories = ['Todos', 'Negociação', 'Prospecção', 'Documentos', 'Apresentação'];

export default function Materials() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredMaterials = mockMaterials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Todos' || material.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Materiais de Apoio
        </h1>
        <p className="text-muted-foreground">
          Recursos extras para auxiliar no seu dia a dia de vendas.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar materiais..."
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
      </div>

      {/* Materials Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filteredMaterials.map((material, index) => (
          <div
            key={material.id}
            className="animate-slide-up"
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
          >
            <MaterialCard material={material} />
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum material encontrado.</p>
        </div>
      )}
    </MainLayout>
  );
}
