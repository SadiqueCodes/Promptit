import { PostCard } from './PostCard';
import type { Post } from './types';

interface PostsFeedProps {
  posts: Post[];
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onComment: (id: string) => void;
  onBookmark: (id: string) => void;
  onOpenPost: (post: Post) => void;
}

export function PostsFeed({ posts, onUpvote, onDownvote, onComment, onBookmark, onOpenPost }: PostsFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="pit-empty-card">
        <h3>No posts found</h3>
        <p>Try changing search or filters.</p>
      </div>
    );
  }

  return (
    <div className="pit-feed-list">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onUpvote={onUpvote}
          onDownvote={onDownvote}
          onComment={onComment}
          onBookmark={onBookmark}
          onOpenPost={onOpenPost}
        />
      ))}
    </div>
  );
}
