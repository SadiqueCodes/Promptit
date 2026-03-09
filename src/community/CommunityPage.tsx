import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { CommunityHeader } from './CommunityHeader';
import { CommunityTabs } from './CommunityTabs';
import { CommunitySearch } from './CommunitySearch';
import { CommunityFilters } from './CommunityFilters';
import { PostsFeed } from './PostsFeed';
import { MySidebar } from './MySidebar';
import { NewPostModal } from './NewPostModal';
import { PostDetailModal } from './PostDetailModal';
import { DEFAULT_PROMPT_IMAGE } from './constants';
import { supabase } from '../utils/supabase/client';
import type { Post, Template, TemplatePostPayload } from './types';
import './community.css';

interface SavedTemplate {
  id: string;
  title: string;
  description?: string;
  template?: string;
  iconName?: string;
}

interface CommunityPageProps {
  onNavigateHome?: () => void;
  onBack?: () => void;
  onOpenProfile?: () => void;
  userEmail?: string | null;
  userName?: string | null;
  templates?: SavedTemplate[];
}

interface PostRow {
  id: string;
  user_id: string | null;
  author: string;
  author_avatar: string | null;
  title: string;
  description: string;
  image_url: string | null;
  upvotes: number | null;
  downvotes: number | null;
  bookmarked: boolean | null;
  category: string;
  created_at: string;
}

interface CommentCountRow {
  post_id: string;
}

interface SavedPostRow {
  post_id: string;
}

interface VoteRow {
  post_id: string;
  vote_type: 'up' | 'down';
  user_id?: string;
}

