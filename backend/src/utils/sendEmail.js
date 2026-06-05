import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    let transporter;

    // Use SMTP if configured in .env, otherwise fallback to dynamic test account
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Create dynamic ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ChapterExchange" <no-reply@chapterexchange.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully: ${info.messageId}`);

    // If using test account, print preview URL
    if (!process.env.SMTP_USER) {
      console.log(`✉️ Test Email Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error("❌ Send Email Error:", error);
    return false;
  }
};
