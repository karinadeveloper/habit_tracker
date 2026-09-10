export type ItemType = 'libro' | 'curso' | 'tema';

export interface Item {
  id: string;
  user_id: string;
  title: string;
  type: ItemType;
  goal: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CheckIn {
  id: string;
  user_id: string;
  item_id: string;
  day: string;
  done: boolean;
  value: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DailyWellness {
  id: string;
  user_id: string;
  day: string;
  mood: number | null;
  sleep_hours: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Profile {
  id: string;
  display_name: string | null;
  background_key: string;
  timezone: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      items: {
        Row: Item;
        Insert: Partial<Item>;
        Update: Partial<Item>;
        Relationships: [];
      };
      check_ins: {
        Row: CheckIn;
        Insert: Partial<CheckIn>;
        Update: Partial<CheckIn>;
        Relationships: [];
      };
      daily_wellness: {
        Row: DailyWellness;
        Insert: Partial<DailyWellness>;
        Update: Partial<DailyWellness>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}