import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ncjr30j'
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_uko2obk'
const EMAILJS_OTP_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID || 'template_z5h01nq'
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '953FXcHfmwhBRXr_3'
const EMAILJS_PRIVATE_KEY = import.meta.env.VITE_EMAILJS_PRIVATE_KEY || '6iRxVb2ShepCOmEkf6qy5'

// Initialize EmailJS SDK
try {
  emailjs.init(EMAILJS_PUBLIC_KEY)
} catch {
  // ignore
}

/**
 * Helper to generate custom HTML layout for email bodies
 */
function createHtmlEmailLayout(title, contentHtml) {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1117; border-radius: 12px; border: 1px solid #30363d; overflow: hidden; color: #c9d1d9; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #7b1fa2 100%); padding: 28px 24px; text-align: center;">
        <div style="display: inline-block; background: rgba(0,0,0,0.25); padding: 8px 16px; border-radius: 6px; margin-bottom: 8px;">
          <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">SYNAPSE ANALYTICS</span>
        </div>
        <h2 style="margin: 6px 0 0 0; color: #ffffff; font-size: 18px; font-weight: 600;">${title}</h2>
      </div>
      <div style="padding: 28px 24px; background-color: #161b22;">
        ${contentHtml}
      </div>
      <div style="padding: 18px 24px; background-color: #0d1117; text-align: center; border-top: 1px solid #21262d; font-size: 12px; color: #8b949e;">
        <p style="margin: 0 0 4px 0;">Synapse Analytics Security Operations Center</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} Synapse Analytics Inc. All rights reserved.</p>
      </div>
    </div>
  `
}

/**
 * Sends an automated welcome email via EmailJS to the recipient's email.
 */
export async function sendWelcomeEmail(userName, userEmail) {
  if (!userEmail || !userEmail.includes('@')) return

  const cleanName = userName || userEmail.split('@')[0]
  const cleanEmail = userEmail.trim().toLowerCase()

  const plainMessage = `Welcome to Synapse Analytics Studio, ${cleanName}! Your account authentication was successful.`
  const htmlMessage = createHtmlEmailLayout(
    'Welcome to Synapse Analytics',
    `
      <p style="font-size: 16px; color: #f0f6fc; margin-top: 0;">Hello <strong>${cleanName}</strong>,</p>
      <p style="font-size: 15px; color: #8b949e; line-height: 1.6;">Your account authentication was successful! Welcome to Synapse Analytics Studio.</p>
      <p style="font-size: 14px; color: #8b949e; line-height: 1.5;">You can now log in anytime to access enterprise dashboards, real-time analytics, and data pipeline tools.</p>
    `
  )

  const templateParams = {
    to_email: cleanEmail,
    user_email: cleanEmail,
    email: cleanEmail,
    recipient_email: cleanEmail,
    send_to: cleanEmail,
    to_name: cleanName,
    user_name: cleanName,
    name: cleanName,
    reply_to: 'support@synapseanalytics.com',
    from_name: 'Synapse Analytics Studio',
    subject: 'Welcome to Synapse Analytics Studio',
    email_subject: 'Welcome to Synapse Analytics Studio',
    title: 'Welcome to Synapse Analytics Studio',
    heading: 'Welcome to Synapse Analytics Studio',
    message: plainMessage,
    html_message: htmlMessage,
    body: plainMessage,
    content: plainMessage,
    details: plainMessage,
    login_time: new Date().toLocaleString(),
    type: 'WELCOME',
  }

  console.log(`[EmailJS Dispatching] Sending welcome email to ${cleanEmail}...`)

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: templateParams,
      }),
    })
    if (res.ok) {
      console.log(`[EmailJS Success] Welcome email delivered to ${cleanEmail}!`)
      return
    }
  } catch (err) {
    console.warn('[EmailJS Exception]:', err)
  }

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
  } catch {
    // ignore
  }
}

/**
 * Sends a password reset verification email via EmailJS directly to the user's Gmail ID.
 * Uses template_z5h01nq for OTP delivery.
 */
export async function sendPasswordResetEmail(userName, userEmail, userUsername, verificationCode) {
  if (!userEmail || !userEmail.includes('@')) return false

  const cleanName = userName || userUsername || userEmail.split('@')[0]
  const cleanEmail = userEmail.trim().toLowerCase()
  const cleanUsername = (userUsername || '').trim().replace(/^@+/, '')

  const plainMessage = `Hello ${cleanName}, Your password reset 6-digit verification code is: ${verificationCode}. Please enter this code in the web app to reset your password.`
  const htmlMessage = createHtmlEmailLayout(
    'Password Reset Security Verification Code',
    `
      <p style="font-size: 16px; color: #f0f6fc; margin-top: 0;">Hello <strong>${cleanName}</strong>,</p>
      <p style="font-size: 15px; color: #8b949e; line-height: 1.6;">
        We received a request to reset the password for your username <strong>@${cleanUsername}</strong>.
      </p>
      <p style="font-size: 14px; color: #8b949e; line-height: 1.5;">
        Your 6-digit encrypted security verification code is:
      </p>
      <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="display: block; font-size: 12px; color: #8b949e; font-family: monospace; letter-spacing: 1px; margin-bottom: 8px;">SECURITY VERIFICATION CODE</span>
        <span style="font-size: 32px; font-weight: 800; color: #28e0b0; font-family: monospace; letter-spacing: 8px;">${verificationCode}</span>
      </div>
      <p style="font-size: 13px; color: #8b949e; line-height: 1.5;">
        Enter this code in the Synapse Analytics login page to verify your identity and set your new password. This code will expire in 15 minutes.
      </p>
      <p style="font-size: 12px; color: #6e7681; margin-top: 20px;">
        If you did not request a password reset, please ignore this email. Your password will remain unchanged.
      </p>
    `
  )

  const templateParams = {
    to_email: cleanEmail,
    user_email: cleanEmail,
    email: cleanEmail,
    recipient_email: cleanEmail,
    send_to: cleanEmail,
    to_name: cleanName,
    user_name: cleanName,
    name: cleanName,
    user_username: cleanUsername,
    username: cleanUsername,
    reply_to: 'security@synapseanalytics.com',
    from_name: 'Synapse Analytics Security Admin',
    subject: `🔒 [Password Reset Code: ${verificationCode}] Synapse Analytics (@${cleanUsername})`,
    email_subject: `🔒 [Password Reset Code: ${verificationCode}] Synapse Analytics (@${cleanUsername})`,
    title: 'Password Reset Verification Code',
    heading: 'Password Reset Verification Code',
    message: plainMessage,
    html_message: htmlMessage,
    body: plainMessage,
    content: plainMessage,
    details: plainMessage,
    verification_code: verificationCode,
    otp_code: verificationCode,
    otp: verificationCode,
    code: verificationCode,
    passcode: verificationCode,
    pin: verificationCode,
    type: 'PASSWORD_RESET',
  }

  console.log(`[EmailJS Dispatching OTP] Sending reset email to ${cleanEmail} using template ${EMAILJS_OTP_TEMPLATE_ID}...`)

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_OTP_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: templateParams,
      }),
    })
    if (res.ok) {
      console.log(`[EmailJS Success] OTP verification email delivered to ${cleanEmail} via template ${EMAILJS_OTP_TEMPLATE_ID}!`)
      return true
    }
  } catch (err) {
    console.warn('[EmailJS Exception]:', err)
  }

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_OTP_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
    return true
  } catch (err) {
    console.warn('[EmailJS Fallback Exception]:', err)
    return false
  }
}
