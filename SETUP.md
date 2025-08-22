# Quick Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Git

## Step 1: Clone and Setup Backend

```bash
cd backend
npm install
```

## Step 2: Configure Environment Variables

Update the `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/service-website?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_secure_123456789
NODE_ENV=development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**Important**: Replace `YOUR_USERNAME`, `YOUR_PASSWORD`, and `YOUR_CLUSTER` with your actual MongoDB Atlas credentials.

## Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

## Step 4: Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000`

## Step 5: Access the Application

### User Side
- Visit: `http://localhost:3000`
- Browse services, make bookings, contact form

### Admin Side
- Visit: `http://localhost:3000/admin/login`
- Login with: `admin@example.com` / `admin123`
- Manage bookings, services, settings, contacts

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier is fine)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get the connection string and update your `.env` file

## Testing the Application

1. **Create a Service** (Admin):
   - Login to admin panel
   - Go to Services → Add New Service
   - Fill in details and save

2. **Make a Booking** (User):
   - Go to homepage
   - Click "Book Now" on a service
   - Fill booking form
   - Complete checkout process

3. **Manage Booking** (Admin):
   - Go to Bookings in admin panel
   - Mark booking as paid
   - Generate receipt

## Common Issues

### Backend won't start
- Check if MongoDB URI is correct
- Ensure all environment variables are set
- Check if port 5000 is available

### Frontend won't start
- Make sure backend is running first
- Check if port 3000 is available
- Clear npm cache: `npm cache clean --force`

### Database connection issues
- Verify MongoDB Atlas credentials
- Check network access settings in Atlas
- Ensure IP is whitelisted

## Production Deployment

### Backend (Heroku example)
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set MONGODB_URI=your_production_uri
heroku config:set JWT_SECRET=your_production_secret
git push heroku main
```

### Frontend (Netlify example)
```bash
npm run build
# Upload build folder to Netlify
# Update API URLs to production backend
```

## Default Data

The application will automatically create:
- Default admin user (if none exists)
- Default settings with sample payment instructions
- Sample services (you can add via admin panel)

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas is properly configured
4. Check that both frontend and backend are running

## Next Steps

1. Customize the business information in Settings
2. Add your actual payment details
3. Upload service images
4. Configure email settings (optional)
5. Set up production deployment

Happy coding! 🚀