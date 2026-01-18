import { FileText, Video, Link as LinkIcon, File, Download } from 'lucide-react';
import { Material } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MaterialCardProps {
  material: Material;
}

const typeIcons = {
  pdf: FileText,
  video: Video,
  link: LinkIcon,
  document: File,
};

const typeLabels = {
  pdf: 'PDF',
  video: 'Vídeo',
  link: 'Link',
  document: 'Documento',
};

export function MaterialCard({ material }: MaterialCardProps) {
  const Icon = typeIcons[material.type];

  return (
    <div className="p-5 rounded-xl gradient-card shadow-card border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg group">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold line-clamp-1">{material.title}</h3>
            <Badge variant="outline" className="shrink-0">
              {typeLabels[material.type]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {material.description}
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{material.category}</Badge>
            <Button size="sm" variant="ghost" className="text-primary">
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
