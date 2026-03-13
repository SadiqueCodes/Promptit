import { useEffect, useMemo, useState } from 'react';
import { X, Copy, Check, MessageSquare } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import type { Post, Comment } from './types';

interface PostDetailModalProps {
  post: Post;
  userEmail?: string | null;
  userName?: string | null;
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

const MAX_DEPTH = 5;

function timeAgo(isoTime: string): string {
  const diffMs = Date.now() - new Date(isoTime).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function toNode(row: CommentRow): CommentNode {
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

  rows.forEach((row) => map.set(row.id, toNode(row)));
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

function countNodes(nodes: CommentNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.replies), 0);
}

export function PostDetailModal({ post, userEmail = null, userName = null, onCommentsChanged, onClose }: PostDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [openReplyForms, setOpenReplyForms] = useState<Record<string, boolean>>({});

  const tree = useMemo(() => buildTree(comments), [comments]);
  const commentCount = useMemo(() => countNodes(tree), [tree]);

  useEffect(() => {
    onCommentsChanged?.(post.id, commentCount);
  }, [commentCount, onCommentsChanged, post.id]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) {
        toast.error('Failed to load comments');
        return;
      }
      setComments((data || []) as CommentRow[]);
    };

    load();
  }, [post.id]);

  const addComment = async (content: string, parentId: string | null = null) => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const { data: auth } = await supabase.auth.getUser();
    const author =
      userName ||
      (auth.user?.user_metadata?.display_name as string | undefined) ||
      userEmail ||
      auth.user?.email ||
      'Anonymous';

    const { error } = await supabase.from('community_comments').insert({
      post_id: post.id,
      user_id: auth.user?.id || null,
      parent_comment_id: parentId,
      author,
      author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author)}`,
      content: content.trim(),
    });

    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to submit comment');
      return;
    }

    if (parentId) {
      setReplyDrafts((prev) => ({ ...prev, [parentId]: '' }));
      setOpenReplyForms((prev) => ({ ...prev, [parentId]: false }));
    } else {
      setCommentText('');
    }

    const { data } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    setComments((data || []) as CommentRow[]);
  };

  const copyPrompt = () => {
    const textArea = document.createElement('textarea');
    textArea.value = post.description;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const renderNode = (node: CommentNode, depth = 0): JSX.Element => {
    const replyOpen = Boolean(openReplyForms[node.id]);
    const replyText = replyDrafts[node.id] || '';
    const canReply = depth < MAX_DEPTH;

    return (
      <div key={node.id} className="pit-comment-node" style={{ marginLeft: depth > 0 ? depth * 14 : 0 }}>
        <div className="pit-comment-head">
          <img src={node.authorAvatar} alt={node.author} className="pit-avatar pit-avatar-sm" />
          <span className="pit-author">{node.author}</span>
          <span className="pit-time">{node.timestamp}</span>
        </div>
        <p className="pit-comment-content">{node.content}</p>
        {canReply && (
          <button className="pit-link-btn" onClick={() => setOpenReplyForms((prev) => ({ ...prev, [node.id]: !prev[node.id] }))}>
            {replyOpen ? 'Cancel' : 'Reply'}
          </button>
        )}

        {replyOpen && (
          <form className="pit-reply-row" onSubmit={(e) => { e.preventDefault(); addComment(replyText, node.id); }}>
            <input
              value={replyText}
              onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [node.id]: e.target.value }))}
              className="pit-input"
              placeholder="Reply..."
            />
            <button className="pit-mini-btn pit-mini-btn-accent" disabled={!replyText.trim() || isSubmitting}>Reply</button>
          </form>
        )}

        {node.replies.length > 0 && node.replies.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="pit-modal-overlay">
      <div className="pit-modal-card pit-modal-card-full">
        <div className="pit-modal-head">
          <h3>{post.title}</h3>
          <button onClick={onClose} className="pit-icon-btn"><X size={18} /></button>
        </div>

        <div className="pit-modal-scroll thin-scrollbar">
          <div className="pit-post-content-box">
            {post.image && (
              <div className="pit-image-stage">
                <div
                  className="pit-image-blur-bg"
                  style={{ backgroundImage: `url(${post.image})` }}
                />
                <ImageWithFallback
                  src={post.image}
                  alt={post.title}
                  className="pit-post-image-contained"
                />
              </div>
            )}
            <p className="pit-full-prompt">{post.description}</p>
            <button className="pit-mini-btn pit-mini-btn-accent" onClick={copyPrompt}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
            </button>
          </div>

          <div className="pit-comments-wrap">
            <div className="pit-comments-title"><MessageSquare size={16} /> Comments ({commentCount})</div>

            <form className="pit-reply-row" onSubmit={(e) => { e.preventDefault(); addComment(commentText); }}>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="pit-input"
                placeholder="Add a comment..."
              />
              <button className="pit-mini-btn pit-mini-btn-accent" disabled={!commentText.trim() || isSubmitting}>Reply</button>
            </form>

            <div className="pit-comment-list">
              {tree.length === 0 ? <p className="pit-muted">No comments yet.</p> : tree.map((node) => renderNode(node))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
