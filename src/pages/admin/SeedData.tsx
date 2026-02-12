import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, Database, Building2, Home, Users, Link, Zap } from 'lucide-react';

interface SeedResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

// --- Seed Data Constants ---
const IMOVEIS_DATA = [
  {
    titulo: 'Cobertura Duplex Frente-Mar',
    endereco: 'Av. Lúcio Costa, 2360',
    bairro: 'Barra da Tijuca',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    valor: 12000000,
    condominio: 8500,
    iptu: 12000,
    area_total: 1250,
    area_privativa: 980,
    suites: 5,
    banheiros: 7,
    vagas: 5,
    status: 'ativo' as const,
    descricao: `Uma obra-prima arquitetônica à beira-mar na prestigiada Avenida Lúcio Costa. Esta cobertura duplex exclusiva oferece 980m² de área privativa com acabamentos de altíssimo padrão.`,
    diferenciais: JSON.stringify(['Vista mar 180° panorâmica', 'Piscina privativa com borda infinita', 'Elevador privativo', 'Automação residencial completa']),
    memorial_descritivo: 'Acabamentos: Mármore Carrara, Porcelanato italiano.',
    imagens: JSON.stringify([
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', alt: 'Fachada principal' },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', alt: 'Living panorâmico' },
    ]),
    videos: JSON.stringify([]),
    tour_360_url: null,
    slug: 'cobertura-lucio-costa-godoyprime',
  },
  {
    titulo: 'Penthouse Vista Mar - Alto Padrão',
    endereco: 'Av. das Américas, 5000',
    bairro: 'Barra da Tijuca',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    valor: 8500000,
    condominio: 6500,
    iptu: 8000,
    area_total: 850,
    area_privativa: 720,
    suites: 4,
    banheiros: 5,
    vagas: 4,
    status: 'ativo' as const,
    descricao: `Penthouse de luxo com acabamentos premium e vista espetacular para o mar.`,
    diferenciais: JSON.stringify(['Vista mar frontal', 'Varanda gourmet ampla', 'Lareira ecológica']),
    memorial_descritivo: 'Piso em porcelanato polido, bancadas em granito preto.',
    imagens: JSON.stringify([
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', alt: 'Fachada' },
    ]),
    videos: JSON.stringify([]),
    tour_360_url: null,
    slug: 'penthouse-barra-godoyprime',
  },
  {
    titulo: 'Apartamento 4 Suítes - Barra Exclusive',
    endereco: 'Av. Lúcio Costa, 3000',
    bairro: 'Barra da Tijuca',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    valor: 4200000,
    condominio: 3800,
    iptu: 4500,
    area_total: 420,
    area_privativa: 380,
    suites: 4,
    banheiros: 5,
    vagas: 3,
    status: 'ativo' as const,
    descricao: `Apartamento de alto padrão com 4 suítes amplas e bem iluminadas.`,
    diferenciais: JSON.stringify(['Vista parcial mar', '4 suítes com ar-condicionado']),
    memorial_descritivo: 'Acabamentos em porcelanato, armários planejados.',
    imagens: JSON.stringify([
      { url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200', alt: 'Sala' },
    ]),
    videos: JSON.stringify([]),
    tour_360_url: null,
    slug: 'apto-luxury-barra-godoyprime',
  },
];

const LEADS_DATA = [
  { nome: 'Carlos Silva', email: 'carlos@email.com', telefone: '(21) 99888-7777', mensagem: 'Gostaria de agendar uma visita.', origem: 'formulario' as const },
  { nome: 'Ana Martins', email: 'ana.martins@empresa.com.br', telefone: '(21) 98765-4321', mensagem: 'Tenho interesse no financiamento.', origem: 'whatsapp' as const },
  { nome: 'Roberto Campos', email: 'roberto@gmail.com', telefone: null, mensagem: 'Vi o imóvel pelo site!', origem: 'formulario' as const },
  { nome: 'Mariana Costa', email: 'mariana.costa@hotmail.com', telefone: '(21) 97654-3210', mensagem: 'Aceita permuta?', origem: 'chat_ia' as const },
  { nome: 'Fernando Oliveira', email: 'fernando.oliveira@yahoo.com', telefone: '(21) 96543-2109', mensagem: 'Disponibilidade para visita?', origem: 'formulario' as const },
];

