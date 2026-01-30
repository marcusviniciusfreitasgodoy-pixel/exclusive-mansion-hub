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
      construtoras: {
        Row: {
          cnpj: string
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string | null
          dominio_customizado: string | null
          id: string
          logo_url: string | null
          nome_empresa: string
          plano: Database["public"]["Enums"]["plano_construtora"] | null
          status: Database["public"]["Enums"]["construtora_status"] | null
          user_id: string
        }
        Insert: {
          cnpj: string
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          dominio_customizado?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa: string
          plano?: Database["public"]["Enums"]["plano_construtora"] | null
          status?: Database["public"]["Enums"]["construtora_status"] | null
          user_id: string
        }
        Update: {
          cnpj?: string
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          dominio_customizado?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa?: string
          plano?: Database["public"]["Enums"]["plano_construtora"] | null
          status?: Database["public"]["Enums"]["construtora_status"] | null
          user_id?: string
        }
        Relationships: []
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
          created_at: string | null
          data_followup: string | null
          data_visita: string
          documento_hash: string | null
          duracao_minutos: number | null
          feedback_cliente_em: string | null
          feedback_corretor_em: string | null
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
          orcamento_disponivel: number | null
          pdf_gerado_em: string | null
          pdf_url: string | null
          poder_decisao: Database["public"]["Enums"]["poder_decisao"] | null
          poder_decisao_detalhes: string | null
          pontos_negativos: string | null
          pontos_positivos: string | null
          prazo_compra: Database["public"]["Enums"]["prazo_compra"] | null
          proximos_passos: string | null
          qualificacao_lead:
            | Database["public"]["Enums"]["qualificacao_lead"]
            | null
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
          created_at?: string | null
          data_followup?: string | null
          data_visita: string
          documento_hash?: string | null
          duracao_minutos?: number | null
          feedback_cliente_em?: string | null
          feedback_corretor_em?: string | null
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
          orcamento_disponivel?: number | null
          pdf_gerado_em?: string | null
          pdf_url?: string | null
          poder_decisao?: Database["public"]["Enums"]["poder_decisao"] | null
          poder_decisao_detalhes?: string | null
          pontos_negativos?: string | null
          pontos_positivos?: string | null
          prazo_compra?: Database["public"]["Enums"]["prazo_compra"] | null
          proximos_passos?: string | null
          qualificacao_lead?:
            | Database["public"]["Enums"]["qualificacao_lead"]
            | null
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
          created_at?: string | null
          data_followup?: string | null
          data_visita?: string
          documento_hash?: string | null
          duracao_minutos?: number | null
          feedback_cliente_em?: string | null
          feedback_corretor_em?: string | null
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
          orcamento_disponivel?: number | null
          pdf_gerado_em?: string | null
          pdf_url?: string | null
          poder_decisao?: Database["public"]["Enums"]["poder_decisao"] | null
          poder_decisao_detalhes?: string | null
          pontos_negativos?: string | null
          pontos_positivos?: string | null
          prazo_compra?: Database["public"]["Enums"]["prazo_compra"] | null
          proximos_passos?: string | null
          qualificacao_lead?:
            | Database["public"]["Enums"]["qualificacao_lead"]
            | null
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
      imobiliaria_imovel_access: {
        Row: {
          acesso_concedido_em: string | null
          id: string
          imobiliaria_id: string
          imovel_id: string
          status: Database["public"]["Enums"]["access_status"] | null
          url_slug: string
          visitas: number | null
        }
        Insert: {
          acesso_concedido_em?: string | null
          id?: string
          imobiliaria_id: string
          imovel_id: string
          status?: Database["public"]["Enums"]["access_status"] | null
          url_slug: string
          visitas?: number | null
        }
        Update: {
          acesso_concedido_em?: string | null
          id?: string
          imobiliaria_id?: string
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
          email_contato: string | null
          id: string
          logo_url: string | null
          nome_empresa: string
          telefone: string | null
          user_id: string
        }
        Insert: {
          cor_primaria?: string | null
          created_at?: string | null
          creci: string
          email_contato?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa: string
          telefone?: string | null
          user_id: string
        }
        Update: {
          cor_primaria?: string | null
          created_at?: string | null
          creci?: string
          email_contato?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa?: string
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      imoveis: {
        Row: {
          amenities: Json | null
          area_privativa: number | null
          area_total: number | null
          bairro: string | null
          banheiros: number | null
          cep: string | null
          cidade: string | null
          condicoes_pagamento: string | null
          condominio: number | null
          construtora_id: string
          created_at: string | null
          descricao: string | null
          diferenciais: Json | null
          endereco: string | null
          estado: string | null
          features_exterior: Json | null
          features_interior: Json | null
          headline: string | null
          id: string
          imagens: Json | null
          iptu: number | null
          latitude: number | null
          listing_code: string | null
          longitude: number | null
          lot_size: number | null
          lot_size_unit: string | null
          memorial_descritivo: string | null
          parking_spaces: number | null
          price_on_request: boolean | null
          price_secondary: number | null
          price_secondary_currency: string | null
          property_type: string | null
          status: Database["public"]["Enums"]["imovel_status"] | null
          suites: number | null
          titulo: string
          tour_360_url: string | null
          updated_at: string | null
          vagas: number | null
          valor: number | null
          videos: Json | null
          year_built: number | null
        }
        Insert: {
          amenities?: Json | null
          area_privativa?: number | null
          area_total?: number | null
          bairro?: string | null
          banheiros?: number | null
          cep?: string | null
          cidade?: string | null
          condicoes_pagamento?: string | null
          condominio?: number | null
          construtora_id: string
          created_at?: string | null
          descricao?: string | null
          diferenciais?: Json | null
          endereco?: string | null
          estado?: string | null
          features_exterior?: Json | null
          features_interior?: Json | null
          headline?: string | null
          id?: string
          imagens?: Json | null
          iptu?: number | null
          latitude?: number | null
          listing_code?: string | null
          longitude?: number | null
          lot_size?: number | null
          lot_size_unit?: string | null
          memorial_descritivo?: string | null
          parking_spaces?: number | null
          price_on_request?: boolean | null
          price_secondary?: number | null
          price_secondary_currency?: string | null
          property_type?: string | null
          status?: Database["public"]["Enums"]["imovel_status"] | null
          suites?: number | null
          titulo: string
          tour_360_url?: string | null
          updated_at?: string | null
          vagas?: number | null
          valor?: number | null
          videos?: Json | null
          year_built?: number | null
        }
        Update: {
          amenities?: Json | null
          area_privativa?: number | null
          area_total?: number | null
          bairro?: string | null
          banheiros?: number | null
          cep?: string | null
          cidade?: string | null
          condicoes_pagamento?: string | null
          condominio?: number | null
          construtora_id?: string
          created_at?: string | null
          descricao?: string | null
          diferenciais?: Json | null
          endereco?: string | null
          estado?: string | null
          features_exterior?: Json | null
          features_interior?: Json | null
          headline?: string | null
          id?: string
          imagens?: Json | null
          iptu?: number | null
          latitude?: number | null
          listing_code?: string | null
          longitude?: number | null
          lot_size?: number | null
          lot_size_unit?: string | null
          memorial_descritivo?: string | null
          parking_spaces?: number | null
          price_on_request?: boolean | null
          price_secondary?: number | null
          price_secondary_currency?: string | null
          property_type?: string | null
          status?: Database["public"]["Enums"]["imovel_status"] | null
          suites?: number | null
          titulo?: string
          tour_360_url?: string | null
          updated_at?: string | null
          vagas?: number | null
          valor?: number | null
          videos?: Json | null
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
      leads: {
        Row: {
          access_id: string | null
          created_at: string | null
          email: string
          id: string
          imobiliaria_id: string | null
          imovel_id: string
          mensagem: string | null
          nome: string
          origem: Database["public"]["Enums"]["lead_origem"] | null
          status: Database["public"]["Enums"]["lead_status"] | null
          telefone: string | null
        }
        Insert: {
          access_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          imobiliaria_id?: string | null
          imovel_id: string
          mensagem?: string | null
          nome: string
          origem?: Database["public"]["Enums"]["lead_origem"] | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          telefone?: string | null
        }
        Update: {
          access_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          imobiliaria_id?: string | null
          imovel_id?: string
          mensagem?: string | null
          nome?: string
          origem?: Database["public"]["Enums"]["lead_origem"] | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          telefone?: string | null
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
            foreignKeyName: "leads_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
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
            foreignKeyName: "pageviews_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_construtora_id: { Args: { _user_id: string }; Returns: string }
      get_imobiliaria_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      imobiliaria_has_access: { Args: { _imovel_id: string }; Returns: boolean }
      user_owns_imovel: { Args: { _imovel_id: string }; Returns: boolean }
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
