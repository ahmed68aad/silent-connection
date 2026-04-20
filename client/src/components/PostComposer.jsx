import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Link } from "react-router-dom";

export default function PostComposer({ disabled, onSubmit, busy }) {
  const fileInputRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const canSubmit = Boolean(image) && !disabled && !busy;

  return (
    <form
      className="panel"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) {
          return;
        }

        const formData = new FormData();
        formData.append("caption", caption);
        formData.append("image", image);

        Promise.resolve(onSubmit(formData)).then((success) => {
          if (success === false) {
            return;
          }

          setCaption("");
          setImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          event.target.reset();
        });
      }}
    >
      <div className="panel-header">
        <h2>Share a daily snapshot</h2>
        <p>Post one photo and a short context so your partner can feel your day.</p>
      </div>

      <label className="field composer-caption-field">
        <span>Moment note</span>
        <div className="composer-input-box">
          <textarea
            rows="4"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Where were you, and why did this moment matter?"
          />
          <button
            type="button"
            className={`composer-camera-button ${image ? "has-image" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            aria-label="Choose snapshot image"
            title={image ? "Change image" : "Choose image"}
          >
            <Camera size={19} strokeWidth={2.2} />
          </button>
          <input
            ref={fileInputRef}
            className="visually-hidden-file"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
            disabled={busy}
            required
          />
        </div>
        <p className="field-helper">
          {image ? image.name : "Tap the camera icon to attach a photo."}
        </p>
      </label>

      {disabled ? (
        <Link className="primary-button composer-action" to="/dashboard#connection">
          Connect partner first
        </Link>
      ) : (
        <button type="submit" className="primary-button composer-action" disabled={!canSubmit}>
          {busy ? "Uploading..." : image ? "Publish snapshot" : "Choose image first"}
        </button>
      )}
    </form>
  );
}
