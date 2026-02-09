import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, Mail, Phone, Building2, Palette, Loader2, ImageIcon, Instagram, Globe } from "lucide-react";

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
import { FaviconUpload } from "@/components/dashboard/FaviconUpload";
import { DomainConfigCard } from "@/components/dashboard/DomainConfigCard";

const configSchema = z.object({
  nome_empresa: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email_contato: z.string().email("E-mail inválido").max(255).optional().or(z.literal("")),
  telefone: z.string().max(20).optional().or(z.literal("")),
  cor_primaria: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional(),
  cor_secundaria: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional(),
  instagram_url: z.string().url("URL inválida").max(255).optional().or(z.literal("")),
  site_url: z.string().url("URL inválida").max(255).optional().or(z.literal("")),
});

type ConfigFormData = z.infer<typeof configSchema>;

export default function ConfiguracoesConstrutora() {
  const { construtora, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      nome_empresa: "",
      email_contato: "",
      telefone: "",
      cor_primaria: "#1e3a5f",
      cor_secundaria: "#b8860b",
      instagram_url: "",
      site_url: "",
    },
  });

  useEffect(() => {
    if (construtora) {
      form.reset({
        nome_empresa: construtora.nome_empresa || "",
        email_contato: construtora.email_contato || "",
        telefone: construtora.telefone || "",
        cor_primaria: construtora.cor_primaria || "#1e3a5f",
        cor_secundaria: construtora.cor_secundaria || "#b8860b",
        instagram_url: (construtora as any).instagram_url || "",
        site_url: (construtora as any).site_url || "",
      });
      setLogoUrl(construtora.logo_url || null);
      setFaviconUrl((construtora as any).favicon_url || null);
    }
  }, [construtora, form]);

  const onSubmit = async (data: ConfigFormData) => {
    if (!construtora?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("construtoras")
        .update({
          nome_empresa: data.nome_empresa,
          email_contato: data.email_contato || null,
          telefone: data.telefone || null,
          cor_primaria: data.cor_primaria || "#1e3a5f",
          cor_secundaria: data.cor_secundaria || "#b8860b",
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          instagram_url: data.instagram_url || null,
          site_url: data.site_url || null,
        })
        .eq("id", construtora.id);

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
            Gerencie as informações de contato e personalização da sua empresa.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Logo da Empresa
                </CardTitle>
                <CardDescription>
                  O logo será exibido nas páginas de imóveis e relatórios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {construtora?.id && (
                  <LogoUpload
                    currentLogoUrl={logoUrl}
                    onLogoChange={setLogoUrl}
                    folder="construtoras"
                    entityId={construtora.id}
                  />
                )}
              </CardContent>
            </Card>

            {/* Favicon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Favicon
                </CardTitle>
                <CardDescription>
                  Ícone exibido na aba do navegador nas páginas do seu portfólio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {construtora?.id && (
                  <FaviconUpload
                    currentFaviconUrl={faviconUrl}
                    onFaviconChange={setFaviconUrl}
                    entityId={construtora.id}
                  />
                )}
              </CardContent>
            </Card>

            {/* Informações da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
                <CardDescription>
                  Dados básicos da sua construtora.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome_empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome da construtora" />
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
                          <Input {...field} type="email" placeholder="contato@empresa.com.br" className="pl-10" />
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

            {/* Redes Sociais e Site */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Redes Sociais e Site
                </CardTitle>
                <CardDescription>
                  Links que serão exibidos nas páginas de imóveis e no footer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="instagram_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="url" placeholder="https://instagram.com/suaempresa" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        URL completa do perfil do Instagram da construtora.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="site_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Institucional</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="url" placeholder="https://www.suaempresa.com.br" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        URL do site institucional da construtora.
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
                  Cores da sua marca para personalizar as páginas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                              className="flex-1 font-mono"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cor_secundaria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Secundária (Accent)</FormLabel>
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
                              placeholder="#b8860b"
                              className="flex-1 font-mono"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 p-4 rounded-lg border bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-3">Pré-visualização:</p>
                  <div className="flex gap-3">
                    <div
                      className="w-20 h-12 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: form.watch("cor_primaria") || "#1e3a5f" }}
                    >
                      Primária
                    </div>
                    <div
                      className="w-20 h-12 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: form.watch("cor_secundaria") || "#b8860b" }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Domínio Customizado */}
            {construtora?.id && (
              <DomainConfigCard entityType="construtora" entityId={construtora.id} />
            )}

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
