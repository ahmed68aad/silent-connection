import nodemailer from "nodemailer";

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.SMTP_FROM || `"Silent Connection" <${process.env.SMTP_USER}>`,
};

const getFromAddress = () => {
  const match = String(smtpConfig.from).match(/<([^>]+)>/);
  return match?.[1] || smtpConfig.from || smtpConfig.user;
};

const hasMailConfig = Boolean(
  smtpConfig.host && smtpConfig.port && smtpConfig.user && smtpConfig.pass && smtpConfig.from,
);

const transporter = hasMailConfig
  ? nodemailer.createTransport({
      host: smtpConfig.host,
      port: Number(smtpConfig.port),
      secure: Number(smtpConfig.port) === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    })
  : null;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export async function sendVerificationEmail({ to, name, verificationCode }) {
  if (!hasMailConfig) {
    throw new Error("SMTP email is not configured");
  }

  const safeName = escapeHtml(name);
  const safeCode = escapeHtml(verificationCode);

  await transporter.sendMail({
    from: {
      name: "Silent Connection",
      address: getFromAddress(),
    },
    to,
    subject: "Verify your Silent Connection email",
    text: `Hi ${name},\n\nUse this verification code to activate your Silent Connection account:\n${verificationCode}\n\nThis code expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #241713;">
        <h2>Verify your email</h2>
        <p>Hi ${safeName},</p>
        <p>Use this code in the app to activate your Silent Connection account:</p>
        <p style="display: inline-block; margin: 8px 0 12px; padding: 14px 18px; background: #f7efe6; border: 1px solid #eadbd2; border-radius: 10px; font-size: 28px; font-weight: 700; letter-spacing: 6px;">
          ${safeCode}
        </p>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
  });
}

export { hasMailConfig };