function timeAgo(isoTime: string): string {
  const diffMs = Date.now() - new Date(isoTime).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

function mapIcon(iconName?: string): string {
  if (!iconName) return '?';
  const byName: Record<string, string> = {
    Sparkles: '?',
    Mail: '?',
    FileText: '??',
    MessageSquare: '??',
    Code: '</>',
    Briefcase: '??',
    GraduationCap: '??',
    Wand2: '??',
    History: '??',
  };
  return byName[iconName] || '?';
}

export function CommunityPage({
  onNavigateHome,
  onBack,
  onOpenProfile,
  userEmail = null,
  userName = null,
  templates = [],
}: CommunityPageProps) {
  const [activeTab, setActiveTab] = useState<'community' | 'my-templates'>('community');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortFilter, setSortFilter] = useState<'hot' | 'new' | 'top'>('hot');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [initialTemplateId, setInitialTemplateId] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postPendingDelete, setPostPendingDelete] = useState<Post | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [votingPostIds, setVotingPostIds] = useState<Record<string, boolean>>({});
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const normalizedTemplates: Template[] = useMemo(
    () => templates.map((template) => ({
      id: template.id,
      title: template.title,
      icon: mapIcon(template.iconName),
      description: template.description || 'Template from PromptIT studio',
      prompt: template.template || '',
    })),
    [templates],
  );

  const loadPosts = async () => {
    setIsPostsLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const authUserId = auth.user?.id || null;
      if (authUserId && authUserId !== currentUserId) {
        setCurrentUserId(authUserId);
      }

      const { data: postRows, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error loading community posts:', postsError);
        toast.error('Failed to load community feed');
        return;
      }

    const { data: commentRows } = await supabase
      .from('community_comments')
      .select('post_id');

    const { data: voteRows, error: votesError } = await supabase
      .from('community_post_votes')
      .select('post_id, vote_type');

    if (votesError) {
      console.error('Error loading vote rows:', votesError);
    }

    let myVoteMap = new Map<string, 'up' | 'down'>();
    if (authUserId) {
      const { data: myVotes, error: myVotesError } = await supabase
        .from('community_post_votes')
        .select('post_id, vote_type')
        .eq('user_id', authUserId);

      if (myVotesError) {
        console.error('Error loading user votes:', myVotesError);
      } else {
        ((myVotes || []) as VoteRow[]).forEach((row) => {
          myVoteMap.set(row.post_id, row.vote_type);
        });
      }
    }

      let savedPostIds = new Set<string>();
      if (authUserId) {
        const { data: savedRows, error: savedError } = await supabase
          .from('community_saved_posts')
          .select('post_id')
          .eq('user_id', authUserId);

        if (savedError) {
          console.error('Error loading saved posts:', savedError);
        } else {
          savedPostIds = new Set(((savedRows || []) as SavedPostRow[]).map((row) => row.post_id));
        }
      }

    const counts = new Map<string, number>();
    (commentRows as CommentCountRow[] | null)?.forEach((row) => {
      counts.set(row.post_id, (counts.get(row.post_id) || 0) + 1);
    });

    const upvoteCounts = new Map<string, number>();
    const downvoteCounts = new Map<string, number>();
    ((voteRows || []) as VoteRow[]).forEach((row) => {
      if (row.vote_type === 'up') {
        upvoteCounts.set(row.post_id, (upvoteCounts.get(row.post_id) || 0) + 1);
      } else if (row.vote_type === 'down') {
        downvoteCounts.set(row.post_id, (downvoteCounts.get(row.post_id) || 0) + 1);
      }
    });

    const mapped = ((postRows || []) as PostRow[]).map((row) => ({
      id: row.id,
      userId: row.user_id || undefined,
      author: row.author || 'Anonymous',
      authorAvatar: row.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.author || 'Anonymous')}`,
      timestamp: timeAgo(row.created_at),
      createdAt: row.created_at,
      title: row.title,
      description: row.description,
      image: row.image_url || undefined,
      upvotes: upvoteCounts.has(row.id) ? (upvoteCounts.get(row.id) || 0) : (row.upvotes || 0),
      downvotes: downvoteCounts.has(row.id) ? (downvoteCounts.get(row.id) || 0) : (row.downvotes || 0),
      userVote: myVoteMap.get(row.id) || null,
      comments: counts.get(row.id) || 0,
      bookmarked: savedPostIds.has(row.id),
      category: row.category || 'other',
    }));

      setPosts(mapped);
    } finally {
      setIsPostsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    setVisibleCount(8);
  }, [searchQuery, sortFilter, categoryFilter]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, categoryFilter]);

  const sortedPosts = useMemo(() => {
    const next = [...filteredPosts];
    next.sort((a, b) => {
      if (sortFilter === 'hot') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      if (sortFilter === 'new') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return b.upvotes - a.upvotes;
    });
    return next;
  }, [filteredPosts, sortFilter]);

  const visiblePosts = useMemo(() => sortedPosts.slice(0, visibleCount), [sortedPosts, visibleCount]);
  const savedPosts = useMemo(() => posts.filter((post) => post.bookmarked), [posts]);

  const myPosts = useMemo(() => {
    const currentEmail = (userEmail || '').trim().toLowerCase();
    return posts.filter((post) => {
      if (currentUserId && post.userId === currentUserId) return true;
      if (currentEmail && post.author.trim().toLowerCase() === currentEmail) return true;
      return false;
    });
  }, [posts, currentUserId, userEmail]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first?.isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + 6, sortedPosts.length));
      }
    }, { threshold: 0.2 });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sortedPosts.length]);

  const updatePostField = async (postId: string, field: 'upvotes' | 'downvotes' | 'bookmarked', value: number | boolean) => {
    const { error } = await supabase.from('community_posts').update({ [field]: value }).eq('id', postId);
    if (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
      await loadPosts();
    }
  };

  const submitVote = (postId: string, targetVote: 'up' | 'down') => {
    if (!currentUserId) {
      toast.error('Please sign in to vote');
      return;
    }
    if (votingPostIds[postId]) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const previousVote = post.userVote || null;
    const nextVote: 'up' | 'down' | null = previousVote === targetVote ? null : targetVote;

    const nextUpvotes =
      post.upvotes - (previousVote === 'up' ? 1 : 0) + (nextVote === 'up' ? 1 : 0);
    const nextDownvotes =
      post.downvotes - (previousVote === 'down' ? 1 : 0) + (nextVote === 'down' ? 1 : 0);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              upvotes: Math.max(0, nextUpvotes),
              downvotes: Math.max(0, nextDownvotes),
              userVote: nextVote,
            }
          : p,
      ),
    );

    const run = async () => {
      setVotingPostIds((prev) => ({ ...prev, [postId]: true }));
      try {
        if (!nextVote) {
          const { error } = await supabase
            .from('community_post_votes')
            .delete()
            .eq('user_id', currentUserId)
            .eq('post_id', postId);
          if (error) {
            console.error('Remove vote error:', error);
            toast.error('Failed to update vote');
            await loadPosts();
            return;
          }
        } else {
          const { error } = await supabase
            .from('community_post_votes')
            .upsert(
              {
                user_id: currentUserId,
                post_id: postId,
                vote_type: nextVote,
              },
              { onConflict: 'user_id,post_id' },
            );
          if (error) {
            console.error('Vote upsert error:', error);
            toast.error('Failed to update vote');
            await loadPosts();
            return;
          }
        }

        // Keep aggregate columns in sync for compatibility with existing queries/tools.
        await supabase
          .from('community_posts')
          .update({
            upvotes: Math.max(0, nextUpvotes),
            downvotes: Math.max(0, nextDownvotes),
          })
          .eq('id', postId);
      } finally {
        setVotingPostIds((prev) => ({ ...prev, [postId]: false }));
      }
    };

    run();
  };

  const handleUpvote = (postId: string) => submitVote(postId, 'up');

  const handleDownvote = (postId: string) => submitVote(postId, 'down');

  const handleComment = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) setSelectedPost(post);
  };

  const handleBookmark = (postId: string) => {
    if (!currentUserId) {
      toast.error('Please sign in to save posts');
      return;
    }
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const next = !post.bookmarked;
    setPosts(posts.map((p) => (p.id === postId ? { ...p, bookmarked: next } : p)));

    const run = async () => {
      if (next) {
        const { error } = await supabase.from('community_saved_posts').insert({
          user_id: currentUserId,
          post_id: postId,
        });
        if (error) {
          console.error('Save post error:', error);
          setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, bookmarked: false } : p)));
          toast.error('Failed to save post');
          return;
        }
      } else {
        const { error } = await supabase
          .from('community_saved_posts')
          .delete()
          .eq('user_id', currentUserId)
          .eq('post_id', postId);
        if (error) {
          console.error('Unsave post error:', error);
          setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, bookmarked: true } : p)));
          toast.error('Failed to unsave post');
          return;
        }
      }
    };
    run();
  };

  const handleNewPost = async (payload: TemplatePostPayload) => {
    const template = normalizedTemplates.find((t) => t.id === payload.templateId);
    const { data: auth } = await supabase.auth.getUser();
    const resolvedName =
      userName ||
      (auth.user?.user_metadata?.display_name as string | undefined) ||
      userEmail ||
      auth.user?.email ||
      'Anonymous';
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(resolvedName)}`;

    const promptText = template?.prompt || payload.caption || '';
    const body = payload.caption
      ? `${payload.caption.trim()}\n\n${promptText}`.trim()
      : promptText;

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: auth.user?.id || null,
        author: resolvedName,
        author_avatar: avatar,
        title: payload.title,
        description: body,
        image_url: payload.imageUrl || null,
        category: payload.category || 'other',
        upvotes: 0,
        downvotes: 0,
        bookmarked: false,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      return;
    }

    const row = data as PostRow;
    const nextPost: Post = {
      id: row.id,
      userId: row.user_id || undefined,
      author: row.author,
      authorAvatar: row.author_avatar || avatar,
      timestamp: timeAgo(row.created_at),
      createdAt: row.created_at,
      title: row.title,
      description: row.description,
      image: row.image_url || DEFAULT_PROMPT_IMAGE,
      upvotes: row.upvotes || 0,
      downvotes: row.downvotes || 0,
      comments: 0,
      bookmarked: Boolean(row.bookmarked),
      category: row.category,
    };

    setPosts((prev) => [nextPost, ...prev]);
    setShowNewPostModal(false);
    setInitialTemplateId('');
    toast.success('Posted to community');
  };

  const handleCommentsChanged = (postId: string, commentCount: number) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, comments: commentCount } : post)));
    setSelectedPost((prev) => (prev && prev.id === postId ? { ...prev, comments: commentCount } : prev));
  };

  const handleDeletePost = async (postId: string) => {
    const target = posts.find((post) => post.id === postId);
    if (!target) return;

    setIsDeletingPost(true);

    const { error } = await supabase.from('community_posts').delete().eq('id', postId);
    setIsDeletingPost(false);

    if (error) {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post');
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setSelectedPost((prev) => (prev?.id === postId ? null : prev));
    setPostPendingDelete(null);
    toast.success('Post deleted');
  };

  return (
    <div className="pit-community-page">
      <div className="pit-bg-orb pit-bg-orb-a" />
      <div className="pit-bg-orb pit-bg-orb-b" />

      <CommunityHeader onNavigateHome={onNavigateHome || onBack} onOpenProfile={onOpenProfile} />

      <div className="pit-community-shell">
        <CommunityTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'community' ? (
          <>
            <div className="pit-toolbar">
              <CommunitySearch value={searchQuery} onChange={setSearchQuery} />
              <CommunityFilters
                sortFilter={sortFilter}
                categoryFilter={categoryFilter}
                onSortChange={setSortFilter}
                onCategoryChange={setCategoryFilter}
                onNewPost={() => setShowNewPostModal(true)}
              />
            </div>

            <div className="pit-layout-grid">
              <main>
                {isPostsLoading ? (
                  <div className="pit-community-loader">
                    <Sparkles className="h-7 w-7 text-slate-100 promptit-glow-flow" />
                  </div>
                ) : (
                  <PostsFeed
                    posts={visiblePosts}
                    onUpvote={handleUpvote}
                    onDownvote={handleDownvote}
                    onComment={handleComment}
                    onBookmark={handleBookmark}
                    onOpenPost={setSelectedPost}
                  />
                )}
                <div ref={sentinelRef} className="pit-load-sentinel">
                  {!isPostsLoading && visibleCount < sortedPosts.length ? 'Loading more posts...' : ''}
                </div>
              </main>

              <MySidebar
                posts={savedPosts}
                onOpenPost={setSelectedPost}
                onUnsavePost={handleBookmark}
              />
            </div>
          </>
        ) : (
          <section className="pit-saved-grid">
            {myPosts.length === 0 ? (
              <div className="pit-empty-card">
                <h3>No posts yet</h3>
                <p>Posts you publish to community will appear here.</p>
              </div>
            ) : (
              myPosts.map((post) => (
                <article key={post.id} className="pit-saved-card">
                  <h4>{post.title}</h4>
                  <p className="pit-line-clamp-4">{post.description}</p>
                  <div className="pit-saved-actions">
                    <button className="pit-mini-btn" onClick={() => setSelectedPost(post)}>
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    <button
                      className="pit-mini-btn"
                      onClick={() => setPostPendingDelete(post)}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
      </div>

      {showNewPostModal && (
        <NewPostModal
          templates={normalizedTemplates}
          initialTemplateId={initialTemplateId}
          onClose={() => {
            setShowNewPostModal(false);
            setInitialTemplateId('');
          }}
          onSubmit={handleNewPost}
        />
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          userEmail={userEmail}
          userName={userName}
          onCommentsChanged={handleCommentsChanged}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {postPendingDelete && (
        <div className="pit-modal-overlay" onClick={() => !isDeletingPost && setPostPendingDelete(null)}>
          <div className="pit-modal-card pit-modal-card-compact" onClick={(e) => e.stopPropagation()}>
            <div className="pit-modal-head">
              <h3>Delete Post</h3>
            </div>
            <div className="pit-form-grid">
              <p className="pit-muted">
                Are you sure you want to delete "{postPendingDelete.title}"?
              </p>
              <p className="pit-muted">This action cannot be undone.</p>
            </div>
            <div className="pit-modal-footer">
              <button
                className="pit-mini-btn"
                onClick={() => setPostPendingDelete(null)}
                disabled={isDeletingPost}
              >
                Cancel
              </button>
              <button
                className="pit-mini-btn pit-mini-btn-danger"
                onClick={() => handleDeletePost(postPendingDelete.id)}
                disabled={isDeletingPost}
              >
                {isDeletingPost ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

