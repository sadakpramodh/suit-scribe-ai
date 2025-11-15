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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alert_settings: {
        Row: {
          created_at: string | null
          email_alerts: boolean | null
          id: string
          updated_at: string | null
          user_id: string
          whatsapp_alerts: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          email_alerts?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
          whatsapp_alerts?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          email_alerts?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
          whatsapp_alerts?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      disputes: {
        Row: {
          assigned_legal_officer: string | null
          brief_facts: string | null
          category: string | null
          city: string | null
          company: string
          company_law_firm: string | null
          contingent_liability: number | null
          created_at: string
          department: string | null
          description: string | null
          dispute_type: string
          document_paths: string[] | null
          id: string
          notice_date: string
          notice_from: string
          opposite_party_law_firm: string | null
          provision_in_books: number | null
          receipt_date: string | null
          relevant_law: string | null
          relief_sought: string | null
          reply_due_date: string
          reporting_manager: string | null
          responsible_user: string
          risk_rating: Database["public"]["Enums"]["risk_rating"] | null
          state: string | null
          status: string
          sub_category: string | null
          subsidiary: string | null
          unit: string | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          assigned_legal_officer?: string | null
          brief_facts?: string | null
          category?: string | null
          city?: string | null
          company: string
          company_law_firm?: string | null
          contingent_liability?: number | null
          created_at?: string
          department?: string | null
          description?: string | null
          dispute_type: string
          document_paths?: string[] | null
          id?: string
          notice_date: string
          notice_from: string
          opposite_party_law_firm?: string | null
          provision_in_books?: number | null
          receipt_date?: string | null
          relevant_law?: string | null
          relief_sought?: string | null
          reply_due_date: string
          reporting_manager?: string | null
          responsible_user: string
          risk_rating?: Database["public"]["Enums"]["risk_rating"] | null
          state?: string | null
          status?: string
          sub_category?: string | null
          subsidiary?: string | null
          unit?: string | null
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          assigned_legal_officer?: string | null
          brief_facts?: string | null
          category?: string | null
          city?: string | null
          company?: string
          company_law_firm?: string | null
          contingent_liability?: number | null
          created_at?: string
          department?: string | null
          description?: string | null
          dispute_type?: string
          document_paths?: string[] | null
          id?: string
          notice_date?: string
          notice_from?: string
          opposite_party_law_firm?: string | null
          provision_in_books?: number | null
          receipt_date?: string | null
          relevant_law?: string | null
          relief_sought?: string | null
          reply_due_date?: string
          reporting_manager?: string | null
          responsible_user?: string
          risk_rating?: Database["public"]["Enums"]["risk_rating"] | null
          state?: string | null
          status?: string
          sub_category?: string | null
          subsidiary?: string | null
          unit?: string | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      litigation_cases: {
        Row: {
          amount_involved: number | null
          authorized_signatory: string | null
          bench: string | null
          case_type: Database["public"]["Enums"]["case_type"] | null
          case_year: number | null
          city: string | null
          cnr_number: string | null
          company_law_firm: string | null
          contingent_liability: number | null
          court_type: Database["public"]["Enums"]["court_type"] | null
          created_at: string
          district: string | null
          forum: string
          id: string
          interest_amount: number | null
          issues: string | null
          kmp_involved: boolean | null
          last_hearing_date: string | null
          legal_nature: string | null
          legal_sub_nature: string | null
          next_hearing_date: string | null
          opposite_party_law_firm: string | null
          particular: string | null
          parties: string
          penalties: number | null
          prayers: string | null
          provision_in_books: number | null
          region: string | null
          remarks: string | null
          risk_rating: Database["public"]["Enums"]["risk_rating"] | null
          sr_no: number | null
          start_date: string | null
          state: string | null
          status: string
          subsidiary: string | null
          treatment_resolution: string | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_involved?: number | null
          authorized_signatory?: string | null
          bench?: string | null
          case_type?: Database["public"]["Enums"]["case_type"] | null
          case_year?: number | null
          city?: string | null
          cnr_number?: string | null
          company_law_firm?: string | null
          contingent_liability?: number | null
          court_type?: Database["public"]["Enums"]["court_type"] | null
          created_at?: string
          district?: string | null
          forum: string
          id?: string
          interest_amount?: number | null
          issues?: string | null
          kmp_involved?: boolean | null
          last_hearing_date?: string | null
          legal_nature?: string | null
          legal_sub_nature?: string | null
          next_hearing_date?: string | null
          opposite_party_law_firm?: string | null
          particular?: string | null
          parties: string
          penalties?: number | null
          prayers?: string | null
          provision_in_books?: number | null
          region?: string | null
          remarks?: string | null
          risk_rating?: Database["public"]["Enums"]["risk_rating"] | null
          sr_no?: number | null
          start_date?: string | null
          state?: string | null
          status?: string
          subsidiary?: string | null
          treatment_resolution?: string | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_involved?: number | null
          authorized_signatory?: string | null
          bench?: string | null
          case_type?: Database["public"]["Enums"]["case_type"] | null
          case_year?: number | null
          city?: string | null
          cnr_number?: string | null
          company_law_firm?: string | null
          contingent_liability?: number | null
          court_type?: Database["public"]["Enums"]["court_type"] | null
          created_at?: string
          district?: string | null
          forum?: string
          id?: string
          interest_amount?: number | null
          issues?: string | null
          kmp_involved?: boolean | null
          last_hearing_date?: string | null
          legal_nature?: string | null
          legal_sub_nature?: string | null
          next_hearing_date?: string | null
          opposite_party_law_firm?: string | null
          particular?: string | null
          parties?: string
          penalties?: number | null
          prayers?: string | null
          provision_in_books?: number | null
          region?: string | null
          remarks?: string | null
          risk_rating?: Database["public"]["Enums"]["risk_rating"] | null
          sr_no?: number | null
          start_date?: string | null
          state?: string | null
          status?: string
          subsidiary?: string | null
          treatment_resolution?: string | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      litigation_timeline_events: {
        Row: {
          case_id: string
          created_at: string
          event_date: string
          event_title: string
          hearing_number: number | null
          id: string
          stage_type: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          event_date: string
          event_title: string
          hearing_number?: number | null
          id?: string
          stage_type: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          event_date?: string
          event_title?: string
          hearing_number?: number | null
          id?: string
          stage_type?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "litigation_timeline_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "litigation_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved: boolean
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          approved?: boolean
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          approved?: boolean
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          granted_by: string | null
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
          user_id?: string
        }
        Relationships: []
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
      has_permission: {
        Args: {
          _permission: Database["public"]["Enums"]["app_permission"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_permission:
        | "add_dispute"
        | "delete_dispute"
        | "upload_excel_litigation"
        | "add_users"
        | "delete_users"
        | "export_reports"
      app_role: "admin" | "legal_head" | "legal_counsel" | "user"
      case_type:
        | "civil"
        | "criminal"
        | "labour"
        | "regulatory"
        | "tax"
        | "intellectual_property"
        | "corporate"
      court_type:
        | "high_court"
        | "district_court"
        | "magistrate_court"
        | "supreme_court"
        | "tribunal"
        | "arbitration"
      risk_rating: "high" | "medium" | "low"
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
      app_permission: [
        "add_dispute",
        "delete_dispute",
        "upload_excel_litigation",
        "add_users",
        "delete_users",
        "export_reports",
      ],
      app_role: ["admin", "legal_head", "legal_counsel", "user"],
      case_type: [
        "civil",
        "criminal",
        "labour",
        "regulatory",
        "tax",
        "intellectual_property",
        "corporate",
      ],
      court_type: [
        "high_court",
        "district_court",
        "magistrate_court",
        "supreme_court",
        "tribunal",
        "arbitration",
      ],
      risk_rating: ["high", "medium", "low"],
    },
  },
} as const
