export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          bundle_id: string | null;
          created_at: string;
          day: string;
          id: string;
          teacher_id: string;
          time: string;
          user_id: string;
        };
        Insert: {
          bundle_id?: string | null;
          created_at?: string;
          day: string;
          id?: string;
          teacher_id: string;
          time: string;
          user_id: string;
        };
        Update: {
          bundle_id?: string | null;
          created_at?: string;
          day?: string;
          id?: string;
          teacher_id?: string;
          time?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_bundle_id_fkey";
            columns: ["bundle_id"];
            isOneToOne: false;
            referencedRelation: "bundles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          },
        ];
      };
      bundles: {
        Row: {
          accent: string;
          created_at: string;
          discount: number;
          id: string;
          sort: number;
          tagline: string;
          teacher_ids: string[];
          title: string;
        };
        Insert: {
          accent?: string;
          created_at?: string;
          discount?: number;
          id: string;
          sort?: number;
          tagline: string;
          teacher_ids?: string[];
          title: string;
        };
        Update: {
          accent?: string;
          created_at?: string;
          discount?: number;
          id?: string;
          sort?: number;
          tagline?: string;
          teacher_ids?: string[];
          title?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string;
          id: string;
          role: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string;
          id: string;
          role?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          role?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          rating: number;
          student_name: string;
          teacher_id: string;
          user_id: string | null;
          verified: boolean;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          rating: number;
          student_name: string;
          teacher_id: string;
          user_id?: string | null;
          verified?: boolean;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          rating?: number;
          student_name?: string;
          teacher_id?: string;
          user_id?: string | null;
          verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          },
        ];
      };
      teacher_applications: {
        Row: {
          area: string;
          bio: string;
          center_address: string;
          center_name: string;
          created_at: string;
          credential_document_path: string | null;
          curricula: string[];
          full_name: string;
          full_name_ar: string;
          governorate: string;
          grades: string[];
          id: string;
          id_document_path: string | null;
          modes: string[];
          national_id_last4: string;
          phone: string;
          platform_url: string | null;
          price_per_session: number;
          review_note: string | null;
          status: string;
          subject: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          area: string;
          bio?: string;
          center_address?: string;
          center_name?: string;
          created_at?: string;
          credential_document_path?: string | null;
          curricula?: string[];
          full_name: string;
          full_name_ar?: string;
          governorate: string;
          grades?: string[];
          id?: string;
          id_document_path?: string | null;
          modes?: string[];
          national_id_last4?: string;
          phone: string;
          platform_url?: string | null;
          price_per_session?: number;
          review_note?: string | null;
          status?: string;
          subject: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          area?: string;
          bio?: string;
          center_address?: string;
          center_name?: string;
          created_at?: string;
          credential_document_path?: string | null;
          curricula?: string[];
          full_name?: string;
          full_name_ar?: string;
          governorate?: string;
          grades?: string[];
          id?: string;
          id_document_path?: string | null;
          modes?: string[];
          national_id_last4?: string;
          phone?: string;
          platform_url?: string | null;
          price_per_session?: number;
          review_note?: string | null;
          status?: string;
          subject?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      teachers: {
        Row: {
          accent: string;
          area: string;
          bio: string;
          bio_ar: string;
          center_address: string;
          center_name: string;
          created_at: string;
          curricula: string[];
          grades: string[];
          id: string;
          manasa: string | null;
          map_query: string;
          modes: string[];
          name: string;
          name_ar: string;
          owner_id: string | null;
          platform_url: string | null;
          price_per_session: number;
          rating: number;
          region: string;
          slots: Json;
          sort: number;
          students: number;
          subject: string;
          verified: boolean;
          youtube: string | null;
        };
        Insert: {
          accent?: string;
          area: string;
          bio?: string;
          bio_ar?: string;
          center_address: string;
          center_name: string;
          created_at?: string;
          curricula?: string[];
          grades?: string[];
          id: string;
          manasa?: string | null;
          map_query: string;
          modes?: string[];
          name: string;
          name_ar?: string;
          owner_id?: string | null;
          platform_url?: string | null;
          price_per_session?: number;
          rating?: number;
          region: string;
          slots?: Json;
          sort?: number;
          students?: number;
          subject: string;
          verified?: boolean;
          youtube?: string | null;
        };
        Update: {
          accent?: string;
          area?: string;
          bio?: string;
          bio_ar?: string;
          center_address?: string;
          center_name?: string;
          created_at?: string;
          curricula?: string[];
          grades?: string[];
          id?: string;
          manasa?: string | null;
          map_query?: string;
          modes?: string[];
          name?: string;
          name_ar?: string;
          owner_id?: string | null;
          platform_url?: string | null;
          price_per_session?: number;
          rating?: number;
          region?: string;
          slots?: Json;
          sort?: number;
          students?: number;
          subject?: string;
          verified?: boolean;
          youtube?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      get_user_id_by_email: {
        Args: { _email: string };
        Returns: string;
      };
      is_student_of_owner: {
        Args: { _owner_id: string; _student_id: string };
        Returns: boolean;
      };
      owns_teacher: {
        Args: { _teacher_id: string; _user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const;
