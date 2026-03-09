import { useEffect, useMemo, useState } from 'react';
import { X, ArrowUp, ArrowDown, MessageSquare, Bookmark, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import type { Post, Comment } from './types';

interface PostDetailModalProps {
  post: Post;
  userEmail?: string | null;
  onCommentsChanged?: (postId: string, commentCount: number) => void;
  onClose: () => void;
}

interface CommentRow {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  author: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
}

interface CommentNode extends Comment {
  replies: CommentNode[];
}

function timeAgo(isoTime: string): string {
  const diffMs = Date.now() - new Date(isoTime).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function toCommentNode(row: CommentRow): CommentNode {
  const seed = encodeURIComponent(row.author || 'Anonymous');
  return {
    id: row.id,
    postId: row.post_id,
    parentCommentId: row.parent_comment_id,
    author: row.author || 'Anonymous',
    authorAvatar: row.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    timestamp: timeAgo(row.created_at),
    createdAt: row.created_at,
    content: row.content,
    replies: [],
  };
}

function buildTree(rows: CommentRow[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  rows.forEach((row) => {
    map.set(row.id, toCommentNode(row));
  });

  rows.forEach((row) => {
    const node = map.get(row.id);
    if (!node) return;
    if (!row.parent_comment_id) {
      roots.push(node);
      return;
    }
    const parent = map.get(row.parent_comment_id);
    if (parent) parent.replies.push(node);
    else roots.push(node);
  });

  return roots;
}

function countAllComments(nodes: CommentNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countAllComments(node.replies), 0);
}

export function PostDetailModal({ post, userEmail = null, onCommentsChanged, onClose }: PostDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [openReplyForms, setOpenReplyForms] = useState<Record<string, boolean>>({});

  const commentTree = useMemo(() => buildTree(comments), [comments]);
  const commentCount = useMemo(() => countAllComments(commentTree), [commentTree]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
      return;
    }

    setComments((data || []) as CommentRow[]);
  };

  useEffect(() => {
    loadComments();
  }, [post.id]);

  useEffect(() => {
    onCommentsChanged?.(post.id, commentCount);
  }, [commentCount, onCommentsChanged, post.id]);

  const submitComment = async (content: string, parentCommentId: string | null = null) => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const { data: auth } = await supabase.auth.getUser();
    const author = userEmail || auth.user?.email || 'Anonymous';
    const seed = encodeURIComponent(author);

    const { error } = await supabase.from('community_comments').insert({
      post_id: post.id,
      user_id: auth.user?.id || null,
      parent_comment_id: parentCommentId,
      author,
      author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
      content: content.trim(),
    });

    setIsSubmitting(false);

    if (error) {
      console.error('Failed to submit comment:', error);
      toast.error('Failed to submit comment');
      return;
    }

    if (parentCommentId) {
      setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: '' }));
      setOpenReplyForms((prev) => ({ ...prev, [parentCommentId]: false }));
    } else {
      setCommentText('');
    }

    await loadComments();
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    submitComment(commentText);
  };

  const renderCommentNode = (node: CommentNode, depth = 0): JSX.Element => {
    const isReplyOpen = Boolean(openReplyForms[node.id]);
    const replyDraft = replyDrafts[node.id] || '';

    return (
      <div key={node.id} className={depth > 0 ? 'pl-6 border-l border-slate-800 ml-5 mt-3' : ''}>
        <div className="flex gap-3">
          <img
            src={node.authorAvatar}
            alt={node.author}
            className="w-10 h-10 rounded-full bg-slate-800"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">{node.author}</span>
              <span className="text-sm text-slate-400">{node.timestamp}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">{node.content}</p>
            <button
              type="button"
              className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              onClick={() => setOpenReplyForms((prev) => ({ ...prev, [node.id]: !prev[node.id] }))}
            >
              {isReplyOpen ? 'Cancel' : 'Reply'}
            </button>

            {isReplyOpen && (
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitComment(replyDraft, node.id);
                }}
              >
                <input
                  type="text"
                  value={replyDraft}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [node.id]: e.target.value }))}
                  placeholder="Write a reply..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!replyDraft.trim() || isSubmitting}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Reply
                </button>
              </form>
            )}
          </div>
        </div>

        {node.replies.length > 0 && (
          <div className="mt-1 space-y-2">
            {node.replies.map((reply) => renderCommentNode(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Post Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <img src={post.authorAvatar} alt={post.author} className="w-12 h-12 rounded-full bg-slate-800" />
              <div>
                <div className="font-medium text-white">{post.author}</div>
                <div className="text-sm text-slate-400">{post.timestamp}</div>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">{post.title}</h3>

            {post.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <ImageWithFallback src={post.image} alt={post.title} className="w-full h-auto max-h-96 object-cover" />
              </div>
            )}

            <p className="text-slate-400 leading-relaxed mb-4">{post.description}</p>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-1">
                <button className="p-2 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
                  <ArrowUp className="w-5 h-5" />
                </button>
                <span className="text-white font-medium min-w-[3rem] text-center">{post.upvotes - post.downvotes}</span>
                <button className="p-2 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <MessageSquare className="w-5 h-5" />
                <span>{commentCount}</span>
              </div>

              <button className="ml-auto p-2 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
                <Bookmark className={`w-5 h-5 ${post.bookmarked ? 'fill-current text-orange-300' : ''}`} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Comments ({commentCount})</h4>

            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail || 'CurrentUser')}`}
                  alt="You"
                  className="w-10 h-10 rounded-full bg-slate-800"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              {commentTree.length === 0 ? (
                <p className="text-slate-400 text-sm">No comments yet. Start the conversation.</p>
              ) : (
                commentTree.map((node) => renderCommentNode(node))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
