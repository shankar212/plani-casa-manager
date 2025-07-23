export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      legal_documents: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          project_id: string | null
          sector: string
          uploaded_at: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          project_id?: string | null
          sector: string
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          project_id?: string | null
          sector?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      material_suppliers: {
        Row: {
          contact_info: Json | null
          created_at: string | null
          id: string
          name: string
          project_id: string | null
          stage_id: string | null
          user_id: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
          project_id?: string | null
          stage_id?: string | null
          user_id?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          project_id?: string | null
          stage_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_suppliers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_suppliers_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string | null
          delivery_date: string | null
          estimated_total_cost: number | null
          estimated_unit_cost: number | null
          id: string
          invoice_number: string | null
          material_name: string
          notes: string | null
          project_id: string | null
          quantity: number
          requested_at: string | null
          stage_id: string | null
          status: Database["public"]["Enums"]["material_status"]
          supplier_id: string | null
          total_cost: number | null
          unit: string
          unit_cost: number | null
          updated_at: string | null
          used_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_date?: string | null
          estimated_total_cost?: number | null
          estimated_unit_cost?: number | null
          id?: string
          invoice_number?: string | null
          material_name: string
          notes?: string | null
          project_id?: string | null
          quantity: number
          requested_at?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["material_status"]
          supplier_id?: string | null
          total_cost?: number | null
          unit: string
          unit_cost?: number | null
          updated_at?: string | null
          used_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_date?: string | null
          estimated_total_cost?: number | null
          estimated_unit_cost?: number | null
          id?: string
          invoice_number?: string | null
          material_name?: string
          notes?: string | null
          project_id?: string | null
          quantity?: number
          requested_at?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["material_status"]
          supplier_id?: string | null
          total_cost?: number | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string | null
          used_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "material_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          project_id: string | null
          read: boolean
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          project_id?: string | null
          read?: boolean
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          project_id?: string | null
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_photos: {
        Row: {
          etapa_id: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_at: string
        }
        Insert: {
          etapa_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
        }
        Update: {
          etapa_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      project_stages: {
        Row: {
          actual_cost: number | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          estimated_duration_days: number | null
          id: string
          name: string
          progress_percentage: number | null
          project_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["stage_status"]
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_duration_days?: number | null
          id?: string
          name: string
          progress_percentage?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["stage_status"]
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_duration_days?: number | null
          id?: string
          name?: string
          progress_percentage?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["stage_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          stage_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          stage_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          stage_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          total_budget: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          total_budget?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          total_budget?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          contract_date: string | null
          contract_value: number
          created_at: string | null
          id: string
          name: string
          payment_status: string | null
          project_id: string | null
          service_type: string
          stage_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contract_date?: string | null
          contract_value: number
          created_at?: string | null
          id?: string
          name: string
          payment_status?: string | null
          project_id?: string | null
          service_type: string
          stage_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contract_date?: string | null
          contract_value?: number
          created_at?: string | null
          id?: string
          name?: string
          payment_status?: string | null
          project_id?: string | null
          service_type?: string
          stage_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_providers_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          project_id: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          project_id: string
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          project_id?: string
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      material_status: "requested" | "delivered" | "used"
      project_status:
        | "Pré-projeto"
        | "Projeto"
        | "Obras"
        | "Pós obra"
        | "Financiamento"
      stage_status: "finalizado" | "andamento" | "proximo"
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
      material_status: ["requested", "delivered", "used"],
      project_status: [
        "Pré-projeto",
        "Projeto",
        "Obras",
        "Pós obra",
        "Financiamento",
      ],
      stage_status: ["finalizado", "andamento", "proximo"],
    },
  },
} as const
