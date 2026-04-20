import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="screen-loader">
      <div className="panel not-found-card">
        <h1>404</h1>
        <p>This snapshot page does not exist.</p>
        <Link to="/" className="primary-button">
          Back to home
        </Link>
      </div>
    </div>
  );
}
