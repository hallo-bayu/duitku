export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          daily_budget: number;
          personality: string;
          streak_days: number;
          total_safe_days: number;
          total_over_days: number;
          last_active_date: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          daily_budget?: number;
          personality?: string;
          streak_days?: number;
          total_safe_days?: number;
          total_over_days?: number;
          last_active_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          daily_budget?: number;
          personality?: string;
          streak_days?: number;
          total_safe_days?: number;
          total_over_days?: number;
          last_active_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          description: string;
          raw_input: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          category: string;
          description: string;
          raw_input: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          category?: string;
          description?: string;
          raw_input?: string;
          date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_summaries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          total_spent: number;
          budget: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          total_spent: number;
          budget: number;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          total_spent?: number;
          budget?: number;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_summaries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
