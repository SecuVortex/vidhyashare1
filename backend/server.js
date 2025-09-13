// VidyaShare Backend Server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vidyashare';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'vidyashare_secret_key_2024';

// File Upload Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/books/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// ==================== DATABASE SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    college: String,
    interests: [String],
    isPremium: { type: Boolean, default: false },
    premiumPlan: {
        type: { type: String, enum: ['monthly', 'quarterly', 'annual'] },
        startDate: Date,
        endDate: Date
    },
    walletBalance: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false }
});

// Book Schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: String,
    category: { type: String, required: true },
    language: { type: String, required: true },
    publisher: { type: String, required: true },
    publishYear: { type: Number, required: true },
    edition: String,
    pages: Number,
    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    listingType: { type: String, enum: ['rent', 'sell'], required: true },
    condition: { type: String, enum: ['new', 'excellent', 'good', 'fair'], required: true },
    conditionNotes: String,
    description: { type: String, required: true },
    highlights: String,
    images: {
        frontCover: String,
        backCover: String,
        firstPage: String,
        additional: [String]
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
        city: String,
        area: String,
        pincode: String
    },
    deliveryOptions: { type: String, enum: ['pickup', 'delivery', 'both'] },
    availability: {
        isAvailable: { type: Boolean, default: true },
        availableFrom: Date,
        minimumDuration: Number // in months
    },
    rentals: [{
        renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        startDate: Date,
        endDate: Date,
        status: { type: String, enum: ['active', 'completed', 'cancelled'] }
    }],
    reviews: [{
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        date: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transactionType: { type: String, enum: ['rent', 'purchase'], required: true },
    amount: { type: Number, required: true },
    advanceAmount: Number, // 40% for rentals
    monthlyRental: Number, // 15% of MRP for rentals
    rentalDuration: Number, // in months
    status: {
        type: String,
        enum: ['pending', 'paid', 'active', 'completed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentDetails: {
        method: String,
        transactionId: String,
        paidAt: Date
    },
    rental: {
        startDate: Date,
        endDate: Date,
        returnDate: Date,
        condition: String
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For user reviews
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    type: { type: String, enum: ['book', 'user', 'transaction'], required: true },
    helpful: { type: Number, default: 0 },
    images: [String],
    createdAt: { type: Date, default: Date.now }
});

// Premium Subscription Schema
const subscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['monthly', 'quarterly', 'annual'], required: true },
    amount: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    benefits: {
        discountPercentage: Number,
        freeDelivery: Boolean,
        freeRentals: Number,
        noAdvancePayment: Boolean
    },
    paymentDetails: {
        method: String,
        transactionId: String
    },
    createdAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Review = mongoose.model('Review', reviewSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ==================== MIDDLEWARE ====================

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
};

// ==================== API ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'VidyaShare API is running!',
        timestamp: new Date().toISOString()
    });
});

// ========== Authentication Routes ==========

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const {
            firstName, lastName, email, password,
            phone, address, city, pincode,
            college, interests
        } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            address,
            city,
            pincode,
            college,
            interests
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isPremium: user.isPremium
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isPremium: user.isPremium,
                walletBalance: user.walletBalance
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ========== Book Routes ==========

