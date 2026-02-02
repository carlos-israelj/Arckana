# Vercel Deployment Guide - Arckana Frontend

Complete guide to deploy your Arckana frontend to Vercel for public access.

---

## Prerequisites

- ✅ Frontend tested locally (http://localhost:3000)
- ✅ GitHub account
- ✅ Vercel account (free tier works)
- ✅ Code pushed to GitHub repository

---

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (If Not Done)

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/iExecPrueba/Arcana

# Check if git is initialized
git status

# If not initialized:
git init
git add .
git commit -m "Initial commit - Arckana project for Hack4Privacy 2026"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `Arckana` or `arckana-dividend-calculator`
3. Description: "Confidential dividend distribution for tokenized RWA using iExec TEE"
4. Choose: **Public** (for hackathon visibility)
5. **Do NOT** initialize with README (you already have code)
6. Click "Create repository"

### 1.3 Push to GitHub

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/Arckana.git

# Push code
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username.

---

## Step 2: Prepare Frontend for Deployment

### 2.1 Create `.gitignore` (If Not Exists)

```bash
cd frontend

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel
EOF
```

### 2.2 Verify `package.json` Scripts

Make sure these scripts exist in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 2.3 Test Build Locally

```bash
# Test that build works
npm run build

# If successful, test production server
npm run start
```

**If build fails**, fix errors before deploying to Vercel.

---

## Step 3: Deploy to Vercel

### 3.1 Sign Up / Login to Vercel

1. Go to https://vercel.com/
2. Click "Sign Up" (or "Login" if you have an account)
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### 3.2 Import Project

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find your repository: `Arckana` or `arckana-dividend-calculator`
4. Click **"Import"**

### 3.3 Configure Project

#### Framework Preset
- Vercel should auto-detect: **Next.js**
- If not, select "Next.js" from dropdown

#### Root Directory
- If your frontend is in a subdirectory:
  - Click "Edit" next to Root Directory
  - Enter: `frontend`
  - Click "Continue"

- If frontend is at repository root:
  - Leave as is

#### Build and Output Settings
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

Leave these as default unless you have custom configuration.

### 3.4 Environment Variables

**IMPORTANT**: Add all environment variables from `.env.local`

Click **"Environment Variables"** section and add:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = your_walletconnect_project_id
NEXT_PUBLIC_ARCANA_TOKEN_ADDRESS = 0xaF7B67b88128820Fae205A07aDC055ed509Bdb12
NEXT_PUBLIC_DIVIDEND_POOL_ADDRESS = 0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217
NEXT_PUBLIC_PAYMASTER_ADDRESS = 0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS = 0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D
NEXT_PUBLIC_IAPP_ADDRESS = 0x4dF342F232BD89705090c00081924555E849FDb5
NEXT_PUBLIC_RPC_URL = https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_IEXEC_CHAIN_ID = 421614
```

**For each variable**:
1. Enter **Name** (e.g., `NEXT_PUBLIC_ARCANA_TOKEN_ADDRESS`)
2. Enter **Value** (e.g., `0xaF7B67b88128820Fae205A07aDC055ed509Bdb12`)
3. Select environment: **Production**, **Preview**, and **Development**
4. Click "Add"

**WalletConnect Project ID**:
- If you don't have one yet, use a placeholder: `placeholder_get_from_walletconnect`
- Get real one from: https://cloud.walletconnect.com/

### 3.5 Deploy

1. Review settings:
   - ✅ Framework: Next.js
   - ✅ Root Directory: `frontend` (or root)
   - ✅ Build Command: `npm run build`
   - ✅ Environment Variables: All added
2. Click **"Deploy"**

---

## Step 4: Wait for Build

### Build Process
Vercel will now:
1. Clone your repository
2. Install dependencies (`npm install`)
3. Run build command (`npm run build`)
4. Deploy to CDN

**Expected time**: 2-5 minutes

### Monitor Build
You'll see real-time logs:
```
Installing dependencies...
Running "npm install"
...
Building...
Running "npm run build"
...
Deploying...
✓ Build completed
```

### If Build Succeeds ✅
You'll see: **"Congratulations! Your project has been deployed"**

Your live URL will be shown, e.g.:
```
https://arckana-dividend-calculator.vercel.app
https://arckana-dividend-calculator-git-main-yourname.vercel.app
```

### If Build Fails ❌
1. Click on **"View Build Logs"**
2. Find the error message
3. Common issues:
   - **TypeScript errors**: Fix type issues in code
   - **Missing dependencies**: Add to package.json
   - **Build command error**: Check package.json scripts
4. Fix errors locally, commit, push to GitHub
5. Vercel will automatically rebuild

---

## Step 5: Test Deployed Site

### 5.1 Visit Your Live URL

Open your Vercel URL in a browser:
```
https://your-project-name.vercel.app
```

### 5.2 Test Wallet Connection

1. Click "Connect Wallet"
2. Connect with MetaMask/WalletConnect
3. Switch to Arbitrum Sepolia
4. Verify connection works

### 5.3 Test Components

Go through the same testing as local:
- ✅ Protect Balance component
- ✅ Distribution Status component
- ✅ Claim Dividend component

### 5.4 Check Contract Interactions

Try reading data from contracts:
- Current round
- Merkle roots
- Your balance

---

## Step 6: Custom Domain (Optional)

### Add Your Own Domain

If you have a domain (e.g., `arckana.com`):

1. Go to Vercel project settings
2. Click **"Domains"**
3. Click **"Add Domain"**
4. Enter your domain: `arckana.com` or `app.arckana.com`
5. Follow DNS configuration instructions
6. Add DNS records to your domain provider
7. Wait for DNS propagation (5-30 minutes)

### Vercel Provides Free SSL
All deployed sites get free HTTPS automatically.

---

## Step 7: Continuous Deployment

### Automatic Deploys

Every time you push to GitHub:
1. Vercel detects the push
2. Automatically builds new version
3. Deploys if build succeeds
4. Updates live site

### Preview Deployments

For branches and pull requests:
- Vercel creates preview URLs
- Test changes before merging to main
- Each PR gets unique URL

### Production Deployments

Only `main` branch deploys to production:
```
https://your-project.vercel.app
```

Preview branches get URLs like:
```
https://your-project-git-feature-branch.vercel.app
```

---

## Step 8: Vercel Dashboard Features

### Analytics
- View page views
- See visitor locations
- Monitor performance

### Logs
- Real-time function logs
- Error tracking
- Performance metrics

### Settings
- Environment variables
- Build settings
- Custom domains
- Team members

---

## Troubleshooting Deployment Issues

### Issue: "Build failed - Module not found"
**Cause**: Missing dependency
**Fix**:
```bash
npm install <missing-package>
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

### Issue: "Environment variable not found"
**Cause**: Variable not set in Vercel
**Fix**:
1. Go to Vercel project settings
2. Click "Environment Variables"
3. Add missing variable
4. Redeploy

### Issue: "Invalid configuration"
**Cause**: Wrong build settings
**Fix**:
1. Go to Vercel project settings
2. Click "General"
3. Update build command or output directory
4. Save and redeploy

### Issue: "Wallet won't connect on deployed site"
**Cause**: Missing NEXT_PUBLIC_ prefix or wrong URL
**Fix**:
1. Verify all wallet-related env vars have `NEXT_PUBLIC_` prefix
2. Check CORS settings
3. Verify RPC URL is accessible

---

## Best Practices

### Environment Variables
- ✅ Always prefix with `NEXT_PUBLIC_` for client-side access
- ✅ Never commit `.env.local` to git
- ✅ Use different values for dev/production if needed

### Version Control
- ✅ Commit often with clear messages
- ✅ Use branches for features
- ✅ Test locally before pushing

### Monitoring
- ✅ Check Vercel analytics regularly
- ✅ Monitor build times
- ✅ Watch for errors in logs

---

## Post-Deployment Checklist

- [ ] Site deployed successfully
- [ ] Live URL accessible
- [ ] Wallet connection works
- [ ] All components render correctly
- [ ] Smart contract addresses correct
- [ ] Network switching works
- [ ] Transactions can be created
- [ ] No console errors
- [ ] HTTPS enabled (automatic)
- [ ] Custom domain added (optional)
- [ ] Shared URL with team/judges

---

## Sharing Your Deployment

### For Hackathon Submission

Include these URLs:
```
Live App: https://your-project.vercel.app
GitHub: https://github.com/YOUR_USERNAME/Arckana
iApp: 0x4dF342F232BD89705090c00081924555E849FDb5
Contracts: See DEPLOYMENT_SUMMARY.md
```

### Social Media
Share your deployed app:
```
🚀 Just deployed Arckana - confidential dividend distribution for RWA!

Built with:
- @iEx_ec TEE for privacy
- @arbitrum for scalability
- Next.js + RainbowKit

Try it: https://your-project.vercel.app

#Hack4Privacy #Web3 #Privacy
```

---

## Updating Your Deployment

### Make Changes
```bash
# Edit code locally
# Test changes: npm run dev

# When ready:
git add .
git commit -m "Description of changes"
git push
```

### Automatic Redeploy
- Vercel detects push
- Builds new version
- Deploys automatically
- Live in 2-3 minutes

### Manual Redeploy
From Vercel dashboard:
1. Go to "Deployments"
2. Click "..." on any deployment
3. Click "Redeploy"

---

## Vercel Limits (Free Tier)

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Analytics included
- ⚠️ Build time: 6000 minutes/month
- ⚠️ Serverless function execution: 100GB-Hrs

For most projects, free tier is sufficient!

---

## Alternative: Deploy to Other Platforms

If you prefer other platforms:

### Netlify
- Similar to Vercel
- Good Next.js support
- Free tier available

### Railway
- Good for full-stack apps
- Includes databases
- Free tier with limits

### AWS Amplify
- AWS ecosystem
- Good scalability
- More complex setup

**Recommendation**: Start with Vercel for simplicity.

---

## Support Resources

### Vercel Docs
- https://vercel.com/docs
- Next.js deployment: https://vercel.com/docs/frameworks/nextjs

### Vercel Community
- Discord: https://vercel.com/discord
- GitHub Discussions: https://github.com/vercel/vercel/discussions

### Get Help
- Vercel Support: support@vercel.com
- Next.js Discord: https://nextjs.org/discord

---

## Deployment Summary Template

After deployment, document:

```markdown
## Deployment Information

**Date**: 2026-02-01
**Platform**: Vercel
**Live URL**: https://your-project.vercel.app
**GitHub**: https://github.com/YOUR_USERNAME/Arckana

### Build Status
- Build Time: X minutes
- Deploy Time: Y minutes
- Status: ✅ Success

### Environment
- Framework: Next.js 14.1.0
- Node Version: 18.x
- Build Command: npm run build
- Output Directory: .next

### Features Verified
- [x] Homepage loads
- [x] Wallet connection
- [x] Components render
- [x] Contract interactions
- [x] HTTPS enabled

### URLs
- Production: https://your-project.vercel.app
- Preview: https://your-project-git-dev.vercel.app
```

---

## Ready to Deploy!

Follow the steps above to deploy your Arckana frontend to Vercel.

**Estimated Time**: 15-30 minutes (first time)

**Good luck! 🚀**

---

**Last Updated**: 2026-02-01
**Next Step**: Deploy to Vercel
**Status**: Ready
