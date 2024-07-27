export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          city_state_zip: string | null
          created_at: string
          founder_id: string | null
          id: string
          name: string | null
          state_of_incorporation: string | null
          street: string | null
        }
        Insert: {
          city_state_zip?: string | null
          created_at?: string
          founder_id?: string | null
          id?: string
          name?: string | null
          state_of_incorporation?: string | null
          street?: string | null
        }
        Update: {
          city_state_zip?: string | null
          created_at?: string
          founder_id?: string | null
          id?: string
          name?: string | null
          state_of_incorporation?: string | null
          street?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          byline: string | null
          city_state_zip: string | null
          created_at: string
          id: string
          investor_id: string | null
          name: string | null
          street: string | null
        }
        Insert: {
          byline?: string | null
          city_state_zip?: string | null
          created_at?: string
          id?: string
          investor_id?: string | null
          name?: string | null
          street?: string | null
        }
        Update: {
          byline?: string | null
          city_state_zip?: string | null
          created_at?: string
          id?: string
          investor_id?: string | null
          name?: string | null
          street?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funds_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          date: string | null
          discount: string | null
          founder_id: string | null
          fund_id: string | null
          id: string
          investment_type: string | null
          investor_id: string | null
          purchase_amount: string | null
          safe_url: string | null
          side_letter_id: string | null
          side_letter_url: string | null
          summary: string | null
          valuation_cap: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          discount?: string | null
          founder_id?: string | null
          fund_id?: string | null
          id?: string
          investment_type?: string | null
          investor_id?: string | null
          purchase_amount?: string | null
          safe_url?: string | null
          side_letter_id?: string | null
          side_letter_url?: string | null
          summary?: string | null
          valuation_cap?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          discount?: string | null
          founder_id?: string | null
          fund_id?: string | null
          id?: string
          investment_type?: string | null
          investor_id?: string | null
          purchase_amount?: string | null
          safe_url?: string | null
          side_letter_id?: string | null
          side_letter_url?: string | null
          summary?: string | null
          valuation_cap?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "investments_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_side_letter_id_fkey"
            columns: ["side_letter_id"]
            isOneToOne: false
            referencedRelation: "side_letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_investments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_investments_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      side_letters: {
        Row: {
          created_at: string
          id: string
          info_rights: boolean | null
          major_investor_rights: boolean | null
          miscellaneous: boolean | null
          pro_rata_rights: boolean | null
          side_letter_url: string | null
          termination: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          info_rights?: boolean | null
          major_investor_rights?: boolean | null
          miscellaneous?: boolean | null
          pro_rata_rights?: boolean | null
          side_letter_url?: string | null
          termination?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          info_rights?: boolean | null
          major_investor_rights?: boolean | null
          miscellaneous?: boolean | null
          pro_rata_rights?: boolean | null
          side_letter_url?: string | null
          termination?: boolean | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      checkIfUser: {
        Args: {
          given_mail: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
