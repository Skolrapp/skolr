# Skolr Recovery Checklist

Project folder:
- `/Users/rogersmwombekimulima/Documents/New project/skolrfinal-restored`

Important local secret file:
- `.env.local`

Core services:
- GitHub
- Vercel
- Supabase
- Domain/DNS provider
- Bunny or other video/storage provider
- Flutterwave when payments are enabled

What to keep backed up:
- GitHub repository URL
- Vercel project URL
- Supabase project URL
- Domain registrar login
- DNS provider login
- Environment variable names and values
- Deployment steps
- Recovery contact email

Recommended storage split:
- Google Drive: this checklist and other non-secret recovery notes
- Encrypted file: `.env.local` backup
- Password manager: long-term home for all secrets

Recovery steps:
1. Get a new laptop.
2. Install Git, Node.js, and npm.
3. Clone the Skolr repository from GitHub.
4. Restore `.env.local` from the encrypted backup.
5. Run `npm install`.
6. Run `npm run build`.
7. Redeploy or continue development.

Security steps if a laptop is lost:
1. Change GitHub password.
2. Rotate Supabase keys.
3. Rotate Vercel-related secrets.
4. Rotate payment and webhook secrets.
5. Sign out of the lost device where possible.
