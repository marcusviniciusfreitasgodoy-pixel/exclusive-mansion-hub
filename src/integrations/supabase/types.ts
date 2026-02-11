export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agendamentos_visitas: {
        Row: {
          access_id: string | null
          calendly_event_id: string | null
          calendly_event_url: string | null
          cancelado_em: string | null
          cliente_email: string
          cliente_nome: string
          cliente_telefone: string
          confirmado_em: string | null
          construtora_id: string
          corretor_email: string | null
          corretor_nome: string | null
          created_at: string | null
          data_confirmada: string | null
          documento_identificacao_url: string | null
          id: string
          imobiliaria_id: string | null
          imovel_id: string
          lead_id: string | null
          lembrete_1h_enviado: boolean | null
          lembrete_24h_enviado: boolean | null
          motivo_cancelamento: string | null
          observacoes: string | null
          opcao_data_1: string
          opcao_data_2: string
          realizado_em: string | null
          respostas_customizadas: Json | null
          status: Database["public"]["Enums"]["agendamento_status"]
          updated_at: string | null
        }
        Insert: {
          access_id?: string | null
          calendly_event_id?: string | null
          calendly_event_url?: string | null
          cancelado_em?: string | null
          cliente_email: string
          cliente_nome: string
          cliente_telefone: string
          confirmado_em?: string | null
          construtora_id: string
          corretor_email?: string | null
          corretor_nome?: string | null
          created_at?: string | null
          data_confirmada?: string | null
          documento_identificacao_url?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id: string
          lead_id?: string | null
          lembrete_1h_enviado?: boolean | null
          lembrete_24h_enviado?: boolean | null
          motivo_cancelamento?: string | null
          observacoes?: string | null
          opcao_data_1: string
          opcao_data_2: string
          realizado_em?: string | null
          respostas_customizadas?: Json | null
          status?: Database["public"]["Enums"]["agendamento_status"]
          updated_at?: string | null
        }
        Update: {
          access_id?: string | null
          calendly_event_id?: string | null
          calendly_event_url?: string | null
          cancelado_em?: string | null
          cliente_email?: string
          cliente_nome?: string
          cliente_telefone?: string
          confirmado_em?: string | null
          construtora_id?: string
          corretor_email?: string | null
          corretor_nome?: string | null
          created_at?: string | null
          data_confirmada?: string | null
          documento_identificacao_url?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string
          lead_id?: string | null
          lembrete_1h_enviado?: boolean | null
          lembrete_24h_enviado?: boolean | null
          motivo_cancelamento?: string | null
          observacoes?: string | null
          opcao_data_1?: string
          opcao_data_2?: string
          realizado_em?: string | null
          respostas_customizadas?: Json | null
          status?: Database["public"]["Enums"]["agendamento_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_visitas_access_id_fkey"
            columns: ["access_id"]
            isOneToOne: false
            referencedRelation: "imobiliaria_imovel_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_visitas_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_visitas_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_visitas_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_visitas_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_visitas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      atividades_lead: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          lead_id: string
          metadata: Json | null
          tipo: string
          titulo: string | null
          usuario_id: string | null
          usuario_nome: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          tipo: string
          titulo?: string | null
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          tipo?: string
          titulo?: string | null
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atividades_lead_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      bloqueios_agenda: {
        Row: {
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: string
          imobiliaria_id: string
          motivo: string | null
          recorrente: boolean | null
        }
        Insert: {
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          imobiliaria_id: string
          motivo?: string | null
          recorrente?: boolean | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          imobiliaria_id?: string
          motivo?: string | null
          recorrente?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "bloqueios_agenda_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bloqueios_agenda_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_knowledge_base: {
        Row: {
          ativo: boolean | null
          categoria: string
          conteudo: string
          created_at: string | null
          id: string
          prioridade: number | null
          tags: string[] | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          conteudo: string
          created_at?: string | null
          id?: string
          prioridade?: number | null
          tags?: string[] | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          conteudo?: string
          created_at?: string | null
          id?: string
          prioridade?: number | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracoes_formularios: {
        Row: {
          ativo: boolean | null
          campos: Json
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          imobiliaria_id: string
          nome_formulario: string | null
          tipo_formulario: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          campos?: Json
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          imobiliaria_id: string
          nome_formulario?: string | null
          tipo_formulario: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          campos?: Json
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          imobiliaria_id?: string
          nome_formulario?: string | null
          tipo_formulario?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_formularios_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "configuracoes_formularios_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
        ]
      }
      construtoras: {
        Row: {
          cnpj: string
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string | null
          dominio_customizado: string | null
          email_contato: string | null
          favicon_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          nome_empresa: string
          plano: Database["public"]["Enums"]["plano_construtora"] | null
          site_url: string | null
          status: Database["public"]["Enums"]["construtora_status"] | null
          telefone: string | null
          user_id: string
        }
        Insert: {
          cnpj: string
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          dominio_customizado?: string | null
          email_contato?: string | null
          favicon_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          nome_empresa: string
          plano?: Database["public"]["Enums"]["plano_construtora"] | null
          site_url?: string | null
          status?: Database["public"]["Enums"]["construtora_status"] | null
          telefone?: string | null
          user_id: string
        }
        Update: {
          cnpj?: string
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          dominio_customizado?: string | null
          email_contato?: string | null
          favicon_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          nome_empresa?: string
          plano?: Database["public"]["Enums"]["plano_construtora"] | null
          site_url?: string | null
          status?: Database["public"]["Enums"]["construtora_status"] | null
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversas_chatbot: {
        Row: {
          agendamento_gerado: boolean | null
          construtora_id: string
          created_at: string | null
          duracao_segundos: number | null
          email_visitante: string | null
          id: string
          imobiliaria_id: string | null
          imovel_id: string
          intencao_detectada: string | null
          lead_gerado: boolean | null
          lead_id: string | null
          mensagens: Json
          nome_visitante: string | null
          orcamento_estimado: number | null
          prazo_estimado: string | null
          primeira_mensagem_em: string | null
          score_qualificacao: number | null
          session_id: string
          status: string | null
          telefone_visitante: string | null
          total_mensagens: number | null
          ultima_mensagem_em: string | null
          updated_at: string | null
        }
        Insert: {
          agendamento_gerado?: boolean | null
          construtora_id: string
          created_at?: string | null
          duracao_segundos?: number | null
          email_visitante?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id: string
          intencao_detectada?: string | null
          lead_gerado?: boolean | null
          lead_id?: string | null
          mensagens?: Json
          nome_visitante?: string | null
          orcamento_estimado?: number | null
          prazo_estimado?: string | null
          primeira_mensagem_em?: string | null
          score_qualificacao?: number | null
          session_id: string
          status?: string | null
          telefone_visitante?: string | null
          total_mensagens?: number | null
          ultima_mensagem_em?: string | null
          updated_at?: string | null
        }
        Update: {
          agendamento_gerado?: boolean | null
          construtora_id?: string
          created_at?: string | null
          duracao_segundos?: number | null
          email_visitante?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string
          intencao_detectada?: string | null
          lead_gerado?: boolean | null
          lead_id?: string | null
          mensagens?: Json
          nome_visitante?: string | null
          orcamento_estimado?: number | null
          prazo_estimado?: string | null
          primeira_mensagem_em?: string | null
          score_qualificacao?: number | null
          session_id?: string
          status?: string | null
          telefone_visitante?: string | null
          total_mensagens?: number | null
          ultima_mensagem_em?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversas_chatbot_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_chatbot_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_chatbot_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_chatbot_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_chatbot_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          created_at: string
          domain: string
          entity_id: string
          entity_type: string
          id: string
          status: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          entity_id: string
          entity_type: string
          id?: string
          status?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          entity_id?: string
          entity_type?: string
          id?: string
          status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          created_at: string
          email: string
          empresa: string
          id: string
          mensagem: string | null
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          empresa: string
          id?: string
          mensagem?: string | null
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          empresa?: string
          id?: string
          mensagem?: string | null
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      disponibilidade_corretor: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          dia_semana: number
          duracao_slot_minutos: number
          hora_fim: string
          hora_inicio: string
          id: string
          imobiliaria_id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          dia_semana: number
          duracao_slot_minutos?: number
          hora_fim: string
          hora_inicio: string
          id?: string
          imobiliaria_id: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          dia_semana?: number
          duracao_slot_minutos?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
          imobiliaria_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disponibilidade_corretor_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disponibilidade_corretor_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimentos: {
        Row: {
          caracteristicas_principais: Json
          componentes_ui: Json | null
          construtora_id: string
          cores_design_system: Json | null
          created_at: string | null
          descricao_curta: string
          detalhes: Json
          id: string
          imagens: Json
          link_visita_virtual: string | null
          localizacao: Json
          precos: Json
          slug: string
          status: Database["public"]["Enums"]["empreendimento_status"]
          titulo: string
          updated_at: string | null
        }
        Insert: {
          caracteristicas_principais?: Json
          componentes_ui?: Json | null
          construtora_id: string
          cores_design_system?: Json | null
          created_at?: string | null
          descricao_curta: string
          detalhes?: Json
          id?: string
          imagens?: Json
          link_visita_virtual?: string | null
          localizacao?: Json
          precos?: Json
          slug: string
          status?: Database["public"]["Enums"]["empreendimento_status"]
          titulo: string
          updated_at?: string | null
        }
        Update: {
          caracteristicas_principais?: Json
          componentes_ui?: Json | null
          construtora_id?: string
          cores_design_system?: Json | null
          created_at?: string | null
          descricao_curta?: string
          detalhes?: Json
          id?: string
          imagens?: Json
          link_visita_virtual?: string | null
          localizacao?: Json
          precos?: Json
          slug?: string
          status?: Database["public"]["Enums"]["empreendimento_status"]
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empreendimentos_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks_visitas: {
        Row: {
          access_id: string | null
          agendamento_visita_id: string | null
          assinatura_cliente: string | null
          assinatura_cliente_data: string | null
          assinatura_cliente_device: string | null
          assinatura_cliente_geolocation: Json | null
          assinatura_cliente_ip: string | null
          assinatura_corretor: string | null
          assinatura_corretor_data: string | null
          assinatura_corretor_device: string | null
          assinatura_corretor_ip: string | null
          avaliacao_acabamento: number | null
          avaliacao_atendimento: number | null
          avaliacao_custo_beneficio: number | null
          avaliacao_layout: number | null
          avaliacao_localizacao: number | null
          cliente_email: string
          cliente_nome: string
          cliente_telefone: string | null
          completo_em: string | null
          construtora_id: string
          corretor_email: string | null
          corretor_nome: string | null
          corretor_telefone: string | null
          created_at: string | null
          data_followup: string | null
          data_visita: string
          documento_hash: string | null
          duracao_minutos: number | null
          efeito_uau: string[] | null
          efeito_uau_detalhe: string | null
          feedback_cliente_em: string | null
          feedback_corretor_em: string | null
          followup_2_enviado_cliente: boolean
          followup_2_enviado_corretor: boolean
          followup_enviado_cliente: boolean
          followup_enviado_corretor: boolean
          forma_pagamento_cliente: string | null
          forma_pagamento_pretendida: string | null
          id: string
          imobiliaria_id: string | null
          imovel_id: string
          interesse_compra:
            | Database["public"]["Enums"]["interesse_compra"]
            | null
          lead_id: string | null
          necessita_followup: boolean | null
          nps_cliente: number | null
          objecoes: Json | null
          objecoes_detalhes: string | null
          observacoes_corretor: string | null
          orcamento_cliente: number | null
          orcamento_disponivel: number | null
          pdf_gerado_em: string | null
          pdf_url: string | null
          percepcao_valor: string | null
          poder_decisao: Database["public"]["Enums"]["poder_decisao"] | null
          poder_decisao_detalhes: string | null
          pontos_negativos: string | null
          pontos_positivos: string | null
          prazo_compra: Database["public"]["Enums"]["prazo_compra"] | null
          prazo_compra_cliente: string | null
          proximos_passos: string | null
          proximos_passos_cliente: string | null
          qualificacao_lead:
            | Database["public"]["Enums"]["qualificacao_lead"]
            | null
          respostas_cliente_customizadas: Json | null
          respostas_corretor_customizadas: Json | null
          score_lead: number | null
          status: Database["public"]["Enums"]["feedback_status"]
          sugestoes: string | null
          token_acesso_cliente: string | null
          updated_at: string | null
        }
        Insert: {
          access_id?: string | null
          agendamento_visita_id?: string | null
          assinatura_cliente?: string | null
          assinatura_cliente_data?: string | null
          assinatura_cliente_device?: string | null
          assinatura_cliente_geolocation?: Json | null
          assinatura_cliente_ip?: string | null
          assinatura_corretor?: string | null
          assinatura_corretor_data?: string | null
          assinatura_corretor_device?: string | null
          assinatura_corretor_ip?: string | null
          avaliacao_acabamento?: number | null
          avaliacao_atendimento?: number | null
          avaliacao_custo_beneficio?: number | null
          avaliacao_layout?: number | null
          avaliacao_localizacao?: number | null
          cliente_email: string
          cliente_nome: string
          cliente_telefone?: string | null
          completo_em?: string | null
          construtora_id: string
          corretor_email?: string | null
          corretor_nome?: string | null
          corretor_telefone?: string | null
          created_at?: string | null
          data_followup?: string | null
          data_visita: string
          documento_hash?: string | null
          duracao_minutos?: number | null
          efeito_uau?: string[] | null
          efeito_uau_detalhe?: string | null
          feedback_cliente_em?: string | null
          feedback_corretor_em?: string | null
          followup_2_enviado_cliente?: boolean
          followup_2_enviado_corretor?: boolean
          followup_enviado_cliente?: boolean
          followup_enviado_corretor?: boolean
          forma_pagamento_cliente?: string | null
          forma_pagamento_pretendida?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id: string
          interesse_compra?:
            | Database["public"]["Enums"]["interesse_compra"]
            | null
          lead_id?: string | null
          necessita_followup?: boolean | null
          nps_cliente?: number | null
          objecoes?: Json | null
          objecoes_detalhes?: string | null
          observacoes_corretor?: string | null
          orcamento_cliente?: number | null
          orcamento_disponivel?: number | null
          pdf_gerado_em?: string | null
          pdf_url?: string | null
          percepcao_valor?: string | null
          poder_decisao?: Database["public"]["Enums"]["poder_decisao"] | null
          poder_decisao_detalhes?: string | null
          pontos_negativos?: string | null
          pontos_positivos?: string | null
          prazo_compra?: Database["public"]["Enums"]["prazo_compra"] | null
          prazo_compra_cliente?: string | null
          proximos_passos?: string | null
          proximos_passos_cliente?: string | null
          qualificacao_lead?:
            | Database["public"]["Enums"]["qualificacao_lead"]
            | null
          respostas_cliente_customizadas?: Json | null
          respostas_corretor_customizadas?: Json | null
          score_lead?: number | null
          status?: Database["public"]["Enums"]["feedback_status"]
          sugestoes?: string | null
          token_acesso_cliente?: string | null
          updated_at?: string | null
        }
        Update: {
          access_id?: string | null
          agendamento_visita_id?: string | null
          assinatura_cliente?: string | null
          assinatura_cliente_data?: string | null
          assinatura_cliente_device?: string | null
          assinatura_cliente_geolocation?: Json | null
          assinatura_cliente_ip?: string | null
          assinatura_corretor?: string | null
          assinatura_corretor_data?: string | null
          assinatura_corretor_device?: string | null
          assinatura_corretor_ip?: string | null
          avaliacao_acabamento?: number | null
          avaliacao_atendimento?: number | null
          avaliacao_custo_beneficio?: number | null
          avaliacao_layout?: number | null
          avaliacao_localizacao?: number | null
          cliente_email?: string
          cliente_nome?: string
          cliente_telefone?: string | null
          completo_em?: string | null
          construtora_id?: string
          corretor_email?: string | null
          corretor_nome?: string | null
          corretor_telefone?: string | null
          created_at?: string | null
          data_followup?: string | null
          data_visita?: string
          documento_hash?: string | null
          duracao_minutos?: number | null
          efeito_uau?: string[] | null
          efeito_uau_detalhe?: string | null
          feedback_cliente_em?: string | null
          feedback_corretor_em?: string | null
          followup_2_enviado_cliente?: boolean
          followup_2_enviado_corretor?: boolean
          followup_enviado_cliente?: boolean
          followup_enviado_corretor?: boolean
          forma_pagamento_cliente?: string | null
          forma_pagamento_pretendida?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string
          interesse_compra?:
            | Database["public"]["Enums"]["interesse_compra"]
            | null
          lead_id?: string | null
          necessita_followup?: boolean | null
          nps_cliente?: number | null
          objecoes?: Json | null
          objecoes_detalhes?: string | null
          observacoes_corretor?: string | null
          orcamento_cliente?: number | null
          orcamento_disponivel?: number | null
          pdf_gerado_em?: string | null
          pdf_url?: string | null
          percepcao_valor?: string | null
          poder_decisao?: Database["public"]["Enums"]["poder_decisao"] | null
          poder_decisao_detalhes?: string | null
          pontos_negativos?: string | null
          pontos_positivos?: string | null
          prazo_compra?: Database["public"]["Enums"]["prazo_compra"] | null
          prazo_compra_cliente?: string | null
          proximos_passos?: string | null
          proximos_passos_cliente?: string | null
          qualificacao_lead?:
            | Database["public"]["Enums"]["qualificacao_lead"]
            | null
          respostas_cliente_customizadas?: Json | null
          respostas_corretor_customizadas?: Json | null
          score_lead?: number | null
          status?: Database["public"]["Enums"]["feedback_status"]
          sugestoes?: string | null
          token_acesso_cliente?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_visitas_access_id_fkey"
            columns: ["access_id"]
            isOneToOne: false
            referencedRelation: "imobiliaria_imovel_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_visitas_agendamento_visita_id_fkey"
            columns: ["agendamento_visita_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_visitas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_visitas_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_visitas_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_visitas_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_visitas_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_visitas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      fichas_visita: {
        Row: {
          aceita_ofertas_similares: boolean | null
          acompanhantes: Json | null
          agendamento_visita_id: string | null
          assinatura_corretor: string | null
          assinatura_visitante: string | null
          codigo: string
          condominio_edificio: string | null
          construtora_id: string | null
          corretor_nome: string
          cpf_visitante: string
          created_at: string | null
          data_visita: string | null
          email_visitante: string | null
          endereco_imovel: string
          endereco_visitante: string | null
          id: string
          imobiliaria_id: string | null
          imovel_id: string | null
          nome_proprietario: string | null
          nome_visitante: string
          notas: string | null
          rg_visitante: string | null
          status: string
          telefone_visitante: string
          unidade_imovel: string | null
          updated_at: string | null
          valor_imovel: number | null
        }
        Insert: {
          aceita_ofertas_similares?: boolean | null
          acompanhantes?: Json | null
          agendamento_visita_id?: string | null
          assinatura_corretor?: string | null
          assinatura_visitante?: string | null
          codigo: string
          condominio_edificio?: string | null
          construtora_id?: string | null
          corretor_nome: string
          cpf_visitante: string
          created_at?: string | null
          data_visita?: string | null
          email_visitante?: string | null
          endereco_imovel: string
          endereco_visitante?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string | null
          nome_proprietario?: string | null
          nome_visitante: string
          notas?: string | null
          rg_visitante?: string | null
          status?: string
          telefone_visitante: string
          unidade_imovel?: string | null
          updated_at?: string | null
          valor_imovel?: number | null
        }
        Update: {
          aceita_ofertas_similares?: boolean | null
          acompanhantes?: Json | null
          agendamento_visita_id?: string | null
          assinatura_corretor?: string | null
          assinatura_visitante?: string | null
          codigo?: string
          condominio_edificio?: string | null
          construtora_id?: string | null
          corretor_nome?: string
          cpf_visitante?: string
          created_at?: string | null
          data_visita?: string | null
          email_visitante?: string | null
          endereco_imovel?: string
          endereco_visitante?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string | null
          nome_proprietario?: string | null
          nome_visitante?: string
          notas?: string | null
          rg_visitante?: string | null
          status?: string
          telefone_visitante?: string
          unidade_imovel?: string | null
          updated_at?: string | null
          valor_imovel?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fichas_visita_agendamento_visita_id_fkey"
            columns: ["agendamento_visita_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_visitas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fichas_visita_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fichas_visita_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fichas_visita_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fichas_visita_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      imobiliaria_imovel_access: {
        Row: {
          acesso_concedido_em: string | null
          id: string
          imobiliaria_id: string | null
          imovel_id: string
          status: Database["public"]["Enums"]["access_status"] | null
          url_slug: string
          visitas: number | null
        }
        Insert: {
          acesso_concedido_em?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id: string
          status?: Database["public"]["Enums"]["access_status"] | null
          url_slug: string
          visitas?: number | null
        }
        Update: {
          acesso_concedido_em?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string
          status?: Database["public"]["Enums"]["access_status"] | null
          url_slug?: string
          visitas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "imobiliaria_imovel_access_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imobiliaria_imovel_access_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imobiliaria_imovel_access_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      imobiliarias: {
        Row: {
          cor_primaria: string | null
          created_at: string | null
          creci: string
          dominio_customizado: string | null
          email_contato: string | null
          favicon_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          nome_empresa: string
          site_url: string | null
          telefone: string | null
          user_id: string
        }
        Insert: {
          cor_primaria?: string | null
          created_at?: string | null
          creci: string
          dominio_customizado?: string | null
          email_contato?: string | null
          favicon_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          nome_empresa: string
          site_url?: string | null
          telefone?: string | null
          user_id: string
        }
        Update: {
          cor_primaria?: string | null
          created_at?: string | null
          creci?: string
          dominio_customizado?: string | null
          email_contato?: string | null
          favicon_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          nome_empresa?: string
          site_url?: string | null
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      imoveis: {
        Row: {
          abastecimento_agua: string | null
          amenities: Json | null
          aquecimento: Json | null
          area_privativa: number | null
          area_total: number | null
          bairro: string | null
          banheiros: number | null
          caracteristicas_terreno: Json | null
          cep: string | null
          cidade: string | null
          condicoes_pagamento: string | null
          condominio: number | null
          construtora_id: string
          contexto_adicional_ia: string | null
          corretores: Json | null
          created_at: string | null
          customizacao_template: Json | null
          data_publicacao: string | null
          descricao: string | null
          diferenciais: Json | null
          distrito: string | null
          documentos: Json | null
          endereco: string | null
          estado: string | null
          estilo_arquitetonico: string | null
          estrutura_construcao: string | null
          features_exterior: Json | null
          features_interior: Json | null
          flag_alto_padrao: boolean | null
          flag_destaque: boolean | null
          flag_exclusividade: boolean | null
          flag_lancamento: boolean | null
          flag_novo_anuncio: boolean | null
          flag_off_market: boolean | null
          headline: string | null
          id: string
          imagens: Json | null
          impostos_anuais: number | null
          iptu: number | null
          latitude: number | null
          listing_code: string | null
          longitude: number | null
          lot_size: number | null
          lot_size_unit: string | null
          materiais_promocionais: Json | null
          memorial_descritivo: string | null
          origem_cadastro: string | null
          parking_spaces: number | null
          price_on_request: boolean | null
          price_secondary: number | null
          price_secondary_currency: string | null
          property_type: string | null
          regiao: string | null
          seo_descricao: string | null
          seo_titulo: string | null
          sistema_esgoto: string | null
          status: Database["public"]["Enums"]["imovel_status"] | null
          suites: number | null
          tags: Json | null
          template_escolhido: string | null
          tipo_piso: Json | null
          titulo: string
          tour_360_url: string | null
          updated_at: string | null
          vagas: number | null
          vagas_descricao: string | null
          valor: number | null
          videos: Json | null
          vista: Json | null
          year_built: number | null
        }
        Insert: {
          abastecimento_agua?: string | null
          amenities?: Json | null
          aquecimento?: Json | null
          area_privativa?: number | null
          area_total?: number | null
          bairro?: string | null
          banheiros?: number | null
          caracteristicas_terreno?: Json | null
          cep?: string | null
          cidade?: string | null
          condicoes_pagamento?: string | null
          condominio?: number | null
          construtora_id: string
          contexto_adicional_ia?: string | null
          corretores?: Json | null
          created_at?: string | null
          customizacao_template?: Json | null
          data_publicacao?: string | null
          descricao?: string | null
          diferenciais?: Json | null
          distrito?: string | null
          documentos?: Json | null
          endereco?: string | null
          estado?: string | null
          estilo_arquitetonico?: string | null
          estrutura_construcao?: string | null
          features_exterior?: Json | null
          features_interior?: Json | null
          flag_alto_padrao?: boolean | null
          flag_destaque?: boolean | null
          flag_exclusividade?: boolean | null
          flag_lancamento?: boolean | null
          flag_novo_anuncio?: boolean | null
          flag_off_market?: boolean | null
          headline?: string | null
          id?: string
          imagens?: Json | null
          impostos_anuais?: number | null
          iptu?: number | null
          latitude?: number | null
          listing_code?: string | null
          longitude?: number | null
          lot_size?: number | null
          lot_size_unit?: string | null
          materiais_promocionais?: Json | null
          memorial_descritivo?: string | null
          origem_cadastro?: string | null
          parking_spaces?: number | null
          price_on_request?: boolean | null
          price_secondary?: number | null
          price_secondary_currency?: string | null
          property_type?: string | null
          regiao?: string | null
          seo_descricao?: string | null
          seo_titulo?: string | null
          sistema_esgoto?: string | null
          status?: Database["public"]["Enums"]["imovel_status"] | null
          suites?: number | null
          tags?: Json | null
          template_escolhido?: string | null
          tipo_piso?: Json | null
          titulo: string
          tour_360_url?: string | null
          updated_at?: string | null
          vagas?: number | null
          vagas_descricao?: string | null
          valor?: number | null
          videos?: Json | null
          vista?: Json | null
          year_built?: number | null
        }
        Update: {
          abastecimento_agua?: string | null
          amenities?: Json | null
          aquecimento?: Json | null
          area_privativa?: number | null
          area_total?: number | null
          bairro?: string | null
          banheiros?: number | null
          caracteristicas_terreno?: Json | null
          cep?: string | null
          cidade?: string | null
          condicoes_pagamento?: string | null
          condominio?: number | null
          construtora_id?: string
          contexto_adicional_ia?: string | null
          corretores?: Json | null
          created_at?: string | null
          customizacao_template?: Json | null
          data_publicacao?: string | null
          descricao?: string | null
          diferenciais?: Json | null
          distrito?: string | null
          documentos?: Json | null
          endereco?: string | null
          estado?: string | null
          estilo_arquitetonico?: string | null
          estrutura_construcao?: string | null
          features_exterior?: Json | null
          features_interior?: Json | null
          flag_alto_padrao?: boolean | null
          flag_destaque?: boolean | null
          flag_exclusividade?: boolean | null
          flag_lancamento?: boolean | null
          flag_novo_anuncio?: boolean | null
          flag_off_market?: boolean | null
          headline?: string | null
          id?: string
          imagens?: Json | null
          impostos_anuais?: number | null
          iptu?: number | null
          latitude?: number | null
          listing_code?: string | null
          longitude?: number | null
          lot_size?: number | null
          lot_size_unit?: string | null
          materiais_promocionais?: Json | null
          memorial_descritivo?: string | null
          origem_cadastro?: string | null
          parking_spaces?: number | null
          price_on_request?: boolean | null
          price_secondary?: number | null
          price_secondary_currency?: string | null
          property_type?: string | null
          regiao?: string | null
          seo_descricao?: string | null
          seo_titulo?: string | null
          sistema_esgoto?: string | null
          status?: Database["public"]["Enums"]["imovel_status"] | null
          suites?: number | null
          tags?: Json | null
          template_escolhido?: string | null
          tipo_piso?: Json | null
          titulo?: string
          tour_360_url?: string | null
          updated_at?: string | null
          vagas?: number | null
          vagas_descricao?: string | null
          valor?: number | null
          videos?: Json | null
          vista?: Json | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      imovel_knowledge_base: {
        Row: {
          ativo: boolean | null
          categoria: string
          conteudo: string
          created_at: string | null
          fonte_arquivo_nome: string | null
          fonte_arquivo_url: string | null
          fonte_tipo: string
          id: string
          imovel_id: string
          prioridade: number | null
          tags: string[] | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          conteudo: string
          created_at?: string | null
          fonte_arquivo_nome?: string | null
          fonte_arquivo_url?: string | null
          fonte_tipo: string
          id?: string
          imovel_id: string
          prioridade?: number | null
          tags?: string[] | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          conteudo?: string
          created_at?: string | null
          fonte_arquivo_nome?: string | null
          fonte_arquivo_url?: string | null
          fonte_tipo?: string
          id?: string
          imovel_id?: string
          prioridade?: number | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imovel_knowledge_base_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      integracoes: {
        Row: {
          ativa: boolean | null
          configuracoes: Json | null
          construtora_id: string | null
          created_at: string | null
          credenciais: Json | null
          descricao: string | null
          erro_ultima_tentativa: string | null
          id: string
          imobiliaria_id: string | null
          nome_exibicao: string | null
          proxima_sincronizacao: string | null
          tipo_integracao: string
          total_eventos_enviados: number | null
          ultima_sincronizacao: string | null
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          configuracoes?: Json | null
          construtora_id?: string | null
          created_at?: string | null
          credenciais?: Json | null
          descricao?: string | null
          erro_ultima_tentativa?: string | null
          id?: string
          imobiliaria_id?: string | null
          nome_exibicao?: string | null
          proxima_sincronizacao?: string | null
          tipo_integracao: string
          total_eventos_enviados?: number | null
          ultima_sincronizacao?: string | null
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          configuracoes?: Json | null
          construtora_id?: string | null
          created_at?: string | null
          credenciais?: Json | null
          descricao?: string | null
          erro_ultima_tentativa?: string | null
          id?: string
          imobiliaria_id?: string | null
          nome_exibicao?: string | null
          proxima_sincronizacao?: string | null
          tipo_integracao?: string
          total_eventos_enviados?: number | null
          ultima_sincronizacao?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integracoes_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integracoes_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integracoes_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          access_id: string | null
          construtora_id: string | null
          created_at: string | null
          email: string
          estagio_pipeline: string | null
          id: string
          imobiliaria_id: string | null
          imovel_id: string
          mensagem: string | null
          nome: string
          orcamento: number | null
          origem: Database["public"]["Enums"]["lead_origem"] | null
          origem_detalhada: string | null
          prazo_compra: string | null
          responsavel_id: string | null
          responsavel_nome: string | null
          score_qualificacao: number | null
          status: Database["public"]["Enums"]["lead_status"] | null
          tags: Json | null
          telefone: string | null
          ultimo_contato: string | null
        }
        Insert: {
          access_id?: string | null
          construtora_id?: string | null
          created_at?: string | null
          email: string
          estagio_pipeline?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id: string
          mensagem?: string | null
          nome: string
          orcamento?: number | null
          origem?: Database["public"]["Enums"]["lead_origem"] | null
          origem_detalhada?: string | null
          prazo_compra?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          score_qualificacao?: number | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: Json | null
          telefone?: string | null
          ultimo_contato?: string | null
        }
        Update: {
          access_id?: string | null
          construtora_id?: string | null
          created_at?: string | null
          email?: string
          estagio_pipeline?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string
          mensagem?: string | null
          nome?: string
          orcamento?: number | null
          origem?: Database["public"]["Enums"]["lead_origem"] | null
          origem_detalhada?: string | null
          prazo_compra?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          score_qualificacao?: number | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: Json | null
          telefone?: string | null
          ultimo_contato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_access_id_fkey"
            columns: ["access_id"]
            isOneToOne: false
            referencedRelation: "imobiliaria_imovel_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      midias_pendentes: {
        Row: {
          access_id: string
          alt: string | null
          created_at: string | null
          enviado_em: string | null
          id: string
          imobiliaria_id: string
          imovel_id: string
          motivo_rejeicao: string | null
          nome_arquivo_original: string | null
          revisado_em: string | null
          revisado_por: string | null
          status: Database["public"]["Enums"]["midia_status"] | null
          tamanho_bytes: number | null
          tipo: Database["public"]["Enums"]["midia_tipo"]
          url: string
          video_tipo: string | null
        }
        Insert: {
          access_id: string
          alt?: string | null
          created_at?: string | null
          enviado_em?: string | null
          id?: string
          imobiliaria_id: string
          imovel_id: string
          motivo_rejeicao?: string | null
          nome_arquivo_original?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: Database["public"]["Enums"]["midia_status"] | null
          tamanho_bytes?: number | null
          tipo: Database["public"]["Enums"]["midia_tipo"]
          url: string
          video_tipo?: string | null
        }
        Update: {
          access_id?: string
          alt?: string | null
          created_at?: string | null
          enviado_em?: string | null
          id?: string
          imobiliaria_id?: string
          imovel_id?: string
          motivo_rejeicao?: string | null
          nome_arquivo_original?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: Database["public"]["Enums"]["midia_status"] | null
          tamanho_bytes?: number | null
          tipo?: Database["public"]["Enums"]["midia_tipo"]
          url?: string
          video_tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "midias_pendentes_access_id_fkey"
            columns: ["access_id"]
            isOneToOne: false
            referencedRelation: "imobiliaria_imovel_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "midias_pendentes_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "midias_pendentes_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "midias_pendentes_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_lead: {
        Row: {
          anexos: Json | null
          autor_id: string | null
          autor_nome: string | null
          conteudo: string
          created_at: string | null
          id: string
          lead_id: string
          privada: boolean | null
          updated_at: string | null
        }
        Insert: {
          anexos?: Json | null
          autor_id?: string | null
          autor_nome?: string | null
          conteudo: string
          created_at?: string | null
          id?: string
          lead_id: string
          privada?: boolean | null
          updated_at?: string | null
        }
        Update: {
          anexos?: Json | null
          autor_id?: string | null
          autor_nome?: string | null
          conteudo?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          privada?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_lead_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      pageviews: {
        Row: {
          access_id: string | null
          created_at: string | null
          id: string
          imobiliaria_id: string | null
          imovel_id: string
          ip_address: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          access_id?: string | null
          created_at?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          access_id?: string | null
          created_at?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pageviews_access_id_fkey"
            columns: ["access_id"]
            isOneToOne: false
            referencedRelation: "imobiliaria_imovel_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas_compra: {
        Row: {
          assinatura_proponente: string | null
          cnh_url: string | null
          codigo: string
          construtora_id: string | null
          cpf_cnpj: string
          created_at: string | null
          email: string | null
          endereco_resumido: string | null
          feedback_id: string | null
          financiamento: string | null
          forma_aceite: string | null
          id: string
          imobiliaria_id: string | null
          imovel_id: string | null
          matricula: string | null
          moeda: string | null
          nome_completo: string
          outras_condicoes: string | null
          parcelas: string | null
          sinal_entrada: string | null
          status: string | null
          telefone: string
          unidade: string | null
          updated_at: string | null
          validade_proposta: string | null
          valor_ofertado: number | null
        }
        Insert: {
          assinatura_proponente?: string | null
          cnh_url?: string | null
          codigo: string
          construtora_id?: string | null
          cpf_cnpj: string
          created_at?: string | null
          email?: string | null
          endereco_resumido?: string | null
          feedback_id?: string | null
          financiamento?: string | null
          forma_aceite?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string | null
          matricula?: string | null
          moeda?: string | null
          nome_completo: string
          outras_condicoes?: string | null
          parcelas?: string | null
          sinal_entrada?: string | null
          status?: string | null
          telefone: string
          unidade?: string | null
          updated_at?: string | null
          validade_proposta?: string | null
          valor_ofertado?: number | null
        }
        Update: {
          assinatura_proponente?: string | null
          cnh_url?: string | null
          codigo?: string
          construtora_id?: string | null
          cpf_cnpj?: string
          created_at?: string | null
          email?: string | null
          endereco_resumido?: string | null
          feedback_id?: string | null
          financiamento?: string | null
          forma_aceite?: string | null
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string | null
          matricula?: string | null
          moeda?: string | null
          nome_completo?: string
          outras_condicoes?: string | null
          parcelas?: string | null
          sinal_entrada?: string | null
          status?: string | null
          telefone?: string
          unidade?: string | null
          updated_at?: string | null
          validade_proposta?: string | null
          valor_ofertado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_compra_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_compra_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks_visitas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_compra_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks_visitas_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_compra_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_compra_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_compra_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string | null
          function_name: string
          id: string
          identifier: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          function_name: string
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          function_name?: string
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          construtora_id: string | null
          created_at: string | null
          data_conclusao: string | null
          data_vencimento: string | null
          descricao: string | null
          id: string
          imobiliaria_id: string | null
          lead_id: string | null
          notificacao_enviada: boolean | null
          notificar_em: string | null
          prioridade: string | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          construtora_id?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          imobiliaria_id?: string | null
          lead_id?: string | null
          notificacao_enviada?: boolean | null
          notificar_em?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          construtora_id?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          imobiliaria_id?: string | null
          lead_id?: string | null
          notificacao_enviada?: boolean | null
          notificar_em?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          agendamento_id: string | null
          construtora_id: string | null
          conteudo: string | null
          created_at: string
          entregue_em: string | null
          enviado_em: string | null
          erro: string | null
          id: string
          imobiliaria_id: string | null
          lead_id: string | null
          lido_em: string | null
          modo_envio: string
          nome_destino: string | null
          status: string
          telefone_destino: string
          template_name: string | null
          tipo_mensagem: string
          updated_at: string
          wamid: string | null
        }
        Insert: {
          agendamento_id?: string | null
          construtora_id?: string | null
          conteudo?: string | null
          created_at?: string
          entregue_em?: string | null
          enviado_em?: string | null
          erro?: string | null
          id?: string
          imobiliaria_id?: string | null
          lead_id?: string | null
          lido_em?: string | null
          modo_envio?: string
          nome_destino?: string | null
          status?: string
          telefone_destino: string
          template_name?: string | null
          tipo_mensagem?: string
          updated_at?: string
          wamid?: string | null
        }
        Update: {
          agendamento_id?: string | null
          construtora_id?: string | null
          conteudo?: string | null
          created_at?: string
          entregue_em?: string | null
          enviado_em?: string | null
          erro?: string | null
          id?: string
          imobiliaria_id?: string | null
          lead_id?: string | null
          lido_em?: string | null
          modo_envio?: string
          nome_destino?: string | null
          status?: string
          telefone_destino?: string
          template_name?: string | null
          tipo_mensagem?: string
          updated_at?: string
          wamid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_visitas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      feedbacks_visitas_publico: {
        Row: {
          assinatura_cliente: string | null
          assinatura_cliente_data: string | null
          avaliacao_acabamento: number | null
          avaliacao_atendimento: number | null
          avaliacao_custo_beneficio: number | null
          avaliacao_layout: number | null
          avaliacao_localizacao: number | null
          cliente_email: string | null
          cliente_nome: string | null
          construtora_id: string | null
          corretor_nome: string | null
          data_visita: string | null
          feedback_cliente_em: string | null
          id: string | null
          imobiliaria_id: string | null
          imovel_id: string | null
          interesse_compra:
            | Database["public"]["Enums"]["interesse_compra"]
            | null
          nps_cliente: number | null
          objecoes: Json | null
          objecoes_detalhes: string | null
          pdf_url: string | null
          pontos_negativos: string | null
          pontos_positivos: string | null
          respostas_cliente_customizadas: Json | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          sugestoes: string | null
          token_acesso_cliente: string | null
        }
        Insert: {
          assinatura_cliente?: string | null
          assinatura_cliente_data?: string | null
          avaliacao_acabamento?: number | null
          avaliacao_atendimento?: number | null
          avaliacao_custo_beneficio?: number | null
          avaliacao_layout?: number | null
          avaliacao_localizacao?: number | null
          cliente_email?: string | null
          cliente_nome?: string | null
          construtora_id?: string | null
          corretor_nome?: string | null
          data_visita?: string | null
          feedback_cliente_em?: string | null
          id?: string | null
          imobiliaria_id?: string | null
          imovel_id?: string | null
          interesse_compra?:
            | Database["public"]["Enums"]["interesse_compra"]
            | null
          nps_cliente?: number | null
          objecoes?: Json | null
          objecoes_detalhes?: string | null
          pdf_url?: string | null
          pontos_negativos?: string | null
          pontos_positivos?: string | null
          respostas_cliente_customizadas?: Json | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          sugestoes?: string | null
          token_acesso_cliente?: string | null
        }
        Update: {
          assinatura_cliente?: string | null
          assinatura_cliente_data?: string | null
          avaliacao_acabamento?: number | null
          avaliacao_atendimento?: number | null
          avaliacao_custo_beneficio?: number | null
          avaliacao_layout?: number | null
          avaliacao_localizacao?: number | null
          cliente_email?: string | null
          cliente_nome?: string | null
          construtora_id?: string | null
          corretor_nome?: string | null
          data_visita?: string | null
          feedback_cliente_em?: string | null
          id?: string | null
          imobiliaria_id?: string | null
          imovel_id?: string | null
          interesse_compra?:
            | Database["public"]["Enums"]["interesse_compra"]
            | null
          nps_cliente?: number | null
          objecoes?: Json | null
          objecoes_detalhes?: string | null
          pdf_url?: string | null
          pontos_negativos?: string | null
          pontos_positivos?: string | null
          respostas_cliente_customizadas?: Json | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          sugestoes?: string | null
          token_acesso_cliente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_visitas_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_visitas_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_visitas_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_visitas_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      imobiliarias_public: {
        Row: {
          cor_primaria: string | null
          creci: string | null
          favicon_url: string | null
          id: string | null
          instagram_url: string | null
          logo_url: string | null
          nome_empresa: string | null
          site_url: string | null
        }
        Insert: {
          cor_primaria?: string | null
          creci?: string | null
          favicon_url?: string | null
          id?: string | null
          instagram_url?: string | null
          logo_url?: string | null
          nome_empresa?: string | null
          site_url?: string | null
        }
        Update: {
          cor_primaria?: string | null
          creci?: string | null
          favicon_url?: string | null
          id?: string | null
          instagram_url?: string | null
          logo_url?: string | null
          nome_empresa?: string | null
          site_url?: string | null
        }
        Relationships: []
      }
      mv_leads_diario: {
        Row: {
          dia: string | null
          imobiliaria_id: string | null
          imovel_id: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_pageviews_diario: {
        Row: {
          dia: string | null
          imobiliaria_id: string | null
          imovel_id: string | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pageviews_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_and_increment_rate_limit: {
        Args: {
          p_function_name: string
          p_identifier: string
          p_max_requests: number
          p_window_seconds: number
        }
        Returns: Json
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      generate_visit_code: { Args: never; Returns: string }
      get_construtora_id: { Args: { _user_id: string }; Returns: string }
      get_feedback_by_token: {
        Args: { p_token: string }
        Returns: {
          assinatura_cliente: string | null
          assinatura_cliente_data: string | null
          avaliacao_acabamento: number | null
          avaliacao_atendimento: number | null
          avaliacao_custo_beneficio: number | null
          avaliacao_layout: number | null
          avaliacao_localizacao: number | null
          cliente_email: string | null
          cliente_nome: string | null
          construtora_id: string | null
          corretor_nome: string | null
          data_visita: string | null
          feedback_cliente_em: string | null
          id: string | null
          imobiliaria_id: string | null
          imovel_id: string | null
          interesse_compra:
            | Database["public"]["Enums"]["interesse_compra"]
            | null
          nps_cliente: number | null
          objecoes: Json | null
          objecoes_detalhes: string | null
          pdf_url: string | null
          pontos_negativos: string | null
          pontos_positivos: string | null
          respostas_cliente_customizadas: Json | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          sugestoes: string | null
          token_acesso_cliente: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "feedbacks_visitas_publico"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_ficha_for_signature: {
        Args: { p_codigo: string }
        Returns: {
          assinatura_corretor: string
          assinatura_visitante: string
          codigo: string
          corretor_nome: string
          data_visita: string
          endereco_imovel: string
          id: string
          status: string
        }[]
      }
      get_imobiliaria_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      imobiliaria_has_access: { Args: { _imovel_id: string }; Returns: boolean }
      refresh_analytics_views: { Args: never; Returns: undefined }
      save_ficha_signature: {
        Args: { p_assinatura: string; p_codigo: string; p_tipo: string }
        Returns: boolean
      }
      submit_client_feedback:
        | {
            Args: {
              p_assinatura_cliente: string
              p_assinatura_cliente_device: string
              p_avaliacao_acabamento: number
              p_avaliacao_atendimento: number
              p_avaliacao_custo_beneficio: number
              p_avaliacao_layout: number
              p_avaliacao_localizacao: number
              p_efeito_uau: string[]
              p_efeito_uau_detalhe: string
              p_forma_pagamento_cliente: string
              p_interesse_compra: Database["public"]["Enums"]["interesse_compra"]
              p_nps_cliente: number
              p_objecoes: Json
              p_objecoes_detalhes: string
              p_orcamento_cliente: number
              p_pontos_negativos: string
              p_pontos_positivos: string
              p_prazo_compra_cliente: string
              p_proximos_passos_cliente: string
              p_respostas_cliente_customizadas?: Json
              p_sugestoes: string
              p_token: string
            }
            Returns: string
          }
        | {
            Args: {
              p_assinatura_cliente: string
              p_assinatura_cliente_device: string
              p_avaliacao_acabamento: number
              p_avaliacao_atendimento: number
              p_avaliacao_custo_beneficio: number
              p_avaliacao_layout: number
              p_avaliacao_localizacao: number
              p_efeito_uau: string[]
              p_efeito_uau_detalhe: string
              p_forma_pagamento_cliente: string
              p_interesse_compra: Database["public"]["Enums"]["interesse_compra"]
              p_nps_cliente: number
              p_objecoes: Json
              p_objecoes_detalhes: string
              p_orcamento_cliente: number
              p_percepcao_valor?: string
              p_pontos_negativos: string
              p_pontos_positivos: string
              p_prazo_compra_cliente: string
              p_proximos_passos_cliente: string
              p_respostas_cliente_customizadas?: Json
              p_sugestoes: string
              p_token: string
            }
            Returns: string
          }
      submit_proposta_compra: {
        Args: {
          p_assinatura_proponente?: string
          p_cnh_url?: string
          p_cpf_cnpj: string
          p_email?: string
          p_endereco_resumido?: string
          p_financiamento?: string
          p_matricula?: string
          p_nome_completo: string
          p_outras_condicoes?: string
          p_parcelas?: string
          p_sinal_entrada?: string
          p_telefone: string
          p_token: string
          p_unidade?: string
          p_validade_proposta?: string
          p_valor_ofertado?: number
        }
        Returns: string
      }
      user_owns_imovel: { Args: { _imovel_id: string }; Returns: boolean }
      validate_feedback_token: {
        Args: { _feedback_id: string; _token: string }
        Returns: boolean
      }
    }
    Enums: {
      access_status: "active" | "revoked"
      agendamento_status:
        | "pendente"
        | "confirmado"
        | "realizado"
        | "cancelado"
        | "remarcado"
      app_role: "construtora" | "imobiliaria" | "admin"
      construtora_status: "active" | "suspended" | "cancelled"
      empreendimento_status:
        | "em_lancamento"
        | "em_construcao"
        | "pronto_para_morar"
      feedback_status:
        | "aguardando_corretor"
        | "aguardando_cliente"
        | "completo"
        | "arquivado"
      imovel_status: "ativo" | "vendido" | "inativo"
      interesse_compra:
        | "muito_interessado"
        | "interessado"
        | "pouco_interessado"
        | "sem_interesse"
      lead_origem: "formulario" | "whatsapp" | "chat_ia"
      lead_status:
        | "novo"
        | "contatado"
        | "qualificado"
        | "visita_agendada"
        | "perdido"
      midia_status: "pendente" | "aprovado" | "rejeitado"
      midia_tipo: "imagem" | "video"
      plano_construtora: "start" | "pro" | "enterprise"
      poder_decisao: "total" | "parcial" | "nenhum"
      prazo_compra:
        | "0-3_meses"
        | "3-6_meses"
        | "6-12_meses"
        | "acima_12_meses"
        | "indefinido"
      qualificacao_lead: "quente" | "morno" | "frio"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_status: ["active", "revoked"],
      agendamento_status: [
        "pendente",
        "confirmado",
        "realizado",
        "cancelado",
        "remarcado",
      ],
      app_role: ["construtora", "imobiliaria", "admin"],
      construtora_status: ["active", "suspended", "cancelled"],
      empreendimento_status: [
        "em_lancamento",
        "em_construcao",
        "pronto_para_morar",
      ],
      feedback_status: [
        "aguardando_corretor",
        "aguardando_cliente",
        "completo",
        "arquivado",
      ],
      imovel_status: ["ativo", "vendido", "inativo"],
      interesse_compra: [
        "muito_interessado",
        "interessado",
        "pouco_interessado",
        "sem_interesse",
      ],
      lead_origem: ["formulario", "whatsapp", "chat_ia"],
      lead_status: [
        "novo",
        "contatado",
        "qualificado",
        "visita_agendada",
        "perdido",
      ],
      midia_status: ["pendente", "aprovado", "rejeitado"],
      midia_tipo: ["imagem", "video"],
      plano_construtora: ["start", "pro", "enterprise"],
      poder_decisao: ["total", "parcial", "nenhum"],
      prazo_compra: [
        "0-3_meses",
        "3-6_meses",
        "6-12_meses",
        "acima_12_meses",
        "indefinido",
      ],
      qualificacao_lead: ["quente", "morno", "frio"],
    },
  },
} as const
