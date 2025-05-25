export const otpEmailTemplate = (otp: string): string => `
<table style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tbody>
    <tr>
      <td style="background: linear-gradient(to right, #8b5cf6, #ec4899); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600; letter-spacing: 1px;font-family: 'Bubblegum Sans', cursive;">bubbly</h1>
        <p style="color: #f3e8ff; font-size: 14px; margin: 8px 0 0; line-height: 1.5;">Welcome to bubbly, verify your account with this code</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 32px; text-align: center;">
        <p style="font-size: 16px; color: #374151; margin: 0 0 24px; line-height: 1.6;">Use this OTP to verify your email address:</p>
        <div style="display: inline-block; background-color: #f5f3ff; padding: 16px 24px; border-radius: 8px; font-size: 32px; font-weight: 600; color: #7c3aed; letter-spacing: 4px; border: 1px solid #e5e7eb;">${otp}</div>
        <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0; line-height: 1.6;">This OTP expires in 2 minutes. Please verify soon.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 24px; text-align: center;">
        <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.6;">Didn’t request this? Feel free to ignore this email.</p>
        <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0;">© 2025 Bubbly App. All rights reserved.</p>
      </td>
    </tr>
  </tbody>
</table>
`;

export const verificationEmailTemplate = (url: string): string => `
<table style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tbody>
    <tr>
      <td style="background: linear-gradient(to right, #8b5cf6, #ec4899); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600; letter-spacing: 1px; font-family: 'Bubblegum Sans', cursive;">bubbly</h1>
        <p style="color: #f3e8ff; font-size: 14px; margin: 8px 0 0; line-height: 1.5;">Welcome to bubbly, verify your email to join the community!</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 32px; text-align: center;">
        <p style="font-size: 16px; color: #374151; margin: 0 0 24px; line-height: 1.6;">Click below to verify your email address:</p>
        <a href="${url}" style="display: inline-block; background: linear-gradient(to right, #8b5cf6, #ec4899); color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Verify Email</a>
        <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0; line-height: 1.6;">Or copy and paste this link into your browser:</p>
        <a href="${url}" style="color: #7c3aed; font-size: 14px; word-break: break-all; text-decoration: underline;">${url}</a>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 24px; text-align: center;">
        <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.6;">Didn’t sign up? No problem, just ignore this email.</p>
        <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0;">© 2025 Bubbly App. All rights reserved.</p>
      </td>
    </tr>
  </tbody>
</table>
`;
