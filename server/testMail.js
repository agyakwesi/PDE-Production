require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    console.log(`Connecting as: ${process.env.GMAIL_USER}`);
    
    // Test the connection
    await transporter.verify();
    console.log('SMTP connection verified successfully!');

    // Send a test email
    const info = await transporter.sendMail({
      from: `"Parfum d'Élite" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // send to self
      subject: 'Test Email from PDE Server',
      text: 'If you receive this, your nodemailer setup is working perfectly!'
    });

    console.log('Test email sent successfully! Message ID:', info.messageId);
  } catch (error) {
    console.error('Email Test Failed:', error);
  }
};

testEmail();
