import nodemailer from 'nodemailer';

export const sendEmail = async (options: { email: string; subject: string; message: string }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465', // true لـ 465 و false لـ 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  // ✅ حل مشكلة undefined بإضافة اسم افتراضي (Fallback)
  const senderName = process.env.FROM_NAME || 'أيمن بشير';
  const senderEmail = process.env.EMAIL_USER;

  const mailOptions = {
    from: `"${senderName}" <${senderEmail}>`, // الشكل الصحيح لاسم المرسل
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};