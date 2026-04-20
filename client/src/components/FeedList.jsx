import { Check, Link as LinkIcon, MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import UserAvatar from "./UserAvatar";

function formatDate(value) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderCoupleStats(post) {
  const engagement = post.engagement;

  if (!engagement) {
    return null;
  }

  if (engagement.role === "author") {
    return (
      <div className="engagement-strip">
        <div className="engagement-pills">
          <span className={`engagement-pill ${engagement.partnerSeen ? "is-seen" : "is-unseen"}`}>
            {engagement.partnerSeen ? "Seen" : "Not seen yet"}
          </span>
          <span className="engagement-pill">{engagement.partnerViewCount} partner views</span>
        </div>
        <p className="engagement-note">
          {engagement.partnerSeen
            ? `First seen ${formatDate(engagement.partnerFirstViewedAt)}`
            : "Your partner has not opened this post yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="engagement-strip">
      <div className="engagement-pills">
        <span className="engagement-pill">{engagement.yourViewCount} your views</span>
      </div>
      <p className="engagement-note">
        {engagement.yourViewCount > 0
          ? `First viewed ${formatDate(engagement.yourFirstViewedAt)}`
          : "You have not opened this post yet."}
      </p>
    </div>
  );
}

function renderGroupStats(post) {
  return (
    <div className="engagement-strip">
      <div className="engagement-pills">
        <span className="engagement-pill">{post.views?.total || 0} total views</span>
        <span className="engagement-pill">{post.views?.myCount || 0} your views</span>
        <span className="engagement-pill">{post.views?.otherUserCount || 0} others</span>
        <span className={`engagement-pill ${post.seen ? "is-seen" : "is-unseen"}`}>
          {post.seen ? "Seen" : "New"}
        </span>
      </div>
    </div>
  );
}

export default function FeedList({ posts, onDelete, deletingId, onLoadMore, hasMore, loading }) {
  const [openMenuId, setOpenMenuId] = useState("");
  const [copiedPostId, setCopiedPostId] = useState("");

  useEffect(() => {
    const closeMenu = () => setOpenMenuId("");

    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const copyPostLink = async (postId) => {
    const link = `${window.location.origin}${window.location.pathname}#post-${postId}`;
    await navigator.clipboard.writeText(link);
    setCopiedPostId(postId);
    window.setTimeout(() => setCopiedPostId(""), 1400);
  };

  if (!posts.length) {
    return (
      <div className="panel empty-state">
        <h2>No snapshots yet</h2>
        <p>Share your first daily moment and start your private timeline.</p>
      </div>
    );
  }

  return (
    <div className="stacked-layout">
      {posts.map((post) => {
        return (
          <article key={post.id} id={`post-${post.id}`} className="panel post-card">
            <div className="post-card-header">
              <div className="post-author-title">
                <UserAvatar user={post.author} size="md" />
                <div className="post-title-block">
                  <p className="small-label">{post.author?.name || "Unknown author"}</p>
                  <h2>{post.caption || "Untitled snapshot"}</h2>
                </div>
              </div>

              <div className="post-meta">
                <span className="audience-badge">
                  {post.audience === "couple" ? "Couple" : "Group"}
                </span>
                <span>{formatDate(post.createdAt)}</span>
                <div className="post-actions">
                  <button
                    type="button"
                    className="post-menu-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuId((current) => (current === post.id ? "" : post.id));
                    }}
                    aria-label="Post actions"
                  >
                    <MoreVertical size={18} strokeWidth={1.8} />
                  </button>
                  {openMenuId === post.id ? (
                    <div className="post-menu" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          copyPostLink(post.id).catch(() => {});
                          setOpenMenuId("");
                        }}
                      >
                        {copiedPostId === post.id ? (
                          <Check size={16} strokeWidth={2.25} />
                        ) : (
                          <LinkIcon size={16} strokeWidth={1.75} />
                        )}
                        {copiedPostId === post.id ? "Copied" : "Copy link"}
                      </button>
                      {post.isMine ? (
                        <button
                          type="button"
                          className="danger-menu-item"
                          onClick={() => {
                            setOpenMenuId("");
                            onDelete(post.id);
                          }}
                          disabled={deletingId === post.id}
                        >
                          <Trash2 size={16} strokeWidth={1.75} />
                          {deletingId === post.id ? "Deleting..." : "Delete"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <img className="post-image" src={post.image} alt={post.caption || "Shared post"} />

            <div className="post-details-block">
              {post.audience === "couple" ? renderCoupleStats(post) : renderGroupStats(post)}
            </div>
          </article>
        );
      })}

      {hasMore ? (
        <button
          type="button"
          className="ghost-button centered-button"
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load more snapshots"}
        </button>
      ) : null}
    </div>
  );
}
