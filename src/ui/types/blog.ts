// src/types/blog.ts
export interface Blog {
  id: string;
  title: string;
  content: string;
  author_email: string;
  created_at: string;
  updated_at?: string;
}
