import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import FeedList from "../components/FeedList";
import PostComposer from "../components/PostComposer";
import Toast from "../components/Toast";
import { useAuth } from "../state/AuthContext";

export default function FeedPage() {
  const {
    couple,
    feed,
    feedMeta,
    loadingFeed,
    loadFeed,
    createPost,
    removePost,
  } = useAuth();

  const [feedback, setFeedback] = useState({ tone: "info", message: "" });
  const [deletingId, setDeletingId] = useState("");
  const [busyUpload, setBusyUpload] = useState(false);

  useEffect(() => {
    if (!couple?.connected) {
      return;
    }

    loadFeed({ feedType: "couple" }).catch((error) => {
      setFeedback({ tone: "error", message: error.message });
    });
  }, [couple?.connected]);

  const publishSnapshot = async (formData) => {
    formData.append("audience", "couple");
    setBusyUpload(true);
    setFeedback({ tone: "info", message: "" });

    try {
      await createPost(formData, { feedType: "couple" });
      setFeedback({ tone: "success", message: "Snapshot posted to your private stream." });
      return true;
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
      return false;
    } finally {
      setBusyUpload(false);
    }
  };

  return (
    <AppShell
      eyebrow="Private Snapshot Stream"
      title="Couple snapshots"
      subtitle="Capture real moments for your partner and keep the relationship stream clear."
      showHeader={false}
    >
      <Toast tone={feedback.tone} message={feedback.message} />

      <PostComposer
        disabled={!couple?.connected}
        busy={busyUpload}
        onSubmit={publishSnapshot}
      />

      <FeedList
        posts={feed}
        deletingId={deletingId}
        onDelete={async (postId) => {
          setDeletingId(postId);
          setFeedback({ tone: "info", message: "" });

          try {
            await removePost(postId);
            setFeedback({ tone: "success", message: "Snapshot removed." });
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
            feedType: "couple",
          }).catch((error) => {
            setFeedback({ tone: "error", message: error.message });
          })
        }
        hasMore={feedMeta.hasMore}
        loading={loadingFeed}
      />
    </AppShell>
  );
}
