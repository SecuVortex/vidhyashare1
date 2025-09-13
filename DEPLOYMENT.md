# 🚀 VidyaShare Vercel Deployment Guide

## Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **Git Repository**: Push your code to GitHub/GitLab

## Step 1: Setup MongoDB Atlas

1. Create a free MongoDB Atlas account
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Get your connection string (replace `<password>` with your actual password)
5. Whitelist all IP addresses (0.0.0.0/0) for development

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: vidyashare
# - Directory: ./
```

### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration
5. Click "Deploy"

## Step 3: Configure Environment Variables

In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/vidyashare?retryWrites=true&w=majority
JWT_SECRET = your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV = production
```

## Step 4: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://vidyashare.vercel.app`)
2. Test the API health check: `https://your-domain.vercel.app/api/health`
3. Try registering a new user
4. Test login functionality

## Project Structure for Vercel

```
vidyashare/
├── api/
│   └── index.js          # Main API file (Vercel serverless function)
├── css/
├── js/
│   ├── main.js
│   └── api.js            # Frontend API configuration
├── pages/
├── images/
├── index.html            # Main landing page
├── package.json          # Root package.json with dependencies
├── vercel.json          # Vercel configuration
└── .env.example         # Environment variables template
```

## Important Notes

1. **Serverless Functions**: Vercel runs your API as serverless functions
2. **Cold Starts**: First request might be slower due to cold starts
3. **File Uploads**: For production, use cloud storage (AWS S3, Cloudinary)
4. **Database**: MongoDB Atlas is recommended for production
5. **Domain**: You can add a custom domain in Vercel settings

## Troubleshooting

### Common Issues:

1. **API not working**: Check environment variables are set correctly
2. **Database connection failed**: Verify MongoDB connection string and IP whitelist
3. **CORS errors**: The API includes CORS middleware, but check if additional configuration is needed
4. **Build errors**: Ensure all dependencies are in package.json

### Debug Steps:

1. Check Vercel function logs in dashboard
2. Test API endpoints individually
3. Verify environment variables
4. Check MongoDB Atlas network access

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Performance Optimization

1. **Images**: Use Vercel's Image Optimization
2. **Caching**: Implement proper caching headers
3. **CDN**: Vercel automatically provides global CDN
4. **Database**: Use MongoDB indexes for better performance

## Security Checklist

- ✅ Environment variables are set
- ✅ JWT secret is strong and random
- ✅ MongoDB user has minimal required permissions
- ✅ CORS is properly configured
- ✅ Input validation is implemented
- ✅ Passwords are hashed with bcrypt

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review function logs in Vercel dashboard
3. Test API endpoints with tools like Postman
4. Verify MongoDB connection separately

## Success! 🎉

Your VidyaShare platform is now live on Vercel with:
- ✅ Serverless API backend
- ✅ MongoDB database
- ✅ Responsive frontend
- ✅ Global CDN
- ✅ HTTPS by default
- ✅ Automatic deployments from Git

**Your live URL**: `https://your-project-name.vercel.app`