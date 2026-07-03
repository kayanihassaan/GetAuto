import 'dotenv/config'
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

// --- Twilio SMS ---
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = await import('twilio');
    twilioClient = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('  📱 Twilio SMS: ENABLED');
  } catch (e) {
    console.log('  📱 Twilio SMS: init failed');
  }
}

// --- Nodemailer Email (FREE) ---
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    const nodemailer = await import('nodemailer');
    transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    console.log('  📧 Email OTP: ENABLED (free)');
  } catch (e) {
    console.log('  📧 Email OTP: init failed');
  }
}

if (!twilioClient && !transporter) {
  console.log('  📱 Demo mode  — OTP shown on screen');
}

// --- JSON body parser ---
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

// --- API routes ---
async function handleAPI(req, res) {
  const body = await parseBody(req);

  if (req.url === '/api/send-otp' && req.method === 'POST') {
    const phone = body.phone || '';
    const email = body.email || '';
    const code = String(Math.floor(100000 + Math.random() * 900000));
    let sentSms = false, sentEmail = false;

    // Send via Twilio SMS
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Your GetAuto verification code is: ${code}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone.startsWith('+') ? phone : '+' + phone
        });
        sentSms = true;
      } catch (e) {
        console.error('Twilio error:', e.message);
      }
    }

    // Send via Email (free)
    if (transporter && email) {
      try {
        await transporter.sendMail({
          from: process.env.OTP_EMAIL_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'GetAuto — Your Verification Code',
          text: `Your GetAuto verification code is: ${code}\n\nThis code expires in 5 minutes.`,
          html: `<h2>GetAuto Verification</h2><p>Your code is: <b style="font-size:24px">${code}</b></p><p>Expires in 5 minutes.</p>`
        });
        sentEmail = true;
      } catch (e) {
        console.error('Email error:', e.message);
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      sent: sentSms || sentEmail,
      demo: !sentSms && !sentEmail,
      code: (!sentSms && !sentEmail) ? code : undefined
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
}

// --- Main server ---
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.url.startsWith('/api/')) return handleAPI(req, res);

  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) filePath = path.join(DIST, 'index.html');

  const ext = path.extname(filePath);
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, () => {
  const methods = [];
  if (twilioClient) methods.push('SMS (Twilio)');
  if (transporter) methods.push('Email (SMTP)');
  if (!methods.length) methods.push('Demo (code on screen)');
  console.log(`\n  🚗 GetAuto PWA`);
  console.log(`  ─────────────────────`);
  console.log(`  Local:   http://localhost:${PORT}/`);
  console.log(`  Network: http://0.0.0.0:${PORT}/`);
  console.log(`  OTP:     ${methods.join(', ')}\n`);
});
