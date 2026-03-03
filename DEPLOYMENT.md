# Deploying Tambola Pro Admin Panel 🛠️

This guide is for absolute beginners to deploy the Tambola Pro Admin Panel to the internet for free using Netlify.

## 📝 Prerequisites
Before deploying the admin panel, make sure you have:
1. **GitHub Account**: Sign up at [GitHub.com](https://github.com/).
2. **Clerk Publishable Key**: From your application on [Clerk.com](https://clerk.com/).
3. **Live Backend URL**: You must have already deployed the [Backend](https://github.com/DRLVP/tambola-pro.git) on Render and have its live URL.
4. **Netlify Account**: Sign up at [Netlify.com](https://www.netlify.com/) using your GitHub Account.

## 📥 Step 1: Fork the Repository
Make your own copy of the official Admin Panel code.
1. Make sure you are logged into GitHub.
2. Go to the official Admin Panel repository: [https://github.com/DRLVP/tambola-pro-admin.git](https://github.com/DRLVP/tambola-pro-admin.git)
3. In the top-right corner, click the **Fork** button and click **Create fork**.

## 🚀 Step 2: Deploy to Netlify
The admin panel needs a website host. Netlify handles this for free.
1. Go to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Select **GitHub** and authorize Netlify to access your repositories.
4. Select your forked `tambola-pro-admin` repository.

## 🔐 Step 3: Configure Environment Variables (.env)
The admin panel needs to know how to talk to your Backend and Clerk.
1. On the deployment screen, scroll down to **Environment variables**.
2. Click **Add environment variables** -> **New variable** and add these two:
   * **Key**: `VITE_API_URL`
     **Value**: *(Paste the live Render Backend URL here. Make sure there is NO slash `/` at the very end)*
   * **Key**: `VITE_CLERK_PUBLISHABLE_KEY`
     **Value**: *(Paste your Clerk Publishable Key here)*
3. Click **Deploy [Repo Name]**.
4. Wait a couple of minutes for it to say **"Published"**.
5. Netlify will give you a live link (e.g., `https://my-tambola-admin.netlify.app`). Click the link to open your live Admin Panel!

## 🎉 Step 4: Add to Clerk
So that users can log in on this new website:
1. Go to your [Clerk Dashboard](https://dashboard.clerk.com).
2. Click on **Configure** -> **Domains** (or Paths / URLs).
3. Ensure you add the new Netlify URL of your Admin App to the **Allowed Origins** so Clerk knows it is a safe website to login from.
