import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, Mail, Phone, Building2, Palette, Loader2, CreditCard, ImageIcon } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogoUpload } from "@/components/dashboard/LogoUpload";

const configSchema = z.object({
  nome_empresa: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  creci: z.string().min(3, "CRECI inválido").max(20),
  email_contato: z.string().email("E-mail inválido").max(255).optional().or(z.literal("")),
  telefone: z.string().max(20).optional().or(z.literal("")),
  cor_primaria: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;

export default function ConfiguracoesImobiliaria() {
  const { imobiliaria, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      nome_empresa: "",
      creci: "",
      email_contato: "",
      telefone: "",
      cor_primaria: "#1e3a5f",
    },
  });

  useEffect(() => {
    if (imobiliaria) {
      form.reset({
        nome_empresa: imobiliaria.nome_empresa || "",
        creci: imobiliaria.creci || "",
        email_contato: imobiliaria.email_contato || "",
        telefone: imobiliaria.telefone || "",
        cor_primaria: imobiliaria.cor_primaria || "#1e3a5f",
      });
      setLogoUrl(imobiliaria.logo_url || null);
    }
  }, [imobiliaria, form]);

  const onSubmit = async (data: ConfigFormData) => {
    if (!imobiliaria?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("imobiliarias")
        .update({
          nome_empresa: data.nome_empresa,
          creci: data.creci,
          email_contato: data.email_contato || null,
          telefone: data.telefone || null,
          cor_primaria: data.cor_primaria || "#1e3a5f",
          logo_url: logoUrl,
        })
        .eq("id", imobiliaria.id);

      if (error) throw error;

      toast.success("Configurações salvas com sucesso!");
      
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as informações de contato e personalização da sua imobiliária.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Logo da Imobiliária
                </CardTitle>
                <CardDescription>
                  O logo será exibido nas páginas white-label dos imóveis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imobiliaria?.id && (
                  <LogoUpload
                    currentLogoUrl={logoUrl}
                    onLogoChange={setLogoUrl}
                    folder="imobiliarias"
                    entityId={imobiliaria.id}
                  />
                )}
              </CardContent>
            </Card>

            {/* Informações da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações da Imobiliária
                </CardTitle>
                <CardDescription>
                  Dados básicos da sua imobiliária.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome_empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Imobiliária</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome da imobiliária" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creci"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRECI</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} placeholder="CRECI-RJ 12345" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Informações de Contato
                </CardTitle>
                <CardDescription>
                  Estes dados serão usados para receber notificações de leads e agendamentos de visitas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email_contato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail de Contato</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="email" placeholder="contato@imobiliaria.com.br" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        E-mail para receber notificações de novos leads e solicitações de visita.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone / WhatsApp</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} placeholder="5521999999999" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Número com DDD para contato via WhatsApp (sem espaços ou caracteres especiais).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Personalização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Personalização Visual
                </CardTitle>
                <CardDescription>
                  Cor da sua marca para personalizar suas páginas white-label.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="cor_primaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor Primária</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            {...field}
                            className="w-14 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="#1e3a5f"
                            className="flex-1 font-mono max-w-[150px]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-4 p-4 rounded-lg border bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-3">Pré-visualização:</p>
                  <div
                    className="w-24 h-12 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: form.watch("cor_primaria") || "#1e3a5f" }}
                  >
                    Primária
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving} size="lg">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