const NOTAS_CONTEUDO = [
  'Cliente demonstrou forte interesse na vista para o mar. Mencionou que já visitou 3 imóveis na região.',
  'Preferência por andar alto, acima do 15º. Não tem pressa para fechar negócio.',
  'Ligação realizada: cliente informou que está aguardando aprovação de crédito pelo banco.',
  'Visita realizada com sucesso. Cliente ficou impressionado com os acabamentos da suíte master.',
  'Cliente solicitou detalhamento do memorial descritivo e tabela de valores atualizada.',
  'Feedback pós-visita: cliente elogiou a localização mas achou o valor do condomínio alto.',
  'Reunião com cônjuge agendada para próxima semana. Decisão compartilhada.',
  'Cliente comparou com empreendimento concorrente. Destacar diferenciais na próxima conversa.',
  'Documentação do cliente em análise. CPF e comprovante de renda já enviados.',
  'Negociação em andamento: cliente propôs entrada de 30% e financiamento do restante.',
  'Cliente perguntou sobre prazo de entrega e possibilidade de personalização da planta.',
  'WhatsApp: cliente enviou fotos do imóvel atual para avaliar permuta.',
  'Corretor parceiro indicou este lead. Perfil: investidor, busca rentabilidade.',
  'Follow-up realizado. Cliente viajou e retorna na próxima semana.',
  'Proposta formal enviada por e-mail. Aguardando retorno em até 48h.',
];

const TAREFAS_TITULOS = [
  { titulo: 'Enviar memorial descritivo atualizado', descricao: 'Cliente solicitou documento detalhado dos acabamentos', prioridade: 'alta' },
  { titulo: 'Ligar para confirmar visita de sábado', descricao: 'Confirmar horário e local de encontro', prioridade: 'alta' },
  { titulo: 'Preparar comparativo de preços da região', descricao: 'Levantar valores de imóveis similares para argumentação', prioridade: 'media' },
  { titulo: 'Enviar fotos adicionais da área de lazer', descricao: 'Cliente pediu mais detalhes da piscina e academia', prioridade: 'baixa' },
  { titulo: 'Agendar segunda visita com cônjuge', descricao: 'Esposa quer conhecer o imóvel antes de decidir', prioridade: 'alta' },
  { titulo: 'Verificar disponibilidade de unidades andar alto', descricao: 'Cliente quer acima do 20º andar', prioridade: 'media' },
  { titulo: 'Solicitar simulação de financiamento', descricao: 'Banco Itaú, prazo de 30 anos, entrada de 20%', prioridade: 'alta' },
  { titulo: 'Enviar contrato para análise jurídica', descricao: 'Advogado do cliente quer revisar minuta', prioridade: 'media' },
  { titulo: 'Follow-up pós proposta enviada', descricao: 'Proposta enviada há 3 dias, verificar interesse', prioridade: 'alta' },
  { titulo: 'Atualizar CRM com informações da visita', descricao: 'Registrar feedback e próximos passos', prioridade: 'baixa' },
];

const ATIVIDADES_TIPOS = [
  { tipo: 'email', titulo: 'E-mail enviado com material do imóvel', descricao: 'Enviado book digital e tabela de preços por e-mail' },
  { tipo: 'ligacao', titulo: 'Ligação de prospecção realizada', descricao: 'Conversa de 15min. Cliente demonstrou interesse moderado' },
  { tipo: 'nota', titulo: 'Nota de acompanhamento adicionada', descricao: 'Cliente está comparando com outro empreendimento na Barra' },
  { tipo: 'visita', titulo: 'Visita ao imóvel realizada', descricao: 'Visita de 45min. Cliente veio acompanhado da esposa' },
  { tipo: 'email', titulo: 'Proposta formal enviada por e-mail', descricao: 'Proposta com condições especiais de lançamento' },
  { tipo: 'ligacao', titulo: 'Follow-up por telefone', descricao: 'Cliente pediu mais 1 semana para decidir' },
  { tipo: 'nota', titulo: 'Atualização de status do lead', descricao: 'Lead qualificado: possui renda compatível e urgência moderada' },
  { tipo: 'whatsapp', titulo: 'Mensagem WhatsApp enviada', descricao: 'Enviado vídeo do tour virtual do empreendimento' },
];

