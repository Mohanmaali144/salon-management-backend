// Registration Email HTML
export const registrationEmail = ({ name }) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#fff; padding:20px; border-radius:8px; border:1px solid #eaeaea;">
          <h2 style="color:#007bff;">Welcome, ${name}!</h2>
          <p>Your registration was successful. We are thrilled to have you on board.</p>
        </div>
      </body>
    </html>
  `;
};

// OTP Email HTML
export const otpEmail = ({ name, otp }) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#fff; padding:20px; border-radius:8px; border:1px solid #eaeaea; text-align:center;">
          <h2 style="color:#007bff;">Your OTP Code</h2>
          <p>Hi ${name}, use the OTP below to verify your account:</p>
          <h3 style="color:#007bff;">${otp}</h3>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      </body>
    </html>
  `;
};

// Forgot Password Email HTML
export const forgotPasswordEmail = ({ name, resetLink }) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#fff; padding:20px; border-radius:8px; border:1px solid #eaeaea; text-align:center;">
          <h2 style="color:#007bff;">Password Reset</h2>
          <p>Hi ${name}, we received a request to reset your password.</p>
          <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">Reset Password</a>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      </body>
    </html>
  `;
};
// Contact Details Email HTML
export const contactDetailsEmail = ({
  name,
  email,
  mobile,
  subject,
  message,
}) => {
  const brandColor = "#31b8c6";
  const textColor = "#2d3748";
  const lightBg = "#f0f9fa";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 10px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <div style="background-color: ${brandColor}; height: 6px;"></div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: ${brandColor}; margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">
              New Inquiry Received
            </h2>
            <p style="color: #718096; font-size: 16px; margin-bottom: 30px; line-height: 1.5;">
              You have a new submission from ${process.env.APP_NAME} contact form.
            </p>

            <div style="background-color: ${lightBg}; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: ${brandColor}; font-weight: bold; width: 30%;">Name</td>
                  <td style="padding: 10px 0; font-size: 16px; color: ${textColor};">${name || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: ${brandColor}; font-weight: bold;">Email</td>
                  <td style="padding: 10px 0; font-size: 16px;">
                    <a href="mailto:${email}" style="color: ${brandColor}; text-decoration: none; font-weight: 500;">${email || "-"}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: ${brandColor}; font-weight: bold;">Phone</td>
                  <td style="padding: 10px 0; font-size: 16px; color: ${textColor};">${mobile || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: ${brandColor}; font-weight: bold;">Subject</td>
                  <td style="padding: 10px 0; font-size: 16px; color: ${textColor}; font-weight: 600;">${subject || "No Subject"}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 10px;">
              <h3 style="font-size: 16px; color: ${textColor}; margin-bottom: 12px; font-weight: 700;">Message Detail:</h3>
              <div style="background-color: #ffffff; border-left: 4px solid ${brandColor}; padding: 15px 20px; color: #4a5568; line-height: 1.6; font-style: italic; background-color: #fafafa; border-radius: 0 4px 4px 0;">
                ${message ? message.replace(/\n/g, '<br>') : "No message provided."}
              </div>
            </div>

            <div style="margin-top: 35px; text-align: center;">
              <a href="mailto:${email}" style="background-color: ${brandColor}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                Reply Directly via Email
              </a>
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7;">
            <p style="font-size: 12px; color: #a0aec0; margin: 0;">
              This is an automated notification from ${process.env.APP_NAME}.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}