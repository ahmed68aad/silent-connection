export default function Toast({ tone = "info", message }) {
  if (!message) {
    return null;
  }

  return <div className={`toast toast-${tone}`}>{message}</div>;
}
