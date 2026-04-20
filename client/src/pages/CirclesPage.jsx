import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import FeedList from "../components/FeedList";
import Toast from "../components/Toast";
import { useAuth } from "../state/AuthContext";

export default function CirclesPage() {
  const {
    couple,
    feed,
    feedMeta,
    groups,
    loadingFeed,
    loadFeed,
    removePost,
  } = useAuth();
  const [deletingId, setDeletingId] = useState("");
  const [feedback, setFeedback] = useState({ tone: "info", message: "" });
  const [selectedGroupId, setSelectedGroupId] = useState("");

  useEffect(() => {
    if (!groups.length) {
      setSelectedGroupId("");
      return;
    }

    const selectedExists = groups.some((group) => group.id === selectedGroupId);

    if (!selectedGroupId || !selectedExists) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    if (!couple?.connected || !selectedGroupId) {
      return;
    }

    loadFeed({ feedType: "group", groupId: selectedGroupId }).catch((error) => {
      setFeedback({ tone: "error", message: error.message });
    });
  }, [couple?.connected, selectedGroupId]);

  const ownedCircles = groups.filter((group) => group.isOwner).length;
  const memberCount = groups.reduce((sum, group) => sum + (group.memberCount || 0), 0);
  const selectedGroup = groups.find((group) => group.id === selectedGroupId);

  return (
    <AppShell
      eyebrow="Trusted Couple Circles"
      title="Circles"
      subtitle="Create and manage trusted couple circles away from your private snapshot stream."
      showHeader={false}
      aside={
        <div className="stacked-layout">
          <div className="panel snapshot-panel">
            <div className="panel-header">
              <h2>Circle overview</h2>
              <p>Your trusted spaces at a glance.</p>
            </div>
            <div className="snapshot-grid">
              <article className="snapshot-chip">
                <span>Total circles</span>
                <strong>{groups.length}</strong>
              </article>
              <article className="snapshot-chip">
                <span>Owned by you</span>
                <strong>{ownedCircles}</strong>
              </article>
              <article className="snapshot-chip">
                <span>Couple memberships</span>
                <strong>{memberCount}</strong>
              </article>
              <article className="snapshot-chip">
                <span>Status</span>
                <strong>{couple?.connected ? "Ready" : "Locked"}</strong>
              </article>
            </div>
          </div>
        </div>
      }
    >
      <Toast tone={feedback.tone} message={feedback.message} />

      {couple?.connected ? (
        <>
          {groups.length ? (
            <div className="circle-tabs" aria-label="Circle streams">
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  className={selectedGroupId === group.id ? "circle-tab active" : "circle-tab"}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  {group.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="soft-block">
              <strong>No circles yet</strong>
              <p>Create or join one from the dashboard.</p>
            </div>
          )}

          {selectedGroup ? (
            <FeedList
              posts={feed}
              deletingId={deletingId}
              onDelete={async (postId) => {
                setDeletingId(postId);
                setFeedback({ tone: "info", message: "" });

                try {
                  await removePost(postId);
                  setFeedback({ tone: "success", message: "Circle snapshot removed." });
                } catch (error) {
                  setFeedback({ tone: "error", message: error.message });
                } finally {
                  setDeletingId("");
                }
              }}
              onLoadMore={() =>
                loadFeed({
                  page: feedMeta.page + 1,
                  append: true,
                  feedType: "group",
                  groupId: selectedGroupId,
                }).catch((error) => {
                  setFeedback({ tone: "error", message: error.message });
                })
              }
              hasMore={feedMeta.hasMore}
              loading={loadingFeed}
            />
          ) : (
            <div className="panel empty-state">
              <h2>No circle selected</h2>
              <p>Create or join a circle to start sharing snapshots there.</p>
            </div>
          )}
        </>
      ) : (
        <div className="panel empty-state">
          <h2>Link your partner first</h2>
          <p>Circles unlock after your couple connection is active.</p>
        </div>
      )}
    </AppShell>
  );
}
