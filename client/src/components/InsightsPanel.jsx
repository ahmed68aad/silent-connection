import { Info } from "lucide-react";
import { useState } from "react";

export default function InsightsPanel({ feed, feedMeta }) {
  const [showStats, setShowStats] = useState(false);
  const totalViews = feed.reduce((sum, post) => sum + (post.views?.total || 0), 0);
  const partnerViews = feed.reduce((sum, post) => sum + (post.views?.otherUserCount || 0), 0);
  const ownPosts = feed.filter((post) => post.isMine).length;
  const unseenByPartner = feed.filter(
    (post) => post.isMine && post.engagement?.role === "author" && !post.engagement?.partnerSeen,
  ).length;

  return (
    <div className="stacked-layout">
      <div className="panel snapshot-panel">
        <div className="panel-header panel-header-inline">
          <div>
            <h2>Snapshot insights</h2>
            <p>Private details are tucked away until you need them.</p>
          </div>
          <button
            type="button"
            className={`soft-icon-button ${showStats ? "active" : ""}`}
            onClick={() => setShowStats((current) => !current)}
            aria-label={showStats ? "Hide snapshot insights" : "Show snapshot insights"}
            title={showStats ? "Hide snapshot insights" : "Show snapshot insights"}
          >
            <Info size={18} strokeWidth={1.7} />
          </button>
        </div>

        {showStats ? (
          <div className="snapshot-grid">
            <article className="snapshot-chip">
              <span>Total snapshots</span>
              <strong>{feedMeta.total}</strong>
            </article>
            <article className="snapshot-chip">
              <span>Total opens</span>
              <strong>{totalViews}</strong>
            </article>
            <article className="snapshot-chip">
              <span>Partner opens</span>
              <strong>{partnerViews}</strong>
            </article>
            <article className="snapshot-chip">
              <span>Your snapshots</span>
              <strong>{ownPosts}</strong>
            </article>
            <article className="snapshot-chip">
              <span>Waiting for partner</span>
              <strong>{unseenByPartner}</strong>
            </article>
          </div>
        ) : null}
      </div>

    </div>
  );
}
