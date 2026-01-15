export const newsletterEmailTemplate = ({ message }) => {
  const brandColor = "#31b8c6";
  const textColor = "#2d3748";
  const lightBg = "#f0f9fa";

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>

    <body style="margin:0; padding:40px 10px; background-color:#f4f7f6; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
        
        <!-- Brand strip -->
        <div style="background:${brandColor}; height:6px;"></div>

        <!-- Content -->
        <div style="padding:40px 30px;">
          <h2 style="margin:0 0 15px; color:${brandColor}; font-size:24px;">
            AaradhyArtist Newsletter
          </h2>

          <p style="color:#718096; font-size:15px; margin-bottom:30px;">
            Updates, insights, and announcements from our team.
          </p>

          <!-- Dynamic message -->
          <div style="background:${lightBg}; border-left:4px solid ${brandColor}; padding:20px; border-radius:6px; color:${textColor}; line-height:1.7;">
            ${
              message
                ? message.replace(/\n/g, "<br>")
                : "No content available."
            }
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc; padding:20px; text-align:center; border-top:1px solid #edf2f7;">
          <p style="margin:0; font-size:12px; color:#a0aec0;">
            © ${new Date().getFullYear()} AaradhyArtist · Software IT Company
          </p>
          <p style="margin-top:6px; font-size:12px; color:#a0aec0;">
            You are receiving this email because you subscribed to our newsletter.
          </p>
        </div>
      </div>
    </body>
  </html>
  `;
};
