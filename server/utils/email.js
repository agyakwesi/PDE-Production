const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${baseUrl}/verify?token=${token}`;

    const info = await transporter.sendMail({
      from: `"Parfum d'Élite" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email Address - Parfum d'Élite",
      text: `Welcome to Parfum d'Élite. Please verify your email by clicking the link: ${verifyUrl}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Parfum d'Élite</h2>
          <p>Thank you for requesting access to the vault. Please verify your email to complete registration and gain access.</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; margin-top: 20px;">Verify Email</a>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    return info.messageId;
  } catch (error) {
    console.error("Error sending email", error);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
