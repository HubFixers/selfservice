# Service Website - MERN Stack Application

A complete MERN stack web application for service booking with admin management, built with React, Node.js, Express, MongoDB, and Tailwind CSS.

## Features

### Frontend (User Side)
- **Responsive Design**: Built with Tailwind CSS for mobile-first responsive design
- **Service Browsing**: View all available services with images, descriptions, and pricing
- **Booking System**: Complete booking flow with date/time selection
- **Payment Instructions**: Multiple payment options (CashApp, PayPal, Bank Transfer)
- **File Upload**: Gift card/payment proof upload functionality
- **Contact Form**: Direct contact form for inquiries
- **Reviews Section**: Customer testimonials display

### Backend (Admin Side)
- **JWT Authentication**: Secure admin login system
- **Dashboard**: Overview of bookings, services, and contacts
- **Booking Management**: View, filter, and mark bookings as paid
- **Service Management**: CRUD operations for services with image upload
- **Settings Management**: Configure payment instructions and business info
- **Contact Management**: View and manage customer inquiries
- **PDF Generation**: Automatic receipt generation for paid bookings
- **File Upload**: Multer integration for image uploads

## Technology Stack

- **Frontend**: React 18, React Router, Tailwind CSS, Axios, React Hot Toast
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Database**: MongoDB Atlas

## Project Structure

```
service-website/
├── backend/
│   ├── config/
│   │   └── multer.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   ├── Settings.js
│   │   └── Contact.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── bookings.js
│   │   ├── settings.js
│   │   ├── contact.js
│   │   ├── upload.js
│   │   └── admin.js
│   ├── utils/
│   │   └── pdfGenerator.js
│   ├── uploads/
│   ├── receipts/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── AdminLayout.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── BookingPage.js
│   │   │   ├── CheckoutPage.js
│   │   │   ├── ConfirmationPage.js
│   │   │   └── admin/
│   │   │       ├── AdminLogin.js
│   │   │       ├── AdminDashboard.js
│   │   │       ├── AdminBookings.js
│   │   │       ├── AdminServices.js
│   │   │       ├── AdminSettings.js
│   │   │       └── AdminContacts.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` file and update with your MongoDB Atlas connection string
   - Update JWT secret and admin credentials

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/service-website?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
NODE_ENV=development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## Default Admin Credentials

- **Email**: admin@example.com
- **Password**: admin123

## API Endpoints

### Public Endpoints
- `GET /api/services` - Get all active services
- `POST /api/bookings` - Create a new booking
- `GET /api/settings` - Get payment instructions and business info
- `POST /api/contact` - Submit contact form
- `POST /api/upload/giftcard` - Upload gift card image

### Admin Endpoints (Requires Authentication)
- `POST /api/auth/login` - Admin login
- `GET /api/admin/bookings` - Get all bookings
- `PATCH /api/admin/bookings/:id/pay` - Mark booking as paid
- `GET /api/admin/services` - Get all services
- `POST /api/admin/services` - Create new service
- `PUT /api/admin/services/:id` - Update service
- `DELETE /api/admin/services/:id` - Delete service
- `GET /api/admin/settings` - Get all settings
- `PUT /api/admin/settings` - Update settings
- `GET /api/admin/contacts` - Get all contact messages

## Features in Detail

### Booking Flow
1. Customer selects a service
2. Fills booking form with personal details and preferred date/time
3. Proceeds to checkout page with payment instructions
4. Optionally uploads payment proof
5. Receives booking confirmation

### Admin Management
1. Secure login with JWT authentication
2. Dashboard with key metrics and recent bookings
3. Booking management with payment tracking
4. Service management with image uploads
5. Settings configuration for payment methods
6. Contact message management

### Payment Integration
- Multiple payment options (CashApp, PayPal, Bank Transfer)
- Configurable retainer amounts
- Payment proof upload
- Automatic receipt generation

## Deployment

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Update the `MONGODB_URI` in your `.env` file

### Production Deployment
1. Build the frontend:
```bash
cd frontend && npm run build
```

2. Deploy backend to your preferred hosting service (Heroku, DigitalOcean, etc.)
3. Deploy frontend build files to a static hosting service (Netlify, Vercel, etc.)
4. Update environment variables for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact [your-email@example.com]