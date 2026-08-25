const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/routes/auth.js';
let code = fs.readFileSync(file, 'utf8');

const oldFuncRegex = /async function sendOTPEmail\(email, otp, name\) \{[\s\S]*?\}\n\nasync function sendSMSOTP/;

const newFunc = `async function sendOTPEmail(email, otp, name) {
  await transporter.sendMail({
    from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: 'Verify Your Email ✨ | Houra Jewels',
    html: \`
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #f0e0c0;border-radius:12px;background:#FAFAFA;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#08183A;margin:0;font-family:serif;font-size:28px;letter-spacing:2px;">HOURA JEWELS</h1>
        </div>
        <h2 style="color:#08183A;text-align:center;">Verify Your Email ✨</h2>
        <p style="color:#333;font-size:15px;line-height:1.5;">Hi <strong>\${name || 'Customer'}</strong>,</p>
        <p style="color:#333;font-size:15px;line-height:1.5;">Thank you for creating an account with Houra Jewels.</p>
        <p style="color:#333;font-size:15px;line-height:1.5;">Please use the verification code below to verify your email address:</p>
        
        <div style="text-align:center;margin:32px 0;">
          <span style="display:inline-block;padding:12px 24px;font-size:32px;font-weight:bold;color:#08183A;background:#fff;border:2px dashed #b45309;border-radius:8px;letter-spacing:6px;">
            \${otp}
          </span>
        </div>

        <p style="color:#555;font-size:14px;line-height:1.5;text-align:center;">This code will expire in 10 minutes.</p>
        <p style="color:#555;font-size:14px;line-height:1.5;text-align:center;">For your security, do not share this code with anyone.</p>
        <p style="color:#777;font-size:13px;line-height:1.5;text-align:center;margin-top:24px;">If you did not request this verification, you can safely ignore this email.</p>

        <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #f0e0c0;">
          <p style="margin:4px 0;font-size:14px;font-weight:bold;color:#08183A;">Team Houra Jewels</p>
          <p style="margin:4px 0;font-size:12px;color:#777;">
            <a href="https://hourajewels.com" style="color:#777;text-decoration:none;">hourajewels.com</a> | 
            <a href="mailto:support@hourajewels.com" style="color:#777;text-decoration:none;">support@hourajewels.com</a>
          </p>
          <p style="margin:4px 0;font-size:12px;color:#777;">
            <a href="https://www.instagram.com/hourajewels?igsh=c2llNGRzM2RpbHZ3&utm_source=qr" style="color:#777;text-decoration:none;">Instagram: @hourajewels</a>
          </p>
          <p style="margin:16px 0 4px 0;font-size:10px;color:#aaa;">© \${new Date().getFullYear()} Houra Jewels. All rights reserved.</p>
        </div>
      </div>
    \`,
  });
}

async function sendSMSOTP`;

if (oldFuncRegex.test(code)) {
    code = code.replace(oldFuncRegex, newFunc);
    fs.writeFileSync(file, code);
    console.log('OTP Email successfully updated in auth.js!');
} else {
    console.log('Could not find sendOTPEmail function via regex.');
}
