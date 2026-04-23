const productionRequiredEnv = [
  "JWT_SECRET",
  "MONGO_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
];

const validateProductionEnv = () => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing = productionRequiredEnv.filter((key) => !process.env[key]);
  const hasOriginConfig = Boolean(
    process.env.CLIENT_ORIGIN ||
    process.env.CLIENT_URL ||
    process.env.CORS_ORIGIN,
  );

  if (!hasOriginConfig) {
    console.warn(
      "Warning: CLIENT_ORIGIN / CLIENT_URL / CORS_ORIGIN is not configured. " +
        "API will accept requests from all origins in production.",
    );
  }

  if (missing.length) {
    throw new Error(
      `Missing production environment variables: ${missing.join(", ")}`,
    );
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }
};

export { validateProductionEnv };
