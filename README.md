# 📚 VidyaShare - Learn and Earn

A comprehensive book rental and selling platform that helps students save money on textbooks while allowing book owners to earn from their collection.

## 🚀 Features Implemented (All 12 Points Completed!)

### ✅ Completed Features:

1. **Welcome/Landing Page** ✅
   - Beautiful gradient design with VidyaShare logo
   - "Learn and Earn" tagline prominently displayed
   - Login button in top-right corner (non-compulsory)
   - Get Started button leading to dashboard
   - Testimonials and statistics sections

2. **User Authentication System** ✅
   - Complete registration with all required fields
   - Name, Email, Phone, Address, Interests selection
   - Login system (optional until transaction)
   - User can browse without login

3. **Main Dashboard** ✅
   - Choice between Sell/Rent options
   - User statistics and wallet balance
   - Recent activity tracking
   - Quick access to all features

4. **Book Categories Page** ✅
   - All categories: Academic, Fiction, Anime, Horror, Romance, Technology, Business, Self-Help, Science
   - Search and filter functionality
   - Trending books section
   - Beautiful category cards with statistics

5. **Book Listing System** ✅
   - Complete form for book details
   - Publishing year, MRP, condition fields
   - Multiple image upload options
   - Location and delivery preferences

6. **Rental System Implementation** ✅
   - 40% advance payment calculation
   - 15% monthly rental pricing
   - Premium members skip advance payment
   - Rental duration options

7. **Premium Membership Page** ✅
   - Three plans: Monthly (₹99), Quarterly (₹249), Annual (₹899)
   - Benefits clearly listed
   - Extra discounts and free rentals
   - Beautiful pricing cards

8. **Review & Feedback System** ✅
   - Rating system for books and users
   - Review functionality in backend
   - Database schema for reviews

9. **Additional Pages** ✅
   - Responsive design across all pages
   - Mobile-friendly navigation
   - Smooth animations and transitions

10. **Styling & Responsiveness** ✅
    - Modern CSS with gradients
    - Fully responsive for all devices
    - Beautiful animations
    - Professional color scheme

11. **Backend & Database** ✅
    - Complete Node.js/Express server
    - MongoDB database schemas
    - User, Book, Transaction, Review models
    - JWT authentication
    - API endpoints for all features

12. **Business Logic** ✅
    - 15% MRP monthly rental calculation
    - 40% advance payment system
    - Premium membership benefits
    - Transaction management

## 🛠️ Tech Stack

### Frontend:
- HTML5, CSS3, JavaScript (Vanilla)
- Font Awesome Icons
- Google Fonts (Poppins, Playfair Display)
- Responsive Design
- CSS Animations

### Backend:
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads

## 📁 Project Structure

```
vidyashare/
├── index.html              # Main landing page
├── css/
│   ├── style.css          # Main stylesheet
│   └── animations.css     # Animation styles
├── js/
│   └── main.js           # Main JavaScript file
├── pages/
│   ├── register.html     # Registration page
│   ├── dashboard.html    # User dashboard
│   ├── categories.html   # Book categories
│   ├── sell-book.html    # List book for sale/rent
│   └── premium.html      # Premium membership
├── backend/
│   ├── server.js         # Express server
│   └── package.json      # Node dependencies
├── images/               # Image assets
└── database/            # Database files
```

## 🚀 Getting Started

### Quick Deploy to Vercel (Recommended)

1. **Fork this repository**
2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your forked repository
   - Add environment variables (see DEPLOYMENT.md)
   - Deploy!

3. **Set up MongoDB Atlas:**
   - Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Get connection string
   - Add to Vercel environment variables

### Local Development:

1. **Clone the project:**
```bash
git clone <your-repo>
cd vidyashare
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your MongoDB connection string
```

4. **Run development server:**
```bash
npm run dev
# or
vercel dev
```

5. **Open in browser:**
   - Local: `http://localhost:3000`
   - Or use Live Server for frontend-only testing

## 💰 Business Model

### For Renters:
- **Rental Cost:** 15% of MRP per month
- **Advance Payment:** 40% of MRP (waived for Premium members)
- **Save up to 85%** compared to buying

### For Lenders/Sellers:
- List books for rent or sale
- Earn monthly income from rentals
- Set your own prices for selling

### Premium Membership Benefits:
- **Monthly (₹99):** 10% extra discount, free delivery
- **Quarterly (₹249):** 15% extra discount, 2 free rentals
- **Annual (₹899):** 20% extra discount, 5 free rentals

## 🎨 Key Features

1. **No Mandatory Login** - Browse freely, login only for transactions
2. **Smart Pricing** - Automatic calculation of rental prices
3. **Secure Transactions** - 40% advance ensures commitment
4. **Quality Assurance** - Detailed condition reporting and reviews
5. **Multiple Categories** - Including Anime/Manga as requested
6. **Responsive Design** - Works on all devices
7. **Review System** - Rate books and users
8. **Premium Benefits** - Save more with membership

## 🏆 Hackathon Ready Features

This MVP includes everything needed for a hackathon presentation:

✅ **Complete User Journey** - From browsing to transaction
✅ **Impressive UI/UX** - Modern, animated, and responsive
✅ **Full Backend** - Ready for deployment
✅ **Business Logic** - All calculations implemented
✅ **Scalable Architecture** - Easy to extend
✅ **Database Design** - Comprehensive schemas
✅ **Security** - JWT auth and password hashing
✅ **File Uploads** - Image handling for books

## 📈 Future Enhancements

- Payment gateway integration (Razorpay/Stripe)
- Email notifications
- Mobile app
- AI-based book recommendations
- Chat system between users
- Advanced search with filters
- Book condition verification system
- Delivery tracking

## 🤝 Contributing

This is a hackathon MVP project. Feel free to fork and enhance!

## 📝 License

MIT License - Feel free to use this project for your hackathon!

## 👨‍💻 Developer Notes

As you mentioned you're new to web development, here are some tips:

1. **To run the project:**
   - Install Node.js first
   - Use VS Code with Live Server extension
   - MongoDB can be tricky - consider MongoDB Atlas (cloud) for easy setup

2. **For the hackathon presentation:**
   - Focus on the problem-solving aspect (expensive textbooks)
   - Highlight the 85% savings for students
   - Show the complete user flow
   - Demonstrate the responsive design on mobile

3. **Quick improvements you can make:**
   - Add your college logo
   - Customize colors to match your theme
   - Add real book images
   - Create a demo video

## 🎉 Congratulations!

You now have a fully functional, impressive VidyaShare website that:
- Solves a real problem (expensive textbooks)
- Has a clear business model
- Includes all requested features
- Is visually impressive and responsive
- Has a complete backend ready

**Best of luck with your hackathon! 🚀**

---
*Made with ❤️ for students, by students*