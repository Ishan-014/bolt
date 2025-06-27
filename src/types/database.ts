export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_profiles: {
        Row: {
          id: string
          user_id: string
          monthly_income: number | null
          monthly_expenses: number | null
          savings_goal: number | null
          risk_tolerance: 'low' | 'medium' | 'high' | null
          investment_experience: 'beginner' | 'intermediate' | 'advanced' | null
          financial_goals: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          monthly_income?: number | null
          monthly_expenses?: number | null
          savings_goal?: number | null
          risk_tolerance?: 'low' | 'medium' | 'high' | null
          investment_experience?: 'beginner' | 'intermediate' | 'advanced' | null
          financial_goals?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          monthly_income?: number | null
          monthly_expenses?: number | null
          savings_goal?: number | null
          risk_tolerance?: 'low' | 'medium' | 'high' | null
          investment_experience?: 'beginner' | 'intermediate' | 'advanced' | null
          financial_goals?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          tavus_conversation_id: string | null
          title: string | null
          status: 'active' | 'ended' | 'error'
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tavus_conversation_id?: string | null
          title?: string | null
          status?: 'active' | 'ended' | 'error'
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tavus_conversation_id?: string | null
          title?: string | null
          status?: 'active' | 'ended' | 'error'
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conversation_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          message_type: 'text' | 'voice' | 'system'
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          message_type?: 'text' | 'voice' | 'system'
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant'
          content?: string
          message_type?: 'text' | 'voice' | 'system'
          timestamp?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      financial_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: 'budget' | 'investment' | 'savings' | 'debt' | 'general'
          title: string
          content: string
          priority: 'low' | 'medium' | 'high'
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          insight_type: 'budget' | 'investment' | 'savings' | 'debt' | 'general'
          title: string
          content: string
          priority?: 'low' | 'medium' | 'high'
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          insight_type?: 'budget' | 'investment' | 'savings' | 'debt' | 'general'
          title?: string
          content?: string
          priority?: 'low' | 'medium' | 'high'
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_insights_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_files: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          upload_date: string
          description: string | null
          category: 'document' | 'image' | 'spreadsheet' | 'other'
          is_processed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          upload_date?: string
          description?: string | null
          category?: 'document' | 'image' | 'spreadsheet' | 'other'
          is_processed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          upload_date?: string
          description?: string | null
          category?: 'document' | 'image' | 'spreadsheet' | 'other'
          is_processed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_files_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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