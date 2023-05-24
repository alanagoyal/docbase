export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      links: {
        Row: {
          created_at: string | null
          download_enabled: boolean | null
          edits_enabled: boolean | null
          email_protected: boolean | null
          expires: string | null
          id: string
          password: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          download_enabled?: boolean | null
          edits_enabled?: boolean | null
          email_protected?: boolean | null
          expires?: string | null
          id?: string
          password?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          download_enabled?: boolean | null
          edits_enabled?: boolean | null
          email_protected?: boolean | null
          expires?: string | null
          id?: string
          password?: string | null
          url?: string | null
          user_id?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
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
      }
      views: {
        Row: {
          created_at: string | null
          download_count: number | null
          id: string
          last_viewed: string | null
          link_id: string | null
          view_count: number | null
          viewer_count: number | null
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          id?: string
          last_viewed?: string | null
          link_id?: string | null
          view_count?: number | null
          viewer_count?: number | null
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          id?: string
          last_viewed?: string | null
          link_id?: string | null
          view_count?: number | null
          viewer_count?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
