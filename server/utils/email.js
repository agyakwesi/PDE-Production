const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
  try {
    // Generate a test account if we don't have real creds
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });

    const verifyUrl = `http://localhost:5173/verify?token=${token}`;

    const info = await transporter.sendMail({
      from: '"Parfum d\'Élite" <noreply@parfumelite.com>',
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
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
  } catch (error) {
    console.error("Error sending email", error);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
