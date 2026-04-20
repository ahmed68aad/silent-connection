import { useState } from "react";

export default function GroupHub({
  groups,
  busy,
  onCreate,
  onJoin,
  onLeave,
  onTransferOwnership,
  onDelete,
  selectedGroupId = "",
  onSelectGroup,
  showSelection = false,
}) {
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [joinCode, setJoinCode] = useState("");
  const [ownershipTarget, setOwnershipTarget] = useState({});

  return (
    <div className="stacked-layout">
      <div className="panel">
        <div className="panel-header">
          <h2>Trusted circles</h2>
          <p>Optional spaces for close couples, while your main story remains partner-first.</p>
        </div>

        <div className="groups-list">
          {groups.length ? (
            groups.map((group) => (
              <article key={group.id} className="group-card">
                <div>
                  <h3>{group.name}</h3>
                  <p>{group.description || "No description yet."}</p>
                </div>
                <div className="group-card-meta">
                  <span>{group.memberCount} couples</span>
                  <span>Invite: {group.inviteCode}</span>
                </div>
                <div className="group-card-actions">
                  {showSelection ? (
                    <button
                      type="button"
                      className={selectedGroupId === group.id ? "primary-button" : "ghost-button"}
                      onClick={() => onSelectGroup?.(group.id)}
                    >
                      {selectedGroupId === group.id ? "Selected" : "Open circle"}
                    </button>
                  ) : null}

                  {!group.isOwner ? (
                    <button
                      type="button"
                      className="ghost-button danger-button"
                      onClick={() => onLeave(group.id)}
                      disabled={busy}
                    >
                      Leave circle
                    </button>
                  ) : (
                    <>
                      <span className="owner-badge">Owner</span>
                      <label className="field compact-field">
                        <span>Transfer ownership</span>
                        <select
                          value={ownershipTarget[group.id] || ""}
                          onChange={(event) =>
                            setOwnershipTarget((current) => ({
                              ...current,
                              [group.id]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Choose member couple</option>
                          {group.memberCoupleIds
                            .filter((coupleId) => coupleId !== group.ownerCoupleId)
                            .map((coupleId) => (
                              <option key={coupleId} value={coupleId}>
                                {coupleId}
                              </option>
                            ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() =>
                          onTransferOwnership?.(group.id, ownershipTarget[group.id] || "")
                        }
                        disabled={busy || !ownershipTarget[group.id]}
                      >
                        Transfer
                      </button>
                      <button
                        type="button"
                        className="ghost-button danger-button"
                        onClick={() => onDelete?.(group.id)}
                        disabled={busy}
                      >
                        Delete circle
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="soft-block">
              <strong>No circles yet</strong>
              <p>Create one or join with an invite code.</p>
            </div>
          )}
        </div>
      </div>

      <div className="dual-panel-grid">
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            Promise.resolve(onCreate(createForm)).then((success) => {
              if (success === false) {
                return;
              }

              setCreateForm({ name: "", description: "" });
            });
          }}
        >
          <div className="panel-header">
            <h2>Create circle</h2>
          </div>
          <label className="field">
            <span>Group name</span>
            <input
              value={createForm.name}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Weekend Circle"
              required
            />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              rows="3"
              value={createForm.description}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="A private group for close couples and shared posts."
            />
          </label>
          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? "Working..." : "Create circle"}
          </button>
        </form>

        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            Promise.resolve(onJoin(joinCode)).then((success) => {
              if (success === false) {
                return;
              }

              setJoinCode("");
            });
          }}
        >
          <div className="panel-header">
            <h2>Join circle</h2>
          </div>
          <label className="field">
            <span>Invite code</span>
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="GROUP1"
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? "Working..." : "Join circle"}
          </button>
        </form>
      </div>
    </div>
  );
}
