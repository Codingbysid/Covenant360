import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("SMTP not configured. Email would be sent to:", to);
    console.warn("Subject:", subject);
    return { success: false, message: "SMTP not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export function generateBreachEmail(loanName: string, breachType: string, details: string) {
  return {
    subject: `⚠️ Covenant Breach Alert: ${loanName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Covenant Breach Alert</h2>
        <p><strong>Loan:</strong> ${loanName}</p>
        <p><strong>Breach Type:</strong> ${breachType}</p>
        <p><strong>Details:</strong></p>
        <p>${details}</p>
        <p style="color: #666; font-size: 12px;">
          This is an automated alert from Covenant360. Please review the dashboard for more details.
        </p>
      </div>
    `,
  };
}

