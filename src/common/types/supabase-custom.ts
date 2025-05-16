
import type { Database } from "@/integrations/supabase/types";

// We can define custom types here that extend the auto-generated Supabase types
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Template = Database['public']['Tables']['templates']['Row'];

// Define the ChatMessage type for our custom chat_messages table
export interface ChatMessage {
  id: string;
  user_id: string;
  admin_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Define custom RPC function types
export interface CustomRPCFunctions {
  count_unread_admin_messages: () => Promise<{ data: number; error: any }>;
  count_unread_user_messages: (params: { user_id: string }) => Promise<{ data: number; error: any }>;
  get_users_with_messages: () => Promise<{ 
    data: Array<{
      id: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
      unread_count: number;
      last_message: string;
      last_activity: string;
    }>;
    error: any 
  }>;
  get_chat_messages_with_user: (params: { user_id_param: string }) => Promise<{ 
    data: ChatMessage[];
    error: any 
  }>;
  get_user_messages: (params: { user_id_param: string }) => Promise<{ 
    data: ChatMessage[];
    error: any 
  }>;
  mark_messages_as_read: (params: { message_ids: string[]; admin_id_param: string }) => Promise<{ 
    data: null;
    error: any 
  }>;
  mark_user_messages_as_read: (params: { message_ids: string[] }) => Promise<{ 
    data: null;
    error: any 
  }>;
  send_admin_message: (params: { to_user_id: string; message_text: string; from_admin_id: string }) => Promise<{ 
    data: string;
    error: any 
  }>;
  send_user_message: (params: { message_text: string; from_user_id: string }) => Promise<{ 
    data: string;
    error: any 
  }>;
}

// Create a custom typed rpc function with better error handling
export const typedRpc = <T extends keyof CustomRPCFunctions>(
  supabase: any,
  fn: T,
  ...args: Parameters<CustomRPCFunctions[T]>
): ReturnType<CustomRPCFunctions[T]> => {
  try {
    return supabase.rpc(fn, ...(args as any)) as any;
  } catch (error) {
    console.error(`Error calling RPC function ${fn}:`, error);
    // Return an object with error property to match the expected return type
    return { error } as any;
  }
};
