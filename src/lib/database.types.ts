// Database shape generated from the My Wall Supabase project.
export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      posts: {
        Row: { id: string; author_name: string; body: string; created_at: string };
        Insert: { body: string; id?: string; author_name?: string; created_at?: string };
        Update: { body?: string; id?: string; author_name?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
