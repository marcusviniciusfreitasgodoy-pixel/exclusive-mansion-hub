import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, Plus, Pencil, Trash2, FileText, Loader2, 
  Brain, BookOpen, AlertCircle, Check, X, Sparkles
} from 'lucide-react';
import type { 
  KnowledgeBaseEntry, 
  KnowledgeBaseCategory, 
  KnowledgeBaseFormData,
  CATEGORY_LABELS,
  CATEGORY_COLORS 
} from '@/types/knowledge-base';

const CATEGORIES: { value: KnowledgeBaseCategory; label: string }[] = [
  { value: 'FAQ', label: 'FAQ' },
  { value: 'Especificacao', label: 'Especificação' },
  { value: 'Financiamento', label: 'Financiamento' },
  { value: 'Documentacao', label: 'Documentação' },
  { value: 'Outros', label: 'Outros' },
];

const CATEGORY_BADGE_COLORS: Record<KnowledgeBaseCategory, string> = {
  FAQ: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Especificacao: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Financiamento: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Documentacao: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Outros: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

interface Step4KnowledgeBaseProps {
  imovelId?: string;
  entries: KnowledgeBaseEntry[];
  onEntriesChange: (entries: KnowledgeBaseEntry[]) => void;
  isEditing?: boolean;
}

export function Step4KnowledgeBase({ 
  imovelId, 
  entries, 
  onEntriesChange,
  isEditing = false 
}: Step4KnowledgeBaseProps) {
  const { toast } = useToast();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [processingProgress, setProcessingProgress] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [formData, setFormData] = useState<KnowledgeBaseFormData>({
    categoria: 'FAQ',
    titulo: '',
    conteudo: '',
    tags: [],
  });

  // Handle PDF upload and AI extraction
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast({
        title: 'Tipo inválido',
        description: 'Por favor, envie apenas arquivos PDF.',
        variant: 'destructive',
      });
      return;
    }

    // Max 20MB
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 20MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingPdf(true);
    setProcessingProgress('Fazendo upload do PDF...');

    try {
      // Upload PDF to storage
      const fileName = `kb-${Date.now()}-${file.name}`;
      const filePath = `knowledge-base/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imoveis')
        .upload(filePath, file, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('imoveis')
        .getPublicUrl(filePath);

      setProcessingProgress('Extraindo informações com IA...');

      // Call edge function to process PDF
      const { data, error } = await supabase.functions.invoke('process-knowledge-pdf', {
        body: {
          pdf_url: urlData.publicUrl,
          imovel_id: imovelId,
          file_name: file.name,
        },
      });

      if (error) throw error;

      if (data?.entries && data.entries.length > 0) {
        // Add new entries
        const newEntries: KnowledgeBaseEntry[] = data.entries.map((entry: any, idx: number) => ({
          id: `temp-${Date.now()}-${idx}`,
          imovel_id: imovelId || '',
          categoria: entry.categoria as KnowledgeBaseCategory,
          titulo: entry.titulo,
          conteudo: entry.conteudo,
          fonte_tipo: 'pdf_extraido' as const,
          fonte_arquivo_url: urlData.publicUrl,
          fonte_arquivo_nome: file.name,
          tags: entry.tags || [],
          ativo: true,
          prioridade: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        onEntriesChange([...entries, ...newEntries]);

        toast({
          title: '✨ Extração concluída',
          description: `${newEntries.length} entrada(s) extraída(s) do PDF.`,
        });
      } else {
        toast({
          title: 'Nenhuma informação encontrada',
          description: 'A IA não conseguiu extrair informações relevantes do PDF.',
        });
      }
    } catch (error: any) {
      console.error('PDF processing error:', error);
      toast({
        title: 'Erro no processamento',
        description: error.message || 'Falha ao processar o PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingPdf(false);
      setProcessingProgress('');
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({ categoria: 'FAQ', titulo: '', conteudo: '', tags: [] });
    setEditingEntry(null);
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (entry: KnowledgeBaseEntry) => {
    setFormData({
      categoria: entry.categoria,
      titulo: entry.titulo,
      conteudo: entry.conteudo,
      tags: entry.tags,
    });
    setEditingEntry(entry);
    setIsAddModalOpen(true);
  };

  // Save entry (add or update)
  const handleSaveEntry = async () => {
    if (!formData.titulo.trim() || !formData.conteudo.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o título e o conteúdo.',
        variant: 'destructive',
      });
      return;
    }

    if (editingEntry) {
      // Update existing entry
      const updatedEntries = entries.map(e => 
        e.id === editingEntry.id 
          ? { 
              ...e, 
              ...formData, 
              updated_at: new Date().toISOString() 
            } 
          : e
      );
      onEntriesChange(updatedEntries);
      toast({ title: 'Entrada atualizada' });
    } else {
      // Add new entry
      const newEntry: KnowledgeBaseEntry = {
        id: `temp-${Date.now()}`,
        imovel_id: imovelId || '',
        categoria: formData.categoria,
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        fonte_tipo: 'manual',
        tags: formData.tags || [],
        ativo: true,
        prioridade: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onEntriesChange([...entries, newEntry]);
      toast({ title: 'Entrada adicionada' });
    }

    setIsAddModalOpen(false);
    setEditingEntry(null);
  };

  // Delete entry
  const handleDeleteEntry = (entryId: string) => {
    onEntriesChange(entries.filter(e => e.id !== entryId));
    toast({ title: 'Entrada removida' });
  };

  // Toggle entry active status
  const handleToggleActive = (entryId: string) => {
    const updatedEntries = entries.map(e => 
      e.id === entryId ? { ...e, ativo: !e.ativo } : e
    );
    onEntriesChange(updatedEntries);
  };

  const activeCount = entries.filter(e => e.ativo).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Base de Conhecimento da IA</CardTitle>
          </div>
          <CardDescription>
            Informações que a Sofia usará para responder perguntas sobre este imóvel.
            Faça upload de PDFs para extração automática ou adicione entradas manualmente.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => pdfInputRef.current?.click()}
          disabled={isProcessingPdf}
          className="gap-2"
        >
          {isProcessingPdf ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {processingProgress || 'Processando...'}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Upload PDF + Extração IA
            </>
          )}
        </Button>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Manual
        </Button>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-muted-foreground mb-1">
              Nenhuma entrada na base de conhecimento
            </h3>
            <p className="text-sm text-muted-foreground">
              Faça upload de um PDF ou adicione entradas manualmente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{entries.length} entrada(s) • {activeCount} ativa(s)</span>
          </div>
          
          {entries.map((entry) => (
            <Card 
              key={entry.id} 
              className={`transition-opacity ${!entry.ativo ? 'opacity-50' : ''}`}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={CATEGORY_BADGE_COLORS[entry.categoria]}>
                        {entry.categoria}
                      </Badge>
                      {entry.fonte_tipo === 'pdf_extraido' && (
                        <Badge variant="outline" className="gap-1">
                          <FileText className="h-3 w-3" />
                          PDF
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium mb-1 truncate">{entry.titulo}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.conteudo}
                    </p>
                    {entry.fonte_arquivo_nome && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Fonte: {entry.fonte_arquivo_nome}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${entry.id}`} className="text-xs text-muted-foreground">
                        Ativo
                      </Label>
                      <Switch
                        id={`active-${entry.id}`}
                        checked={entry.ativo}
                        onCheckedChange={() => handleToggleActive(entry.id)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(entry)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Editar Entrada' : 'Nova Entrada'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(v) => setFormData({ ...formData, categoria: v as KnowledgeBaseCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Título *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Qual a metragem do apartamento?"
              />
            </div>

            <div>
              <Label>Conteúdo *</Label>
              <Textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                placeholder="Resposta detalhada que a IA irá usar..."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEntry}>
              {editingEntry ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
