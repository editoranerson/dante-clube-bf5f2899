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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      associates: {
        Row: {
          avatar_url: string | null
          created_at: string
          dante_avatar_id: string | null
          email: string
          full_name: string
          id: string
          main_user_id: string
          member_number: number
          status: string
          validation_code: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          dante_avatar_id?: string | null
          email?: string
          full_name?: string
          id?: string
          main_user_id: string
          member_number?: number
          status?: string
          validation_code?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          dante_avatar_id?: string | null
          email?: string
          full_name?: string
          id?: string
          main_user_id?: string
          member_number?: number
          status?: string
          validation_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "associates_dante_avatar_id_fkey"
            columns: ["dante_avatar_id"]
            isOneToOne: false
            referencedRelation: "dante_avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      dante_avatars: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_default: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_default?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_default?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      missions: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          platform: string
          reward: string
          sort_order: number
          steps: string[]
          title: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          platform?: string
          reward?: string
          sort_order?: number
          steps?: string[]
          title: string
          url?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          platform?: string
          reward?: string
          sort_order?: number
          steps?: string[]
          title?: string
          url?: string
        }
        Relationships: []
      }
      offer_coupons: {
        Row: {
          assigned_at: string | null
          associate_id: string | null
          code: string
          created_at: string
          id: string
          offer_id: string
        }
        Insert: {
          assigned_at?: string | null
          associate_id?: string | null
          code: string
          created_at?: string
          id?: string
          offer_id: string
        }
        Update: {
          assigned_at?: string | null
          associate_id?: string | null
          code?: string
          created_at?: string
          id?: string
          offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_coupons_associate_id_fkey"
            columns: ["associate_id"]
            isOneToOne: false
            referencedRelation: "associates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_coupons_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          action_type: string
          action_url: string | null
          active: boolean
          address: string | null
          category_id: string | null
          coupon_code: string | null
          coupon_mode: string
          cover_url: string | null
          created_at: string
          description: string
          discount_label: string
          featured: boolean
          id: string
          store_id: string
          title: string
        }
        Insert: {
          action_type?: string
          action_url?: string | null
          active?: boolean
          address?: string | null
          category_id?: string | null
          coupon_code?: string | null
          coupon_mode?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          discount_label?: string
          featured?: boolean
          id?: string
          store_id: string
          title: string
        }
        Update: {
          action_type?: string
          action_url?: string | null
          active?: boolean
          address?: string | null
          category_id?: string | null
          coupon_code?: string | null
          coupon_mode?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          discount_label?: string
          featured?: boolean
          id?: string
          store_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value?: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          created_at: string
          description: string
          id: string
          logo_url: string | null
          name: string
          owner_email: string | null
          owner_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_email?: string | null
          owner_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_email?: string | null
          owner_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      claim_offer_coupon: {
        Args: { _associate_id: string; _offer_id: string }
        Returns: string
      }
      coupon_stock: {
        Args: { _offer_ids: string[] }
        Returns: {
          available: number
          offer_id: string
          total: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_offer: { Args: { _offer_id: string }; Returns: boolean }
      owns_store: { Args: { _store_id: string }; Returns: boolean }
      public_validate: {
        Args: { _code: string }
        Returns: {
          first_name: string
          member_number: number
          since: string
          status: string
        }[]
      }
      validate_associate: {
        Args: { _query: string }
        Returns: {
          full_name: string
          member_number: number
          since: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "partner"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "partner"],
    },
  },
} as const
