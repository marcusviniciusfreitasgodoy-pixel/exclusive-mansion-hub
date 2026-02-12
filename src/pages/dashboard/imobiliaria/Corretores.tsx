import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Phone, Mail, CreditCard } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CorretorFormModal, type CorretorFormData } from "@/components/corretores/CorretorFormModal";

interface Corretor {
  id: string;
  nome_completo: string;
  whatsapp: string | null;
  email: string | null;
  creci: string | null;
  ativo: boolean;
  created_at: string;
}

export default function Corretores() {
  const { imobiliaria } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCorretor, setEditingCorretor] = useState<Corretor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: corretores = [], isLoading } = useQuery({
    queryKey: ["corretores", imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];
      const { data, error } = await supabase
        .from("corretores")
        .select("id, nome_completo, whatsapp, email, creci, ativo, created_at")
        .eq("imobiliaria_id", imobiliaria.id)
        .order("nome_completo");
      if (error) throw error;
      return data as Corretor[];
    },
    enabled: !!imobiliaria?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CorretorFormData) => {
      const { error } = await supabase.from("corretores").insert({
        imobiliaria_id: imobiliaria!.id,
        nome_completo: data.nome_completo,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        creci: data.creci || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Corretor adicionado!");
      queryClient.invalidateQueries({ queryKey: ["corretores"] });
      setModalOpen(false);
    },
    onError: () => toast.error("Erro ao adicionar corretor"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CorretorFormData }) => {
      const { error } = await supabase.from("corretores").update({
        nome_completo: data.nome_completo,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        creci: data.creci || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Corretor atualizado!");
      queryClient.invalidateQueries({ queryKey: ["corretores"] });
      setEditingCorretor(null);
    },
    onError: () => toast.error("Erro ao atualizar corretor"),
  });

  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("corretores").update({ ativo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["corretores"] }),
    onError: () => toast.error("Erro ao alterar status"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("corretores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Corretor removido!");
      queryClient.invalidateQueries({ queryKey: ["corretores"] });
      setDeletingId(null);
    },
    onError: () => toast.error("Erro ao remover corretor"),
  });

  const handleEdit = (c: Corretor) => {
    setEditingCorretor(c);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Corretores</h1>
            <p className="text-muted-foreground">Gerencie os corretores da sua imobiliária.</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Corretor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Corretores Cadastrados ({corretores.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Carregando...</p>
            ) : corretores.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum corretor cadastrado. Clique em "Adicionar Corretor" para começar.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>CRECI</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {corretores.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nome_completo}</TableCell>
                      <TableCell>
                        {c.whatsapp ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" /> {c.whatsapp}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {c.email ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" /> {c.email}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {c.creci ? (
                          <span className="flex items-center gap-1 text-sm">
                            <CreditCard className="h-3 w-3" /> {c.creci}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={c.ativo}
                            onCheckedChange={(checked) =>
                              toggleAtivoMutation.mutate({ id: c.id, ativo: checked })
                            }
                          />
                          <Badge variant={c.ativo ? "default" : "secondary"}>
                            {c.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeletingId(c.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <CorretorFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit Modal */}
      <CorretorFormModal
        open={!!editingCorretor}
        onOpenChange={(open) => { if (!open) setEditingCorretor(null); }}
        onSubmit={(data) => editingCorretor && updateMutation.mutate({ id: editingCorretor.id, data })}
        defaultValues={
          editingCorretor
            ? {
                nome_completo: editingCorretor.nome_completo,
                whatsapp: editingCorretor.whatsapp || "",
                email: editingCorretor.email || "",
                creci: editingCorretor.creci || "",
              }
            : undefined
        }
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover corretor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O corretor será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && deleteMutation.mutate(deletingId)}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
