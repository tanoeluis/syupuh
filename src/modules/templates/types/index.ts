
export interface TemplateListProps {
  searchQuery?: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  image?: string;
  thumbnail?: string;
  category: string;
  downloadCount: number;
  viewCount?: number;
  price?: number;
  demoUrl?: string;
  isPublic?: boolean;
  download_url?: string;
  download_count?: number;
  slug: string;
  preview_url?: string;
  github_url?: string;
  tech_stack?: string[];
  is_premium?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  admin_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
  user?: {
    full_name?: string;
    avatar_url?: string;
    username?: string;
  }
}

// Define chat message table structure from the database
export interface ChatMessageTable {
  id: string;
  user_id: string;
  admin_id?: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}
