export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          emergency_contact_email: string | null
          user_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          emergency_contact_email?: string | null
          user_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          emergency_contact_email?: string | null
          user_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      safe_zones: {
        Row: {
          id: string
          user_id: string
          name: string
          latitude: number
          longitude: number
          radius: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          latitude: number
          longitude: number
          radius: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          latitude?: number
          longitude?: number
          radius?: number
          created_at?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          alert_type: string
          content: string | null
          latitude: number | null
          longitude: number | null
          is_resolved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          alert_type: string
          content?: string | null
          latitude?: number | null
          longitude?: number | null
          is_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          alert_type?: string
          content?: string | null
          latitude?: number | null
          longitude?: number | null
          is_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      analysis_history: {
        Row: {
          id: string
          user_id: string
          analysis_type: string
          content: string | null
          result: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_type: string
          content?: string | null
          result?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_type?: string
          content?: string | null
          result?: Json | null
          created_at?: string
        }
      }
    }
  }
}
