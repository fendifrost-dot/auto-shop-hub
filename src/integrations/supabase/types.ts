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
      bonus_periods: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          month: string
          pool_amount: number
          status: Database["public"]["Enums"]["bonus_period_status"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          month: string
          pool_amount?: number
          status?: Database["public"]["Enums"]["bonus_period_status"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          month?: string
          pool_amount?: number
          status?: Database["public"]["Enums"]["bonus_period_status"]
        }
        Relationships: []
      }
      bonus_rankings: {
        Row: {
          bonus_period_id: string
          created_at: string
          disqualification_reason: string | null
          efficiency_score: number | null
          id: string
          is_eligible: boolean
          payout_amount: number | null
          quality_score: number | null
          rank: number
          revenue_score: number | null
          user_id: string
          weighted_total: number | null
        }
        Insert: {
          bonus_period_id: string
          created_at?: string
          disqualification_reason?: string | null
          efficiency_score?: number | null
          id?: string
          is_eligible?: boolean
          payout_amount?: number | null
          quality_score?: number | null
          rank: number
          revenue_score?: number | null
          user_id: string
          weighted_total?: number | null
        }
        Update: {
          bonus_period_id?: string
          created_at?: string
          disqualification_reason?: string | null
          efficiency_score?: number | null
          id?: string
          is_eligible?: boolean
          payout_amount?: number | null
          quality_score?: number | null
          rank?: number
          revenue_score?: number | null
          user_id?: string
          weighted_total?: number | null
        }
        Relationships: []
      }
      job_time_entries: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          idle_category: Database["public"]["Enums"]["idle_category"] | null
          is_idle: boolean
          job_id: string | null
          notes: string | null
          start_time: string
          time_entry_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          idle_category?: Database["public"]["Enums"]["idle_category"] | null
          is_idle?: boolean
          job_id?: string | null
          notes?: string | null
          start_time?: string
          time_entry_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          idle_category?: Database["public"]["Enums"]["idle_category"] | null
          is_idle?: boolean
          job_id?: string | null
          notes?: string | null
          start_time?: string
          time_entry_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          job_number: string
          revenue: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          vehicle_info: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          customer_name?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          job_number: string
          revenue?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          vehicle_info?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          customer_name?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          job_number?: string
          revenue?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          vehicle_info?: string | null
        }
        Relationships: []
      }
      performance_records: {
        Row: {
          created_at: string
          date: string
          details: string | null
          id: string
          recorded_by: string
          status: Database["public"]["Enums"]["performance_status"]
          summary: string
          type: Database["public"]["Enums"]["performance_record_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          details?: string | null
          id?: string
          recorded_by: string
          status?: Database["public"]["Enums"]["performance_status"]
          summary: string
          type: Database["public"]["Enums"]["performance_record_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          details?: string | null
          id?: string
          recorded_by?: string
          status?: Database["public"]["Enums"]["performance_status"]
          summary?: string
          type?: Database["public"]["Enums"]["performance_record_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          hire_date: string | null
          id: string
          is_active: boolean
          phone: string | null
          role_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_entries: {
        Row: {
          created_at: string
          entered_by: string
          goal_amount: number
          id: string
          margin_percent: number | null
          notes: string | null
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["revenue_period_type"]
          revenue_amount: number
        }
        Insert: {
          created_at?: string
          entered_by: string
          goal_amount: number
          id?: string
          margin_percent?: number | null
          notes?: string | null
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["revenue_period_type"]
          revenue_amount: number
        }
        Update: {
          created_at?: string
          entered_by?: string
          goal_amount?: number
          id?: string
          margin_percent?: number | null
          notes?: string | null
          period_end?: string
          period_start?: string
          period_type?: Database["public"]["Enums"]["revenue_period_type"]
          revenue_amount?: number
        }
        Relationships: []
      }
      time_edit_audit_log: {
        Row: {
          created_at: string
          edited_by: string
          edit_type: string
          id: string
          new_value: string | null
          old_value: string | null
          reason: string
          time_entry_id: string
        }
        Insert: {
          created_at?: string
          edited_by: string
          edit_type: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason: string
          time_entry_id: string
        }
        Update: {
          created_at?: string
          edited_by?: string
          edit_type?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string
          time_entry_id?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          clock_in: string
          clock_out: string | null
          created_at: string
          edit_reason: string | null
          edited_by: string | null
          id: string
          status: Database["public"]["Enums"]["time_entry_status"]
          total_hours: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          edit_reason?: string | null
          edited_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["time_entry_status"]
          total_hours?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          edit_reason?: string | null
          edited_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["time_entry_status"]
          total_hours?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_public_table_counts: {
        Args: never
        Returns: {
          row_count: number
          table_name: string
        }[]
      }
      has_any_shop_role: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "mechanic"
      bonus_period_status: "open" | "calculated" | "approved" | "paid"
      idle_category: "cleanup" | "meeting" | "waiting_parts" | "training" | "break" | "other"
      job_status: "pending" | "in_progress" | "completed" | "invoiced"
      performance_record_type: "review" | "incident" | "commendation" | "warning"
      performance_status: "pending" | "reviewed" | "closed"
      revenue_period_type: "daily" | "weekly" | "monthly"
      time_entry_status: "active" | "completed" | "edited"
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
      app_role: ["admin", "manager", "mechanic"] as const,
      bonus_period_status: ["open", "calculated", "approved", "paid"] as const,
      idle_category: ["cleanup", "meeting", "waiting_parts", "training", "break", "other"] as const,
      job_status: ["pending", "in_progress", "completed", "invoiced"] as const,
      performance_record_type: ["review", "incident", "commendation", "warning"] as const,
      performance_status: ["pending", "reviewed", "closed"] as const,
      revenue_period_type: ["daily", "weekly", "monthly"] as const,
      time_entry_status: ["active", "completed", "edited"] as const,
    },
  },
} as const
