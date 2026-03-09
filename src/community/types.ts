export interface Post {
  id: string;
  userId?: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  createdAt?: string;
  title: string;
  description: string;
  image?: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  bookmarked: boolean;
  category: string;
}

export interface Template {
  id: string;
  title: string;
  icon: string;
  prompt?: string;
  description?: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentCommentId?: string | null;
  author: string;
  authorAvatar: string;
  timestamp: string;
  createdAt?: string;
  content: string;
}

export interface TemplatePostPayload {
  title: string;
  caption: string;
  templateId: string;
  category: string;
  imageUrl?: string;
}
