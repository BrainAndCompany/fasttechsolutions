const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const white = fs
  .readFileSync(
    path.join(root, "public/logos/fts-logo-white-transparent.png"),
  )
  .toString("base64");
const color = fs
  .readFileSync(
    path.join(root, "public/logos/fts-logo-color-transparent.png"),
  )
  .toString("base64");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm your email — FTS Job Portal</title>
</head>
<body>
  <!--
    Supabase Auth → Email Templates → Confirm signup (Source).
    REQUIRED: Authentication → URL Configuration → Site URL = https://jobs.fts-ksa.com
    ({{ .ConfirmationURL }} then opens the job portal; do not replace that variable.)
    Subject: Confirm your email — FTS Job Portal
  -->
  <div style="margin:0;padding:0;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#0a0e12;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8ea;">
            <tr>
              <td style="background:#0690ae;padding:22px 28px;">
                <img src="data:image/png;base64,${white}" alt="Fast Tech Solutions" width="200" style="display:block;width:200px;max-width:70%;height:auto;border:0;" />
                <p style="margin:14px 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Job Portal</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h2 style="margin:0 0 12px;font-size:20px;color:#0a0e12;">Confirm your email address</h2>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4a5560;">
                  Thanks for signing up for the FTS Job Portal. Confirm your email to finish creating your account. After you confirm, you will continue at
                  <a href="https://jobs.fts-ksa.com" style="color:#067a93;text-decoration:none;">https://jobs.fts-ksa.com</a>.
                </p>
                <p style="margin:0 0 28px;">
                  <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#067a93;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 20px;">Confirm email address</a>
                </p>
                <p style="margin:0;font-size:13px;line-height:1.5;color:#4a5560;">
                  If the button does not work, copy and paste this link into your browser:<br />
                  <a href="{{ .ConfirmationURL }}" style="color:#067a93;word-break:break-all;">{{ .ConfirmationURL }}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e2e8ea;background:#f4f7f8;padding:20px 28px;">
                <img src="data:image/png;base64,${color}" alt="Fast Tech Solutions" width="140" style="display:block;width:140px;max-width:50%;height:auto;border:0;margin:0 0 14px;" />
                <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0a0e12;">HR Department</p>
                <p style="margin:0 0 10px;font-size:12px;line-height:1.5;color:#4a5560;">
                  Fast Tech Solutions<br />
                  Careers &amp; Recruitment<br />
                  Riyadh, Kingdom of Saudi Arabia
                </p>
                <p style="margin:0 0 4px;font-size:12px;line-height:1.5;color:#4a5560;">
                  <a href="mailto:hr@fts-ksa.com" style="color:#067a93;text-decoration:none;">hr@fts-ksa.com</a>
                </p>
                <p style="margin:0 0 14px;font-size:12px;line-height:1.5;color:#4a5560;">
                  <a href="https://jobs.fts-ksa.com" style="color:#067a93;text-decoration:none;">https://jobs.fts-ksa.com</a>
                </p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:#4a5560;font-style:italic;">
                  Kind regards,<br />
                  HR Department<br />
                  Fast Tech Solutions
                </p>
                <p style="margin:16px 0 0;padding-top:12px;border-top:1px solid #e2e8ea;font-size:11px;line-height:1.4;color:#4a5560;">
                  If you did not create this account, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "email-template.html"), html);
console.log("Wrote email-template.html");