export default function SeedData() {
  const { user, role, construtora } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingCompleto, setIsSeedingCompleto] = useState(false);
  const [results, setResults] = useState<SeedResult[]>([]);
  const [generatedLinks, setGeneratedLinks] = useState<string[]>([]);

  const addResult = (result: SeedResult) => {
    setResults(prev => [...prev, result]);
    console.log(`[Seed] ${result.success ? '✅' : '❌'} ${result.step}: ${result.message}`);
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // ==================== SEED BASICO ====================
  const seedData = async () => {
    if (!user || !construtora?.id) {
      toast({ title: 'Erro', description: 'Você precisa estar logado como construtora.', variant: 'destructive' });
      return;
    }

    setIsSeeding(true);
    setResults([]);
    setGeneratedLinks([]);
    const construtoraId = construtora.id;

    try {
      addResult({ step: 'Construtora', success: true, message: `Usando: ${construtora?.nome_empresa}` });

      // Create/find imobiliaria
      let imobiliariaId: string | null = null;
      const { data: existingImob } = await supabase.from('imobiliarias').select('id').eq('nome_empresa', 'Godoy Prime Realty').maybeSingle();

      if (existingImob) {
        imobiliariaId = existingImob.id;
        addResult({ step: 'Imobiliária', success: true, message: 'Já existe: Godoy Prime Realty' });
      } else {
        const { data: newImob, error: imobError } = await supabase
          .from('imobiliarias')
          .insert({ user_id: user.id, nome_empresa: 'Godoy Prime Realty', creci: 'CRECI-RJ 12345', telefone: '(21) 99999-8888', email_contato: 'contato@godoyprime.com.br', cor_primaria: '#1e3a5f' })
          .select().single();

        if (imobError) {
          addResult({ step: 'Imobiliária', success: false, message: imobError.message });
        } else {
          imobiliariaId = newImob.id;
          addResult({ step: 'Imobiliária', success: true, message: 'Criada: Godoy Prime Realty' });
        }
      }

      // Create properties
      const createdImoveis: { id: string; titulo: string; slug: string }[] = [];
      for (const imovelData of IMOVEIS_DATA) {
        const { slug, ...dataToInsert } = imovelData;
        const { data: existing } = await supabase.from('imoveis').select('id').eq('construtora_id', construtoraId).eq('titulo', imovelData.titulo).maybeSingle();

        if (existing) {
          createdImoveis.push({ id: existing.id, titulo: imovelData.titulo, slug });
          addResult({ step: `Imóvel: ${imovelData.titulo}`, success: true, message: 'Já existe' });
          continue;
        }

        const { data: newImovel, error } = await supabase.from('imoveis').insert({ construtora_id: construtoraId, ...dataToInsert }).select().single();
        if (error) {
          addResult({ step: `Imóvel: ${imovelData.titulo}`, success: false, message: error.message });
        } else {
          createdImoveis.push({ id: newImovel.id, titulo: imovelData.titulo, slug });
          addResult({ step: `Imóvel: ${imovelData.titulo}`, success: true, message: 'Criado' });
        }
      }

      // Create access links
      if (imobiliariaId && createdImoveis.length > 0) {
        for (const imovel of createdImoveis) {
          const { data: existingAccess } = await supabase.from('imobiliaria_imovel_access').select('id, url_slug').eq('imobiliaria_id', imobiliariaId).eq('imovel_id', imovel.id).maybeSingle();
          if (existingAccess) {
            setGeneratedLinks(prev => [...prev, `/imovel/${existingAccess.url_slug}`]);
            addResult({ step: `Acesso: ${imovel.titulo}`, success: true, message: `Já existe: ${existingAccess.url_slug}` });
            continue;
          }
          const { data: newAccess, error } = await supabase.from('imobiliaria_imovel_access').insert({ imobiliaria_id: imobiliariaId, imovel_id: imovel.id, url_slug: imovel.slug, status: 'active', visitas: 0 }).select().single();
          if (error) {
            addResult({ step: `Acesso: ${imovel.titulo}`, success: false, message: error.message });
          } else {
            setGeneratedLinks(prev => [...prev, `/imovel/${newAccess.url_slug}`]);
            addResult({ step: `Acesso: ${imovel.titulo}`, success: true, message: `Link: /imovel/${newAccess.url_slug}` });
          }
        }
      }

      // Create leads
      let leadCount = 0;
      for (let i = 0; i < LEADS_DATA.length; i++) {
        const lead = LEADS_DATA[i];
        const imovel = createdImoveis[i % createdImoveis.length];
        if (!imovel) continue;
        const { error } = await supabase.from('leads').insert({ imovel_id: imovel.id, imobiliaria_id: imobiliariaId, nome: lead.nome, email: lead.email, telefone: lead.telefone, mensagem: lead.mensagem, origem: lead.origem, status: 'novo' });
        if (!error) leadCount++;
      }
      addResult({ step: 'Leads', success: leadCount > 0, message: `${leadCount} leads criados` });

      toast({ title: 'Seed básico concluído!', description: `${createdImoveis.length} imóveis e ${leadCount} leads criados.` });
    } catch (error: any) {
      addResult({ step: 'Erro Geral', success: false, message: error.message });
      toast({ title: 'Erro', description: 'Erro ao criar dados básicos.', variant: 'destructive' });
    } finally {
      setIsSeeding(false);
    }
  };

  // ==================== SEED COMPLETO ====================
  const seedCompleto = async () => {
    if (!user || !construtora?.id) {
      toast({ title: 'Erro', description: 'Você precisa estar logado como construtora.', variant: 'destructive' });
      return;
    }

    setIsSeedingCompleto(true);
    setResults([]);
    setGeneratedLinks([]);
    const construtoraId = construtora.id;

    try {
      addResult({ step: 'Início', success: true, message: 'Iniciando seed completo...' });

      // 1. Fetch all imoveis
      const { data: allImoveis, error: imoveisErr } = await supabase.from('imoveis').select('id, titulo').eq('construtora_id', construtoraId);
      if (imoveisErr || !allImoveis?.length) {
        addResult({ step: 'Imóveis', success: false, message: imoveisErr?.message || 'Nenhum imóvel encontrado. Execute o seed básico primeiro.' });
        setIsSeedingCompleto(false);
        return;
      }
      addResult({ step: 'Imóveis', success: true, message: `${allImoveis.length} imóveis encontrados` });

      // 2. Fetch all imobiliarias with existing access
      const { data: accessRecords } = await supabase.from('imobiliaria_imovel_access').select('imobiliaria_id, imovel_id, url_slug').not('imobiliaria_id', 'is', null);
      const imobiliariaIds = [...new Set((accessRecords || []).map(a => a.imobiliaria_id).filter(Boolean))] as string[];

      if (imobiliariaIds.length === 0) {
        addResult({ step: 'Imobiliárias', success: false, message: 'Nenhuma imobiliária com acesso encontrada. Execute o seed básico primeiro.' });
        setIsSeedingCompleto(false);
        return;
      }
      addResult({ step: 'Imobiliárias', success: true, message: `${imobiliariaIds.length} imobiliárias encontradas` });

      // 3. Grant access to ALL imoveis for ALL imobiliarias
      let accessCount = 0;
      const existingAccessSet = new Set((accessRecords || []).map(a => `${a.imobiliaria_id}_${a.imovel_id}`));

      for (const imobId of imobiliariaIds) {
        for (const imovel of allImoveis) {
          const key = `${imobId}_${imovel.id}`;
          if (existingAccessSet.has(key)) continue;

          const slug = `${generateSlug(imovel.titulo)}-${imobId.slice(0, 6)}`;
          const { error } = await supabase.from('imobiliaria_imovel_access').insert({
            imobiliaria_id: imobId,
            imovel_id: imovel.id,
            url_slug: slug,
            status: 'active',
            visitas: Math.floor(Math.random() * 50),
          });
          if (!error) {
            accessCount++;
            setGeneratedLinks(prev => [...prev, `/imovel/${slug}`]);
          }
        }
      }
      addResult({ step: 'Acessos', success: true, message: `${accessCount} novos acessos criados (${existingAccessSet.size} já existiam)` });

      // 4. Fetch all leads
      const { data: allLeads } = await supabase
        .from('leads')
        .select('id, nome, imovel_id, imobiliaria_id, estagio_pipeline, construtora_id')
        .or(`construtora_id.eq.${construtoraId},imovel_id.in.(${allImoveis.map(i => i.id).join(',')})`);

      if (!allLeads?.length) {
        addResult({ step: 'Leads', success: false, message: 'Nenhum lead encontrado.' });
        setIsSeedingCompleto(false);
        return;
      }
      addResult({ step: 'Leads encontrados', success: true, message: `${allLeads.length} leads disponíveis` });

      // 5. Popular notas_lead
      let notasCount = 0;
      for (let i = 0; i < Math.min(NOTAS_CONTEUDO.length, allLeads.length); i++) {
        const lead = allLeads[i % allLeads.length];
        const { error } = await supabase.from('notas_lead').insert({
          lead_id: lead.id,
          conteudo: NOTAS_CONTEUDO[i],
          autor_id: user.id,
          autor_nome: user.email?.split('@')[0] || 'Admin',
          privada: i % 3 === 0,
        });
        if (!error) notasCount++;
      }
      addResult({ step: 'Notas', success: notasCount > 0, message: `${notasCount} notas criadas` });

      // 6. Popular propostas_compra
      const leadsAvancados = allLeads.filter(l =>
        ['proposta_enviada', 'negociacao', 'qualificado', 'visita_agendada'].includes(l.estagio_pipeline || '')
      );
      const leadsParaProposta = leadsAvancados.length > 0 ? leadsAvancados : allLeads.slice(0, 5);

      let propostasCount = 0;
      const propostas = [
        { nome: 'Carlos Alberto Silva', cpf: '123.456.789-00', tel: '(21) 99888-7777', email: 'carlos@email.com', valor: 11500000, sinal: '20% de entrada (R$ 2.300.000)', parcelas: '36x de R$ 255.555', financiamento: 'Banco Itaú - 30 anos', status: 'pendente' },
        { nome: 'Ana Paula Martins', cpf: '987.654.321-00', tel: '(21) 98765-4321', email: 'ana@empresa.com.br', valor: 8200000, sinal: '30% de entrada (R$ 2.460.000)', parcelas: '24x de R$ 239.166', financiamento: 'Bradesco - 25 anos', status: 'aceita' },
        { nome: 'Roberto Campos Neto', cpf: '456.789.123-00', tel: '(21) 97777-6666', email: 'roberto@gmail.com', valor: 4000000, sinal: '15% de entrada (R$ 600.000)', parcelas: '48x de R$ 70.833', financiamento: 'Caixa Econômica - 35 anos', status: 'pendente' },
        { nome: 'Mariana Costa Lima', cpf: '321.654.987-00', tel: '(21) 96666-5555', email: 'mariana@hotmail.com', valor: 7800000, sinal: '25% de entrada', parcelas: 'À vista com desconto', financiamento: null, status: 'recusada' },
        { nome: 'Fernando Oliveira Santos', cpf: '654.321.987-00', tel: '(21) 95555-4444', email: 'fernando@yahoo.com', valor: 3900000, sinal: '10% de entrada', parcelas: '60x de R$ 58.500', financiamento: 'Santander - 30 anos', status: 'pendente' },
      ];

      for (let i = 0; i < propostas.length; i++) {
        const lead = leadsParaProposta[i % leadsParaProposta.length];
        const imovel = allImoveis[i % allImoveis.length];
        const p = propostas[i];
        const codigo = `PROP-${String(i + 1).padStart(4, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

        const validade = new Date();
        validade.setDate(validade.getDate() + (p.status === 'recusada' ? -5 : 15));

        const { error } = await supabase.from('propostas_compra').insert({
          construtora_id: construtoraId,
          imobiliaria_id: lead.imobiliaria_id,
          imovel_id: imovel.id,
          codigo,
          nome_completo: p.nome,
          cpf_cnpj: p.cpf,
          telefone: p.tel,
          email: p.email,
          valor_ofertado: p.valor,
          sinal_entrada: p.sinal,
          parcelas: p.parcelas,
          financiamento: p.financiamento,
          status: p.status,
          validade_proposta: validade.toISOString(),
          outras_condicoes: i === 0 ? 'Condicionada à vistoria técnica independente' : null,
        });
        if (!error) propostasCount++;
      }
      addResult({ step: 'Propostas', success: propostasCount > 0, message: `${propostasCount} propostas criadas` });

      // 7. Popular tarefas
      let tarefasCount = 0;
      const statusOptions = ['pendente', 'em_andamento', 'concluida'];
      for (let i = 0; i < TAREFAS_TITULOS.length; i++) {
        const lead = allLeads[i % allLeads.length];
        const t = TAREFAS_TITULOS[i];
        const status = statusOptions[i % statusOptions.length];

        const vencimento = new Date();
        if (status === 'concluida') {
          vencimento.setDate(vencimento.getDate() - Math.floor(Math.random() * 7 + 1));
        } else if (i % 2 === 0) {
          vencimento.setDate(vencimento.getDate() + Math.floor(Math.random() * 7 + 1));
        } else {
          vencimento.setDate(vencimento.getDate() - Math.floor(Math.random() * 3));
        }

        const { error } = await supabase.from('tarefas').insert({
          lead_id: lead.id,
          construtora_id: construtoraId,
          imobiliaria_id: lead.imobiliaria_id,
          titulo: t.titulo,
          descricao: t.descricao,
          prioridade: t.prioridade,
          status,
          responsavel_id: user.id,
          responsavel_nome: user.email?.split('@')[0] || 'Admin',
          data_vencimento: vencimento.toISOString(),
          data_conclusao: status === 'concluida' ? new Date().toISOString() : null,
        });
        if (!error) tarefasCount++;
      }
      addResult({ step: 'Tarefas', success: tarefasCount > 0, message: `${tarefasCount} tarefas criadas` });

      // 8. Popular atividades_lead complementares
      let atividadesCount = 0;
      for (let i = 0; i < ATIVIDADES_TIPOS.length; i++) {
        const lead = allLeads[i % allLeads.length];
        const a = ATIVIDADES_TIPOS[i];

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 14));

        const { error } = await supabase.from('atividades_lead').insert({
          lead_id: lead.id,
          tipo: a.tipo,
          titulo: a.titulo,
          descricao: a.descricao,
          usuario_id: user.id,
          usuario_nome: user.email?.split('@')[0] || 'Admin',
        });
        if (!error) atividadesCount++;
      }
      addResult({ step: 'Atividades', success: atividadesCount > 0, message: `${atividadesCount} atividades criadas` });

      addResult({ step: '✅ Concluído', success: true, message: 'Seed completo finalizado com sucesso!' });
      toast({
        title: 'Seed completo realizado!',
        description: `Acessos: ${accessCount} | Notas: ${notasCount} | Propostas: ${propostasCount} | Tarefas: ${tarefasCount} | Atividades: ${atividadesCount}`,
      });
    } catch (error: any) {
      console.error('[Seed Completo] Erro:', error);
      addResult({ step: 'Erro Geral', success: false, message: error.message });
      toast({ title: 'Erro', description: 'Erro durante o seed completo.', variant: 'destructive' });
    } finally {
      setIsSeedingCompleto(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle>Acesso Restrito</CardTitle><CardDescription>Você precisa estar logado.</CardDescription></CardHeader>
          <CardContent><Button onClick={() => navigate('/auth/login')} className="w-full">Fazer Login</Button></CardContent>
        </Card>
      </div>
    );
  }

  if (role !== 'construtora' && role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle>Acesso Negado</CardTitle><CardDescription>Apenas construtoras podem criar dados de teste.</CardDescription></CardHeader>
          <CardContent><Button onClick={() => navigate('/dashboard/imobiliaria')} className="w-full">Ir para Dashboard</Button></CardContent>
        </Card>
      </div>
    );
  }

  const anyLoading = isSeeding || isSeedingCompleto;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">🌱 Dados de Teste</h1>
          <p className="text-muted-foreground">Crie dados de exemplo para testar o sistema completo</p>
        </div>

        {/* Seed Básico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Seed Básico</CardTitle>
            <CardDescription>Cria: 1 imobiliária, 3 imóveis, acessos white-label e 5 leads.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">O que será criado:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Building2 className="h-4 w-4" />1 Imobiliária: Godoy Prime Realty</li>
                <li className="flex items-center gap-2"><Home className="h-4 w-4" />3 Imóveis de alto padrão</li>
                <li className="flex items-center gap-2"><Link className="h-4 w-4" />3 Links White-Label</li>
                <li className="flex items-center gap-2"><Users className="h-4 w-4" />5 Leads de teste</li>
              </ul>
            </div>
            <Button onClick={seedData} disabled={anyLoading} className="w-full" size="lg">
              {isSeeding ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando dados...</>) : (<><Database className="mr-2 h-4 w-4" />Criar Dados Básicos</>)}
            </Button>
          </CardContent>
        </Card>

        {/* Seed Completo */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" />Seed Completo</CardTitle>
            <CardDescription>Popula TODAS as tabelas para teste completo do sistema. Requer que o seed básico já tenha sido executado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h4 className="font-medium mb-2">O que será criado/complementado:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Link className="h-4 w-4" />Acesso a TODOS os imóveis para TODAS as imobiliárias</li>
                <li className="flex items-center gap-2"><Users className="h-4 w-4" />15 notas de acompanhamento nos leads</li>
                <li className="flex items-center gap-2"><Building2 className="h-4 w-4" />5 propostas de compra com valores e condições</li>
                <li className="flex items-center gap-2"><Home className="h-4 w-4" />10 tarefas variadas (alta/média/baixa prioridade)</li>
                <li className="flex items-center gap-2"><Zap className="h-4 w-4" />8 atividades complementares (email, ligação, visita, nota)</li>
              </ul>
            </div>
            <Button onClick={seedCompleto} disabled={anyLoading} className="w-full" size="lg" variant="default">
              {isSeedingCompleto ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Executando seed completo...</>) : (<><Zap className="mr-2 h-4 w-4" />Executar Seed Completo</>)}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Resultado da Execução</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className={`flex items-center gap-2 p-3 rounded-lg ${result.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {result.success ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                    <div><span className="font-medium">{result.step}:</span> <span className="text-muted-foreground">{result.message}</span></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Links */}
        {generatedLinks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>🔗 Links Gerados</CardTitle>
              <CardDescription>Clique para visualizar as páginas públicas dos imóveis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedLinks.map((link, index) => (
                  <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                    <Link className="h-4 w-4 text-primary" />
                    <span className="text-primary font-mono">{link}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/dashboard/construtora')}>Ir para Dashboard</Button>
          <Button variant="outline" onClick={() => navigate('/teste-conexao')}>Testar Conexão</Button>
        </div>
      </div>
    </div>
  );
}
