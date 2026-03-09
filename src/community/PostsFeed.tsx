import { PostCard } from './PostCard';
import { EmptyState } from './EmptyState';
import type { Post } from './types';

interface PostsFeedProps {
  posts: Post[];
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onComment: (id: string) => void;
  onBookmark: (id: string) => void;
}

export function PostsFeed({ posts, onUpvote, onDownvote, onComment, onBookmark }: PostsFeedProps) {
  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onUpvote={onUpvote}
          onDownvote={onDownvote}
          onComment={onComment}
          onBookmark={onBookmark}
        />
      ))}
    </div>
  );
}
