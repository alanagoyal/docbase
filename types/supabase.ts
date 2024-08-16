export type Entity = {
  id: string
  name: string | null
  type: "fund" | "company"
  street?: string | null
  city_state_zip?: string | null
  byline?: string | null
  state_of_incorporation?: string | null
  investor_id?: string | null
  founder_id?: string | null
}

export type ViewerData = {
  email: string
  viewed_at: string
}

export type UserInvestment = {
  id: string
  purchase_amount: string | null
  investment_type: string | null
  valuation_cap: string | null
  discount: string | null
  date: string | null
  founder: {
    id: string
    name: string | null
    title: string | null
    email: string | null
  } | null
  company: {
    id: string
    name: string | null
    street: string | null
    city_state_zip: string | null
    state_of_incorporation: string | null
  } | null
  investor: {
    id: string
    name: string | null
    title: string | null
    email: string | null
  } | null
  fund: {
    id: string
    name: string | null
    byline: string | null
    street: string | null
    city_state_zip: string | null
  } | null
  side_letter: {
    id: string
    side_letter_url: string | null
    info_rights: boolean | null
    pro_rata_rights: boolean | null
    major_investor_rights: boolean | null
    termination: boolean | null
    miscellaneous: boolean | null
  } | null
  side_letter_id: string | null
  safe_url: string | null
  summary: string | null
  created_by: string | null
  created_at: string
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
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
      contact_groups: {
        Row: {
          contact_id: string
          group_id: string
        }
        Insert: {
          contact_id: string
          group_id: string
        }
        Update: {
          contact_id?: string
          group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_groups_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      groups: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
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
      links: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires: string | null
          filename: string | null
          id: string
          password: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires?: string | null
          filename?: string | null
          id?: string
          password?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires?: string | null
          filename?: string | null
          id?: string
          password?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
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
      viewers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          link_id: string | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          link_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          link_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewers_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
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
      delete_link: {
        Args: {
          link_id: string
          auth_id: string
        }
        Returns: undefined
      }
      get_link_analytics: {
        Args: {
          link_id_arg: string
        }
        Returns: {
          all_viewers: number
          unique_viewers: number
          all_views: Json
        }[]
      }
      get_link_by_id: {
        Args: {
          link_id: string
        }
        Returns: {
          id: string
          created_at: string
          url: string
          password: string
          expires: string
          filename: string
          created_by: string
        }[]
      }
      get_user_documents: {
        Args: {
          auth_id_arg: string
        }
        Returns: {
          id: string
          document_type: string
          document_url: string
          document_name: string
          created_at: string
        }[]
      }
      get_user_investments: {
        Args: {
          auth_id_arg: string
        }
        Returns: {
          id: string
          purchase_amount: string
          investment_type: string
          valuation_cap: string
          discount: string
          date: string
          founder: Json
          company: Json
          investor: Json
          fund: Json
          side_letter: Json
          side_letter_id: string
          safe_url: string
          summary: string
          created_by: string
          created_at: string
        }[]
      }
      get_user_investments_by_id: {
        Args: {
          id_arg: string
          auth_id_arg: string
        }
        Returns: {
          id: string
          purchase_amount: string
          investment_type: string
          valuation_cap: string
          discount: string
          date: string
          founder: Json
          company: Json
          investor: Json
          fund: Json
          side_letter: Json
          side_letter_id: string
          safe_url: string
          summary: string
          created_by: string
          created_at: string
        }[]
      }
      get_user_links: {
        Args: {
          auth_id: string
        }
        Returns: {
          created_at: string | null
          created_by: string | null
          expires: string | null
          filename: string | null
          id: string
          password: string | null
          url: string | null
        }[]
      }
      get_user_links_with_views: {
        Args: {
          auth_id_arg: string
        }
        Returns: {
          id: string
          created_at: string
          created_by: string
          url: string
          password: string
          expires: string
          filename: string
          view_count: number
        }[]
      }
      select_investment_entities: {
        Args: {
          investment_id: string
        }
        Returns: {
          fund_name: string
          company_name: string
          investor_name: string
        }[]
      }
      select_link: {
        Args: {
          link_id: string
        }
        Returns: {
          id: string
          created_at: string
          url: string
          password: string
          expires: string
          filename: string
          created_by: string
          creator_name: string
        }[]
      }
      update_link: {
        Args: {
          link_id: string
          auth_id: string
          url_arg: string
          password_arg: string
          expires_arg: string
          filename_arg: string
        }
        Returns: undefined
      }
      upsert_link_data: {
        Args: {
          id_arg: string
          filename_arg: string
          url_arg: string
          created_by_arg: string
          created_at_arg: string
          password_arg: string
          expires_arg: string
          auth_id_arg: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

