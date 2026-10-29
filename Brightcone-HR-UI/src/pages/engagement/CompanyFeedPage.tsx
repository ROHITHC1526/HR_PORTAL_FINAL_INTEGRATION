import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, ThumbsUp, MessageSquare, Star, Megaphone, Users, Pin, Heart, PartyPopper } from 'lucide-react';

interface FeedComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
}

interface FeedItem {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  authorColor: string;
  date: string;
  type: 'kudos' | 'announcement' | 'update';
  kudosTo?: string;
  kudosToAvatar?: string;
  content: string;
  likes: number;
  comments: FeedComment[];
  isLiked?: boolean;
}

const initialFeedItems: FeedItem[] = [
  {
    id: 'F-1',
    authorName: 'Priya Menon',
    authorRole: 'Engineering',
    authorAvatar: 'PM',
    authorColor: 'bg-[#8B5CF6]',
    date: 'Oct 12',
    type: 'kudos',
    kudosTo: 'Rahul Varma',
    kudosToAvatar: 'RV',
    content: 'Huge thanks for the rate-limiter rewrite. The agent gateway p95 dropped by 40% overnight.',
    likes: 3,
    comments: [
      {
        id: 'C-1',
        authorName: 'Arjun Nair',
        authorAvatar: 'AN',
        text: 'Well deserved!',
      },
    ],
  },
  {
    id: 'F-2',
    authorName: 'Ananya Rao',
    authorRole: 'People Ops',
    authorAvatar: 'AR',
    authorColor: 'bg-[#8B5CF6]',
    date: 'Oct 5',
    type: 'announcement',
    content: 'Q3 Town Hall presentation deck and benefits enrollment guidelines are now posted in HR Policies. Please review before Oct 31.',
    likes: 12,
    comments: [],
  },
];

export const CompanyFeedPage: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(initialFeedItems);
  const [postType, setPostType] = useState<'Update' | 'Kudos' | 'Celebration'>('Update');
  const [postText, setPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get('/api/announcements')
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setAnnouncements(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newItem: FeedItem = {
      id: `F-${Date.now()}`,
      authorName: 'Ananya Rao',
      authorRole: 'People Ops Lead',
      authorAvatar: 'AR',
      authorColor: 'bg-[#8B5CF6]',
      date: 'Just now',
      type: postType === 'Kudos' ? 'kudos' : postType === 'Celebration' ? 'kudos' : 'update',
      kudosTo: postType === 'Kudos' ? 'Rahul Varma' : undefined,
      kudosToAvatar: postType === 'Kudos' ? 'RV' : undefined,
      content: postText.trim(),
      likes: 1,
      comments: [],
    };

    setFeedItems([newItem, ...feedItems]);
    setPostText('');
  };

  const handleLike = (id: string) => {
    setFeedItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
              isLiked: !item.isLiked,
            }
          : item
      )
    );
  };

  const handleAddComment = (itemId: string) => {
    const text = commentInputs[itemId]?.trim();
    if (!text) return;

    setFeedItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              comments: [
                ...item.comments,
                {
                  id: `C-${Date.now()}`,
                  authorName: 'Ananya Rao',
                  authorAvatar: 'AR',
                  text,
                },
              ],
            }
          : item
      )
    );

    setCommentInputs((prev) => ({ ...prev, [itemId]: '' }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Subtitle */}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Updates, kudos and celebrations from across Brightcone.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Share Box + Feed */}
        <div className="lg:col-span-8 space-y-5">
          {/* Share Box Card matching Image 5 */}
          <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                AR
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  Ananya Rao
                </div>
                <div className="text-[11px] text-slate-400">
                  Share with everyone at Brightcone
                </div>
              </div>
            </div>

            <form onSubmit={handleCreatePost}>
              <textarea
                rows={3}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Share an update or thank a colleague"
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 resize-none transition"
              />

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  {(['Update', 'Kudos', 'Celebration'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPostType(t)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        postType === t
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Send size={13} />
                  <span>Post</span>
                </button>
              </div>
            </form>
          </div>

          {/* Feed Items matching Image 5 */}
          <div className="space-y-4">
            {feedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${item.authorColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                      {item.authorAvatar}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {item.authorName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.date} · {item.authorRole}
                      </div>
                    </div>
                  </div>

                  {item.type === 'kudos' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      <span>Kudos</span>
                    </span>
                  )}
                  {item.type === 'announcement' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                      <Megaphone size={13} className="text-rose-500" />
                      <span>Announcement</span>
                    </span>
                  )}
                </div>

                {/* Kudos to Card Box if type is kudos */}
                {item.kudosTo && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      {item.kudosToAvatar || 'RV'}
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Kudos to </span>
                      <strong className="text-xs text-slate-900 dark:text-white font-bold">
                        {item.kudosTo}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Content */}
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {item.content}
                </p>

                {/* Likes & Comment count bar */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <button
                    onClick={() => handleLike(item.id)}
                    className="flex items-center gap-1.5 hover:text-blue-600 transition cursor-pointer"
                  >
                    <ThumbsUp size={14} className={item.isLiked ? 'text-blue-600 fill-blue-600' : ''} />
                    <span>{item.likes} Likes</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare size={14} />
                    <span>{item.comments.length} comment</span>
                  </div>
                </div>

                {/* Existing Comments */}
                {item.comments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {item.comments.map((cmt) => (
                      <div key={cmt.id} className="flex items-start gap-2.5 text-xs">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {cmt.authorAvatar}
                        </div>
                        <div className="flex-1 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                            {cmt.authorName}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {cmt.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment row matching Image 5 */}
                <div className="flex items-center gap-2.5 pt-2">
                  <div className="w-7 h-7 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    AR
                  </div>
                  <input
                    type="text"
                    value={commentInputs[item.id] || ''}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [item.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddComment(item.id);
                    }}
                    placeholder="Write a comment and press Enter"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar matching Image 5 */}
        <div className="lg:col-span-4 space-y-5">
          {/* Celebrations this month matching Image 5 */}
          <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Celebrations this month
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  MJ
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Meera Joshi
                  </div>
                  <div className="text-[11px] text-slate-400">
                    3 years at Brightcone · Oct 2
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  RV
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Rahul Varma
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Birthday · Oct 7
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pinned Card matching Image 5 */}
          <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Pinned
            </h3>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                <Pin size={11} className="rotate-45" />
                <span>Executive Announcement</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {announcements.length > 0 ? announcements[0].title : 'Brightcone Q3 Town Hall & Performance Reviews'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {announcements.length > 0 ? announcements[0].body : 'Quarterly all-hands call scheduled for Friday with leadership Q&A.'}
              </p>
            </div>
          </div>

          {/* Groups matching Image 5 */}
          <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Groups
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Hyderabad office', members: '9 members' },
                { name: 'Engineering guild', members: '7 members' },
                { name: 'Bright Works launch', members: '12 members' },
                { name: 'Sports & fitness club', members: '6 members' },
              ].map((grp, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Users size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {grp.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {grp.members}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CompanyFeedPage;
