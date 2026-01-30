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
          area_privativa: number | null
          area_total: number | null
          bairro: string | null
          banheiros: number | null
          cidade: string | null
          condominio: number | null
          construtora_id: string
          created_at: string | null
          descricao: string | null
          diferenciais: Json | null
          endereco: string | null
          estado: string | null
          id: string
          imagens: Json | null
          iptu: number | null
          memorial_descritivo: string | null
          status: Database["public"]["Enums"]["imovel_status"] | null
          suites: number | null
          titulo: string
          tour_360_url: string | null
          updated_at: string | null
          vagas: number | null
          valor: number | null
          videos: Json | null
        }
        Insert: {
          area_privativa?: number | null
          area_total?: number | null
          bairro?: string | null
          banheiros?: number | null
          cidade?: string | null
          condominio?: number | null
          construtora_id: string
          created_at?: string | null
          descricao?: string | null
          diferenciais?: Json | null
          endereco?: string | null
          estado?: string | null
          id?: string
          imagens?: Json | null
          iptu?: number | null
          memorial_descritivo?: string | null
          status?: Database["public"]["Enums"]["imovel_status"] | null
          suites?: number | null
          titulo: string
          tour_360_url?: string | null
          updated_at?: string | null
          vagas?: number | null
          valor?: number | null
          videos?: Json | null
        }
        Update: {
          area_privativa?: number | null
          area_total?: number | null
          bairro?: string | null
          banheiros?: number | null
          cidade?: string | null
          condominio?: number | null
          construtora_id?: string
          created_at?: string | null
          descricao?: string | null
          diferenciais?: Json | null
          endereco?: string | null
          estado?: string | null
          id?: string
          imagens?: Json | null
          iptu?: number | null
          memorial_descritivo?: string | null
          status?: Database["public"]["Enums"]["imovel_status"] | null
          suites?: number | null
          titulo?: string
          tour_360_url?: string | null
          updated_at?: string | null
          vagas?: number | null
          valor?: number | null
          videos?: Json | null
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
    }
    Enums: {
      access_status: "active" | "revoked"
      app_role: "construtora" | "imobiliaria" | "admin"
      construtora_status: "active" | "suspended" | "cancelled"
      imovel_status: "ativo" | "vendido" | "inativo"
      lead_origem: "formulario" | "whatsapp" | "chat_ia"
      lead_status:
        | "novo"
        | "contatado"
        | "qualificado"
        | "visita_agendada"
        | "perdido"
      plano_construtora: "start" | "pro" | "enterprise"
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
      app_role: ["construtora", "imobiliaria", "admin"],
      construtora_status: ["active", "suspended", "cancelled"],
      imovel_status: ["ativo", "vendido", "inativo"],
      lead_origem: ["formulario", "whatsapp", "chat_ia"],
      lead_status: [
        "novo",
        "contatado",
        "qualificado",
        "visita_agendada",
        "perdido",
      ],
      plano_construtora: ["start", "pro", "enterprise"],
    },
  },
} as const
