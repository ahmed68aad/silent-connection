import AppShell from "../components/AppShell";
import ConnectionCard from "../components/ConnectionCard";
import GroupHub from "../components/GroupHub";
import InsightsPanel from "../components/InsightsPanel";
import Toast from "../components/Toast";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../state/AuthContext";
import { useTheme } from "../state/ThemeContext";
import { Camera, Info } from "lucide-react";
import { useRef, useState } from "react";

export default function ProfilePage() {
  const {
    user,
    couple,
    feed,
    groups,
    connectToPartner,
    createNewGroup,
    deleteExistingGroup,
    disconnectFromPartner,
    feedMeta,
    joinNewGroup,
    leaveExistingGroup,
    signOut,
    transferExistingGroupOwnership,
    updateMyProfileImage,
  } = useAuth();
  const { theme } = useTheme();
  const profileImageInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [busyGroups, setBusyGroups] = useState(false);
  const [busyProfileImage, setBusyProfileImage] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [feedback, setFeedback] = useState({ tone: "info", message: "" });
  const [connectionFeedback, setConnectionFeedback] = useState("");
  const [dashboardCircleId, setDashboardCircleId] = useState("");
  const [showAccountPulse, setShowAccountPulse] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const runAction = async (action, successMessage, setBusyState = setBusy) => {
    setBusyState(true);
    setFeedback({ tone: "info", message: "" });

    try {
      await action();
      if (successMessage) {
        setFeedback({ tone: "success", message: successMessage });
      }
      return true;
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
      return false;
    } finally {
      setBusyState(false);
    }
  };

  const updateProfileImageFile = async (file) => {
    if (!file) {
      return false;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    const success = await runAction(
      () => updateMyProfileImage(formData),
      "Profile image updated.",
      setBusyProfileImage,
    );

    if (success) {
      setProfileImageFile(null);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }
    }

    return success;
  };

  return (
    <AppShell
      eyebrow="Account Control Center"
      title="Dashboard"
      subtitle="Control your account, partner link, app theme, and main spaces from one place."
      showHeader={false}
      showFooter={false}
    >
      <Toast tone={feedback.tone} message={feedback.message} />

      <section id="account" className="panel account-panel">
        <div className="panel-header panel-header-inline">
          <div>
            <h2>Account details</h2>
            <p>Your identity stays hidden until you open details.</p>
          </div>
          <button
            type="button"
            className={`soft-icon-button ${showAccountDetails ? "active" : ""}`}
            onClick={() => setShowAccountDetails((current) => !current)}
            aria-label={showAccountDetails ? "Hide account details" : "Show account details"}
            title={showAccountDetails ? "Hide account details" : "Show account details"}
          >
            <Info size={18} strokeWidth={1.7} />
          </button>
        </div>
        <div className="profile-editor">
          <div className="profile-photo-control">
            <UserAvatar user={user} size="lg" />
            <button
              type="button"
              className="profile-camera-button"
              onClick={() => profileImageInputRef.current?.click()}
              disabled={busyProfileImage}
              aria-label="Change profile photo"
              title="Change profile photo"
            >
              <Camera size={17} strokeWidth={2.25} />
            </button>
            <input
              ref={profileImageInputRef}
              className="visually-hidden-file"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setProfileImageFile(file);
                updateProfileImageFile(file);
              }}
            />
          </div>
          <div className="profile-editor-copy">
            <span className="small-label">Profile image</span>
            <strong>{busyProfileImage ? "Uploading..." : user?.name || "Your profile"}</strong>
          </div>
        </div>
        {showAccountDetails ? (
          <div className="details-list">
            <div>
              <span>Name</span>
              <strong>{user?.name}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user?.email}</strong>
            </div>
            <div>
              <span>Invite code</span>
              <strong>{user?.inviteCode}</strong>
            </div>
          </div>
        ) : null}
      </section>

      <div id="connection">
        <ConnectionCard
          user={user}
          couple={couple}
          compact
          busy={busy}
          feedback={connectionFeedback}
          onConnect={(inviteCode) =>
            runAction(() => connectToPartner(inviteCode), "", setBusy).then((success) => {
              if (success) {
                setConnectionFeedback("Partner linked successfully.");
                window.setTimeout(() => setConnectionFeedback(""), 4000);
              }
              return success;
            })
          }
          onDisconnect={() =>
            runAction(() => disconnectFromPartner(), "", setBusy).then((success) => {
              if (success) {
                setConnectionFeedback("Partner link removed.");
                window.setTimeout(() => setConnectionFeedback(""), 4000);
              }
              return success;
            })
          }
        />
      </div>

      <section id="circle-controls" className="stacked-layout">
        <GroupHub
          groups={groups}
          busy={busyGroups}
          selectedGroupId={dashboardCircleId}
          showSelection
          onSelectGroup={setDashboardCircleId}
          onCreate={(payload) =>
            runAction(() => createNewGroup(payload), "Circle created successfully.", setBusyGroups)
          }
          onJoin={(inviteCode) =>
            runAction(() => joinNewGroup(inviteCode), "Joined circle successfully.", setBusyGroups)
          }
          onLeave={(groupId) =>
            runAction(
              async () => {
                await leaveExistingGroup(groupId);
                if (dashboardCircleId === groupId) {
                  setDashboardCircleId("");
                }
              },
              "Left circle successfully.",
              setBusyGroups,
            )
          }
          onTransferOwnership={(groupId, targetCoupleId) =>
            runAction(
              () => transferExistingGroupOwnership(groupId, targetCoupleId),
              "Ownership transferred successfully.",
              setBusyGroups,
            )
          }
          onDelete={(groupId) =>
            runAction(
              async () => {
                await deleteExistingGroup(groupId);
                if (dashboardCircleId === groupId) {
                  setDashboardCircleId("");
                }
              },
              "Circle deleted successfully.",
              setBusyGroups,
            )
          }
        />
      </section>

      <div className="dashboard-grid">
        <div id="account-pulse" className="panel snapshot-panel">
          <div className="panel-header panel-header-inline">
            <div>
              <h2>Account pulse</h2>
              <p>A quiet overview when you need it.</p>
            </div>
            <button
              type="button"
              className={`soft-icon-button ${showAccountPulse ? "active" : ""}`}
              onClick={() => setShowAccountPulse((current) => !current)}
              aria-label={showAccountPulse ? "Hide account pulse" : "Show account pulse"}
              title={showAccountPulse ? "Hide account pulse" : "Show account pulse"}
            >
              <Info size={18} strokeWidth={1.7} />
            </button>
          </div>
          {showAccountPulse ? (
            <div className="snapshot-grid">
              <article className="snapshot-chip">
                <span>Snapshots</span>
                <strong>{feedMeta.total}</strong>
              </article>
              <article className="snapshot-chip">
                <span>Circles</span>
                <strong>{groups.length}</strong>
              </article>
              <article className="snapshot-chip">
                <span>Partner</span>
                <strong>{couple?.connected ? "Linked" : "Open"}</strong>
              </article>
              <article className="snapshot-chip">
                <span>Theme</span>
                <strong>{theme}</strong>
              </article>
            </div>
          ) : null}
        </div>

        <div id="stats">
          <InsightsPanel feed={feed} feedMeta={feedMeta} />
        </div>
      </div>

      <section id="logout" className="panel danger-zone session-panel">
        <div className="panel-header">
          <h2>Session</h2>
          <p>Log out only when you are finished with this device.</p>
        </div>
        <div className="settings-row">
          <span>Current account</span>
          <strong>{user?.email}</strong>
        </div>
        <button type="button" className="ghost-button danger-button session-logout-button" onClick={signOut}>
          Log out
        </button>
      </section>
    </AppShell>
  );
}
