export default function AuthHero() {
  return (
    <section className="auth-hero">
      <p className="small-label">Private Couple Journal</p>
      <h1>
        One snapshot.
        <span>One honest part of your day.</span>
      </h1>
      <p>
        A calm space for committed partners to exchange real daily moments, track engagement,
        and stay emotionally present without the noise of public social apps.
      </p>

      <div className="feature-grid">
        <article className="feature-card">
          <strong>Day-by-day snapshots</strong>
          <span>Each post captures one true detail from your day.</span>
        </article>
        <article className="feature-card">
          <strong>Seen with transparency</strong>
          <span>Know if your partner saw your snapshot and when.</span>
        </article>
        <article className="feature-card">
          <strong>Private by design</strong>
          <span>Built for two first, and trusted circles when needed.</span>
        </article>
      </div>
    </section>
  );
}
