import { useState } from "react";
import UserAvatar from "./UserAvatar";

export default function ConnectionCard({
  user,
  couple,
  onConnect,
  onDisconnect,
  busy,
  compact = false,
  feedback = "",
}) {
  const [inviteCode, setInviteCode] = useState("");

  return (
    <div className={`panel connection-panel ${compact ? "compact-panel" : ""}`}>
      <div className="panel-header">
        <h2>{couple?.connected ? "Your connection line" : "Connect your partner"}</h2>
        <p>
          {couple?.connected
            ? "You are linked and ready to exchange daily snapshots."
            : "Share your invite code or enter theirs to start posting together."}
        </p>
      </div>

      {feedback ? <div className="inline-status">{feedback}</div> : null}

      <div className="connection-grid">
        <div className="soft-block">
          <div className="profile-summary">
            <UserAvatar user={user} size="md" />
            <div>
              <span className="small-label">You</span>
              <strong>{user?.name || "Your account"}</strong>
            </div>
          </div>
          <span className="small-label">Your invite code</span>
          <strong className="invite-code">{user?.inviteCode || "------"}</strong>
          <p>Share this once to connect safely.</p>
        </div>

        {couple?.connected ? (
          <div className="soft-block">
            <div className="profile-summary">
              <UserAvatar user={couple.partner} size="md" />
              <div>
                <span className="small-label">Partner</span>
                <strong>{couple.partner?.name || "Connected"}</strong>
              </div>
            </div>
            <p>{couple.partner?.email || "Private partner account"}</p>
          </div>
        ) : (
          <form
            className="connect-form"
            onSubmit={(event) => {
              event.preventDefault();
              onConnect(inviteCode);
              setInviteCode("");
            }}
          >
            <label className="field">
              <span>Partner invite code</span>
              <input
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                placeholder="ABC123"
                required
              />
            </label>
            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? "Connecting..." : "Link partner"}
            </button>
          </form>
        )}
      </div>

      {couple?.connected ? (
        <div className="connection-actions">
          <button
            type="button"
            className="ghost-button danger-button"
            onClick={onDisconnect}
            disabled={busy}
          >
            {busy ? "Working..." : "Disconnect link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
