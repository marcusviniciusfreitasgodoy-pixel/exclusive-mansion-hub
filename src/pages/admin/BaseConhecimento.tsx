import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, Database, BookOpen, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Developer email - only this user can access this page
const DEVELOPER_EMAIL = "dev@godoyrealty.com"; // Update this with your email

interface KnowledgeEntry {
  id: string;
  categoria: string;
  titulo: string;
  conteudo: string;
  tags: string[];
  ativo: boolean;
  prioridade: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIAS = [
  { value: "FAQ", label: "FAQ - Perguntas Frequentes" },
  { value: "Financiamento", label: "Financiamento" },
  { value: "Materiais", label: "Materiais e Acabamentos" },
  { value: "Processos", label: "Processos de Compra" },
  { value: "Documentacao", label: "Documentação" },
  { value: "Outros", label: "Outros" },
];

export default function BaseConhecimento() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    categoria: "FAQ",
    titulo: "",
    conteudo: "",
    tags: "",
    ativo: true,
    prioridade: 0,
  });

  // Check authorization
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Acesso negado", { description: "Você precisa estar logado." });
        navigate("/login");
        return;
      }

      // Check if user is authorized developer
      if (user.email !== DEVELOPER_EMAIL) {
        toast.error("Acesso restrito", { 
          description: "Esta página é restrita ao desenvolvedor." 
        });
        navigate("/");
        return;
      }

      setIsAuthorized(true);
      loadEntries();
    }

    checkAuth();
  }, [navigate]);

  async function loadEntries() {
    setIsLoading(true);
    try {
      // Note: This requires service role access, so we need an edge function
      // For now, we'll use a workaround with the admin API
      const { data, error } = await supabase
        .from("chatbot_knowledge_base")
        .select("*")
        .order("prioridade", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      console.error("Error loading entries:", error);
      toast.error("Erro ao carregar base de conhecimento");
    } finally {
      setIsLoading(false);
    }
  }

  function handleNew() {
    setEditingEntry(null);
    setFormData({
      categoria: "FAQ",
      titulo: "",
      conteudo: "",
      tags: "",
      ativo: true,
      prioridade: 0,
    });
    setIsDialogOpen(true);
  }

  function handleEdit(entry: KnowledgeEntry) {
    setEditingEntry(entry);
    setFormData({
      categoria: entry.categoria,
      titulo: entry.titulo,
      conteudo: entry.conteudo,
      tags: entry.tags?.join(", ") || "",
      ativo: entry.ativo,
      prioridade: entry.prioridade,
    });
    setIsDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.titulo.trim() || !formData.conteudo.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        categoria: formData.categoria,
        titulo: formData.titulo.trim(),
        conteudo: formData.conteudo.trim(),
        tags: tagsArray,
        ativo: formData.ativo,
        prioridade: formData.prioridade,
      };

      if (editingEntry) {
        const { error } = await supabase
          .from("chatbot_knowledge_base")
          .update(payload)
          .eq("id", editingEntry.id);

        if (error) throw error;
        toast.success("Entrada atualizada com sucesso");
      } else {
        const { error } = await supabase
          .from("chatbot_knowledge_base")
          .insert(payload);

        if (error) throw error;
        toast.success("Entrada criada com sucesso");
      }

      setIsDialogOpen(false);
      loadEntries();
    } catch (error: any) {
      console.error("Error saving entry:", error);
      toast.error("Erro ao salvar entrada", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from("chatbot_knowledge_base")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Entrada excluída");
      loadEntries();
    } catch (error: any) {
      console.error("Error deleting entry:", error);
      toast.error("Erro ao excluir entrada");
    }
  }

  async function handleToggleAtivo(entry: KnowledgeEntry) {
    try {
      const { error } = await supabase
        .from("chatbot_knowledge_base")
        .update({ ativo: !entry.ativo })
        .eq("id", entry.id);

      if (error) throw error;
      loadEntries();
    } catch (error: any) {
      console.error("Error toggling entry:", error);
      toast.error("Erro ao atualizar status");
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="h-6 w-6" />
              Base de Conhecimento da Sofia
            </h1>
            <p className="text-muted-foreground">
              Gerencie o conhecimento global do chatbot de IA
            </p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Entrada
          </Button>
        </div>

        {/* Warning */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Área restrita ao desenvolvedor</p>
              <p>
                As informações cadastradas aqui serão utilizadas pelo chatbot Sofia
                para responder perguntas dos clientes em todos os imóveis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Entradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{entries.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Entradas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {entries.filter((e) => e.ativo).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Set(entries.map((e) => e.categoria)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Entradas
            </CardTitle>
            <CardDescription>
              Conhecimento que a Sofia utiliza para responder perguntas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">Nenhuma entrada cadastrada</p>
                <Button onClick={handleNew} variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeira entrada
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={entry.ativo ? "default" : "secondary"}>
                          {entry.categoria}
                        </Badge>
                        {!entry.ativo && (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inativo
                          </Badge>
                        )}
                        {entry.prioridade > 0 && (
                          <Badge variant="outline">
                            Prioridade: {entry.prioridade}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium">{entry.titulo}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {entry.conteudo}
                      </p>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs bg-muted px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={entry.ativo}
                        onCheckedChange={() => handleToggleAtivo(entry)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir entrada?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A entrada será
                              removida permanentemente da base de conhecimento.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(entry.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Editar Entrada" : "Nova Entrada"}
              </DialogTitle>
              <DialogDescription>
                Adicione conhecimento que a Sofia usará para responder perguntas
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, categoria: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Input
                    id="prioridade"
                    type="number"
                    min={0}
                    max={100}
                    value={formData.prioridade}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        prioridade: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: O que é ITBI?"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, titulo: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conteudo">Conteúdo *</Label>
                <Textarea
                  id="conteudo"
                  placeholder="Resposta ou informação que a Sofia deve saber..."
                  rows={6}
                  value={formData.conteudo}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, conteudo: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  placeholder="Ex: imposto, compra, documentação"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, tags: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(v) =>
                    setFormData((p) => ({ ...p, ativo: v }))
                  }
                />
                <Label htmlFor="ativo">Entrada ativa</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingEntry ? "Salvar Alterações" : "Criar Entrada"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
