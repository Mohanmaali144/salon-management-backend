import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"No Reply" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || "", // optional plain text
      html: html || "", // optional HTML
      attachments: attachments || [], // optional attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email sending failed");
  }
};

export default sendEmail;
