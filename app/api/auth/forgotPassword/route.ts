import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email'; 

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: 'لا يوجد حساب مسجل بهذا البريد' }, { status: 404 });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    user.passwordResetCode = hashedResetCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;
    await user.save();

    // ✅ التصميم الاحترافي لرسالة الإيميل
    const emailTemplate = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f6; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin: 0 auto;" cellpadding="0" cellspacing="0">
                
                <tr>
                  <td style="background-color: #d4af37; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 1px;">أيمن بشير</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <h2 style="color: #1a202c; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 800;">استعادة كلمة المرور 🔒</h2>
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                      مرحباً <strong>${user.name}</strong>،<br>
                      لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. يرجى استخدام رمز التحقق أدناه لإكمال العملية.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border: 2px dashed #d4af37; border-radius: 12px; padding: 20px; margin: 0 auto 30px auto; width: fit-content; min-width: 200px;">
                      <span style="font-size: 36px; font-weight: 900; color: #1a202c; letter-spacing: 8px;">${resetCode}</span>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                      <span style="color: #e53e3e; font-weight: bold;">⚠️ تنبيه:</span> هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.<br>
                      إذا لم تقم بطلب استعادة كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #a0aec0; font-size: 13px; margin: 0;">
                      &copy; ${new Date().getFullYear()} متجر أيمن بشير. جميع الحقوق محفوظة.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        email: email,
        subject: 'رمز استعادة كلمة المرور - متجر أيمن بشير',
        message: emailTemplate
      });
    } catch (emailError) {
      console.error('Email Sending Failed:', emailError);
      return NextResponse.json({ message: 'فشل إرسال الإيميل، يرجى المحاولة لاحقاً' }, { status: 500 });
    }

    return NextResponse.json({ message: 'تم إرسال رمز التحقق' }, { status: 200 });
  } catch (error) {
    console.error('Forgot Password Route Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}