// Get all books with filters
app.get('/api/books', async (req, res) => {
    try {
        const {
            category,
            language,
            condition,
            listingType,
            minPrice,
            maxPrice,
            search,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        // Build filter
        const filter = {};
        if (category) filter.category = category;
        if (language) filter.language = language;
        if (condition) filter.condition = condition;
        if (listingType) filter.listingType = listingType;
        if (minPrice || maxPrice) {
            filter.sellingPrice = {};
            if (minPrice) filter.sellingPrice.$gte = Number(minPrice);
            if (maxPrice) filter.sellingPrice.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort
        let sortOption = {};
        switch (sort) {
            case 'price_low':
                sortOption = { sellingPrice: 1 };
                break;
            case 'price_high':
                sortOption = { sellingPrice: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'rating':
                sortOption = { averageRating: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        // Pagination
        const skip = (page - 1) * limit;

        const books = await Book.find(filter)
            .populate('owner', 'firstName lastName rating')
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const total = await Book.countDocuments(filter);

        res.json({
            books,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Get single book
app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('owner', 'firstName lastName email phone rating')
            .populate('reviews.reviewer', 'firstName lastName');

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Increment views
        book.views += 1;
        await book.save();

        res.json(book);
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

// Create book listing
app.post('/api/books', authenticateToken, upload.fields([
    { name: 'frontCover', maxCount: 1 },
    { name: 'backCover', maxCount: 1 },
    { name: 'firstPage', maxCount: 1 },
    { name: 'additional', maxCount: 3 }
]), async (req, res) => {
    try {
        const bookData = req.body;
        bookData.owner = req.user.id;

        // Handle file uploads
        if (req.files) {
            bookData.images = {
                frontCover: req.files.frontCover?.[0]?.filename,
                backCover: req.files.backCover?.[0]?.filename,
                firstPage: req.files.firstPage?.[0]?.filename,
                additional: req.files.additional?.map(file => file.filename) || []
            };
        }

        const book = new Book(bookData);
        await book.save();

        res.status(201).json({
            message: 'Book listed successfully',
            book
        });
    } catch (error) {
        console.error('Create book error:', error);
        res.status(500).json({ error: 'Failed to create book listing' });
    }
});

// ========== Transaction Routes ==========

// Create rental transaction
app.post('/api/transactions/rent', authenticateToken, async (req, res) => {
    try {
        const { bookId, rentalDuration } = req.body;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (!book.availability.isAvailable) {
            return res.status(400).json({ error: 'Book is not available for rent' });
        }

        // Calculate amounts
        const monthlyRental = Math.round(book.mrp * 0.15);
        const advanceAmount = Math.round(book.mrp * 0.40);
        const totalAmount = monthlyRental * rentalDuration;

        // Check if user is premium (no advance payment)
        const user = await User.findById(req.user.id);
        const finalAdvance = user.isPremium ? 0 : advanceAmount;

        const transaction = new Transaction({
            book: bookId,
            seller: book.owner,
            buyer: req.user.id,
            transactionType: 'rent',
            amount: totalAmount,
            advanceAmount: finalAdvance,
            monthlyRental,
            rentalDuration,
            status: 'pending',
            rental: {
                startDate: new Date(),
                endDate: new Date(Date.now() + rentalDuration * 30 * 24 * 60 * 60 * 1000)
            }
        });

        await transaction.save();

        res.status(201).json({
            message: 'Rental transaction created',
            transaction,
            paymentRequired: finalAdvance + monthlyRental // First month + advance
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// ========== Review Routes ==========

// Add review for book
app.post('/api/reviews/book/:bookId', authenticateToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const bookId = req.params.bookId;

        // Check if user has rented/bought this book
        const transaction = await Transaction.findOne({
            book: bookId,
            buyer: req.user.id,
            status: { $in: ['active', 'completed'] }
        });

        if (!transaction) {
            return res.status(403).json({ error: 'You can only review books you have rented or purchased' });
        }

        const review = new Review({
            book: bookId,
            transaction: transaction._id,
            reviewer: req.user.id,
            rating,
            comment,
            type: 'book'
        });

        await review.save();

        // Update book rating
        const book = await Book.findById(bookId);
        const allReviews = await Review.find({ book: bookId });
        
        book.averageRating = allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length;
        book.totalReviews = allReviews.length;
        await book.save();

        res.status(201).json({
            message: 'Review added successfully',
            review
        });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// ========== Premium Subscription Routes ==========

// Subscribe to premium
app.post('/api/premium/subscribe', authenticateToken, async (req, res) => {
    try {
        const { plan } = req.body;

        // Plan pricing
        const pricing = {
            monthly: { amount: 99, duration: 1 },
            quarterly: { amount: 249, duration: 3 },
            annual: { amount: 899, duration: 12 }
        };

        const planDetails = pricing[plan];
        if (!planDetails) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        // Benefits based on plan
        const benefits = {
            monthly: { discountPercentage: 10, freeRentals: 0 },
            quarterly: { discountPercentage: 15, freeRentals: 2 },
            annual: { discountPercentage: 20, freeRentals: 5 }
        };

        const subscription = new Subscription({
            user: req.user.id,
            plan,
            amount: planDetails.amount,
            endDate: new Date(Date.now() + planDetails.duration * 30 * 24 * 60 * 60 * 1000),
            benefits: {
                ...benefits[plan],
                freeDelivery: true,
                noAdvancePayment: true
            }
        });

        await subscription.save();

        // Update user premium status
        await User.findByIdAndUpdate(req.user.id, {
            isPremium: true,
            premiumPlan: {
                type: plan,
                startDate: subscription.startDate,
                endDate: subscription.endDate
            }
        });

        res.status(201).json({
            message: 'Premium subscription activated',
            subscription
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ error: 'Failed to subscribe to premium' });
    }
});

// ========== User Routes ==========

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user statistics
        const booksListed = await Book.countDocuments({ owner: req.user.id });
        const booksRented = await Transaction.countDocuments({ 
            buyer: req.user.id,
            transactionType: 'rent'
        });
        const totalEarned = await Transaction.aggregate([
            { $match: { seller: mongoose.Types.ObjectId(req.user.id), status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            user,
            stats: {
                booksListed,
                booksRented,
                totalEarned: totalEarned[0]?.total || 0,
                rating: user.rating
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password; // Don't allow password update through this route
        delete updates.email; // Don't allow email update without verification

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true }
        ).select('-password');

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`🚀 VidyaShare API Server running on port ${PORT}`);
    console.log(`📚 Access the API at http://localhost:${PORT}/api`);
});

module.exports = app;