import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SignaturePad, SignaturePadRef } from "@/components/feedback/SignaturePad";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";
import {
  ArrowLeft, Save, Loader2, FileDown, Copy, CheckCircle2, Circle,
  User, MapPin, Building2, Phone, Mail, FileText, Edit, X, Link2, Share2
} from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  agendada: { label: "Agendada", className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
  confirmada: { label: "Confirmada", className: "border-green-500 text-green-700 bg-green-50" },
  realizada: { label: "Realizada", className: "border-blue-500 text-blue-700 bg-blue-50" },
  cancelada: { label: "Cancelada", className: "border-red-500 text-red-700 bg-red-50" },
};

export default function FichaVisitaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const sigVisitanteRef = useRef<SignaturePadRef>(null);
  const sigCorretorRef = useRef<SignaturePadRef>(null);

  const { data: ficha, isLoading } = useQuery({
    queryKey: ["ficha-visita", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fichas_visita")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase
        .from("fichas_visita")
        .update(updates)
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ficha-visita", id] });
      queryClient.invalidateQueries({ queryKey: ["fichas-visita"] });
      toast.success("Ficha atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar ficha"),
  });

  const handleSaveEdit = () => {
    if (Object.keys(editData).length > 0) {
      updateMutation.mutate(editData);
    }
    setIsEditing(false);
    setEditData({});
  };

  const handleStatusChange = (status: string) => {
    updateMutation.mutate({ status });
  };

  const handleSaveSignature = (tipo: "visitante" | "corretor") => {
    const ref = tipo === "visitante" ? sigVisitanteRef : sigCorretorRef;
    if (!ref.current || ref.current.isEmpty()) {
      toast.error("Desenhe a assinatura antes de salvar.");
      return;
    }
    const data = ref.current.getSignatureData();
    const field = tipo === "visitante" ? "assinatura_visitante" : "assinatura_corretor";
    updateMutation.mutate({ [field]: data });
  };

  const copyLink = (tipo: "visitante" | "corretor") => {
    if (!ficha) return;
    const url = `${window.location.origin}/assinatura/${ficha.codigo}/${tipo}`;
    navigator.clipboard.writeText(url);
    toast.success(`Link de assinatura do ${tipo} copiado!`);
  };

  const generatePDF = useCallback(() => {
    if (!ficha) return;
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    const addSection = (title: string) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    };

    const addLine = (label: string, value: string | null | undefined) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${label}: ${value || "—"}`, margin, y);
      y += 6;
    };

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("FICHA DE VISITA", 105, y, { align: "center" });
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Código: ${ficha.codigo}`, 105, y, { align: "center" });
    y += 6;
    doc.text(
      `Data: ${ficha.data_visita ? format(new Date(ficha.data_visita), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—"}`,
      105, y, { align: "center" }
    );
    y += 12;

    // Visitante
    addSection("1. DADOS DO VISITANTE");
    addLine("Nome", ficha.nome_visitante);
    addLine("CPF", ficha.cpf_visitante);
    addLine("RG", ficha.rg_visitante);
    addLine("Telefone", ficha.telefone_visitante);
    addLine("Email", ficha.email_visitante);
    addLine("Endereço", ficha.endereco_visitante);
    const acomp = ficha.acompanhantes as any[] | null;
    if (acomp?.length) {
      addLine("Acompanhantes", acomp.map((a: any) => `${a.nome}${a.cpf ? ` (CPF: ${a.cpf})` : ""}`).join("; "));
    }
    y += 4;

    // Imóvel
    addSection("2. DADOS DO IMÓVEL");
    addLine("Endereço", ficha.endereco_imovel);
    addLine("Condomínio/Edifício", ficha.condominio_edificio);
    addLine("Unidade", ficha.unidade_imovel);
    addLine("Proprietário", ficha.nome_proprietario);
    addLine("Valor", ficha.valor_imovel ? `R$ ${Number(ficha.valor_imovel).toLocaleString("pt-BR")}` : null);
    y += 4;

    // Intermediação
    addSection("3. INTERMEDIAÇÃO");
    addLine("Corretor", ficha.corretor_nome);
    addLine("Status", ficha.status);
    addLine("Notas", ficha.notas);
    addLine("Aceita ofertas similares (LGPD)", ficha.aceita_ofertas_similares ? "Sim" : "Não");
    y += 8;

    // Assinaturas
    addSection("4. ASSINATURAS");
    if (ficha.assinatura_visitante) {
      doc.text("Assinatura do Visitante:", margin, y); y += 4;
      try { doc.addImage(ficha.assinatura_visitante, "PNG", margin, y, 80, 30); } catch { /* skip */ }
      y += 35;
    } else {
      addLine("Assinatura do Visitante", "Pendente");
    }
    if (ficha.assinatura_corretor) {
      doc.text("Assinatura do Corretor:", margin, y); y += 4;
      try { doc.addImage(ficha.assinatura_corretor, "PNG", margin, y, 80, 30); } catch { /* skip */ }
      y += 35;
    } else {
      addLine("Assinatura do Corretor", "Pendente");
    }

    // Footer
    if (y > 270) { doc.addPage(); y = 20; }
    y += 8;
    doc.setFontSize(8);
    doc.text(`Documento gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")} — Lei 6.530/78`, 105, 285, { align: "center" });

    doc.save(`ficha-${ficha.codigo}.pdf`);
    toast.success("PDF exportado com sucesso!");
  }, [ficha]);

  if (isLoading) {
    return (
      <DashboardLayout title="Ficha de Visita">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ficha) {
    return (
      <DashboardLayout title="Ficha de Visita">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Ficha não encontrada.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const SignatureIndicator = ({ signed }: { signed: boolean }) =>
    signed ? (
      <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle2 className="h-4 w-4" /> Assinado</span>
    ) : (
      <span className="flex items-center gap-1 text-muted-foreground text-sm"><Circle className="h-4 w-4" /> Pendente</span>
    );

  return (
    <DashboardLayout title="Ficha de Visita">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Ficha {ficha.codigo}</h1>
              <p className="text-sm text-muted-foreground">
                {ficha.data_visita ? format(new Date(ficha.data_visita), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "Sem data"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={ficha.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={generatePDF}>
              <FileDown className="h-4 w-4 mr-1" /> PDF
            </Button>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-1" /> Editar
              </Button>
            ) : (
              <>
                <Button size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-1" /> Salvar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditData({}); }}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Visitante */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Dados do Visitante</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <InfoField label="Nome" value={ficha.nome_visitante} field="nome_visitante" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <InfoField label="CPF" value={ficha.cpf_visitante} field="cpf_visitante" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <InfoField label="RG" value={ficha.rg_visitante} field="rg_visitante" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <InfoField label="Telefone" value={ficha.telefone_visitante} field="telefone_visitante" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <InfoField label="Email" value={ficha.email_visitante} field="email_visitante" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <InfoField label="Endereço" value={ficha.endereco_visitante} field="endereco_visitante" isEditing={isEditing} editData={editData} setEditData={setEditData} />
          </CardContent>
        </Card>

        {/* Imóvel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Dados do Imóvel</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <InfoField label="Endereço" value={ficha.endereco_imovel} field="endereco_imovel" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <InfoField label="Condomínio" value={ficha.condominio_edificio} field="condominio_edificio" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <InfoField label="Unidade" value={ficha.unidade_imovel} field="unidade_imovel" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <InfoField label="Proprietário" value={ficha.nome_proprietario} field="nome_proprietario" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <InfoField label="Valor" value={ficha.valor_imovel ? `R$ ${Number(ficha.valor_imovel).toLocaleString("pt-BR")}` : null} field="valor_imovel" isEditing={isEditing} editData={editData} setEditData={setEditData} />
          </CardContent>
        </Card>

        {/* Intermediação */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Intermediação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoField label="Corretor" value={ficha.corretor_nome} field="corretor_nome" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <div>
              <label className="text-xs text-muted-foreground font-medium">Notas</label>
              {isEditing ? (
                <Textarea
                  defaultValue={ficha.notas || ""}
                  onChange={(e) => setEditData(prev => ({ ...prev, notas: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{ficha.notas || "—"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">LGPD — Aceita ofertas similares</label>
              <p className="text-sm mt-1">{ficha.aceita_ofertas_similares ? "✅ Sim" : "❌ Não"}</p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Assinaturas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assinaturas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Visitante:</span>
                <SignatureIndicator signed={!!ficha.assinatura_visitante} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Corretor:</span>
                <SignatureIndicator signed={!!ficha.assinatura_corretor} />
              </div>
            </div>

            {/* Assinaturas existentes */}
            {ficha.assinatura_visitante && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assinatura do Visitante</p>
                <img src={ficha.assinatura_visitante} alt="Assinatura Visitante" className="border rounded h-20 bg-white" />
              </div>
            )}
            {ficha.assinatura_corretor && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assinatura do Corretor</p>
                <img src={ficha.assinatura_corretor} alt="Assinatura Corretor" className="border rounded h-20 bg-white" />
              </div>
            )}

            {/* Canvas presencial */}
            <div className="grid gap-6 md:grid-cols-2">
              {!ficha.assinatura_visitante && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Assinatura Presencial — Visitante</h4>
                  <SignaturePad ref={sigVisitanteRef} height={120} />
                  <Button size="sm" onClick={() => handleSaveSignature("visitante")} disabled={updateMutation.isPending}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Salvar Assinatura
                  </Button>
                </div>
              )}
              {!ficha.assinatura_corretor && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Assinatura Presencial — Corretor</h4>
                  <SignaturePad ref={sigCorretorRef} height={120} />
                  <Button size="sm" onClick={() => handleSaveSignature("corretor")} disabled={updateMutation.isPending}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Salvar Assinatura
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Links remotos */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Share2 className="h-4 w-4" /> Links de Assinatura Remota</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/assinatura/${ficha.codigo}/visitante`} className="text-xs" />
                  <Button variant="outline" size="icon" onClick={() => copyLink("visitante")} title="Copiar link visitante">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/assinatura/${ficha.codigo}/corretor`} className="text-xs" />
                  <Button variant="outline" size="icon" onClick={() => copyLink("corretor")} title="Copiar link corretor">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Compartilhe estes links via WhatsApp para assinatura remota.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Componente auxiliar de campo editável
function InfoField({
  label, value, field, isEditing, editData, setEditData
}: {
  label: string;
  value: string | null | undefined;
  field: string;
  isEditing: boolean;
  editData: Record<string, any>;
  setEditData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      {isEditing ? (
        <Input
          defaultValue={value || ""}
          onChange={(e) => setEditData(prev => ({ ...prev, [field]: e.target.value }))}
          className="mt-1"
        />
      ) : (
        <p className="text-sm mt-1">{value || "—"}</p>
      )}
    </div>
  );
}
