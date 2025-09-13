// VidyaShare Backend API for Vercel
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vidyashare:vidyashare123@cluster0.mongodb.net/vidyashare?retryWrites=true&w=majority';
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
        minimumDuration: Number
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
    advanceAmount: Number,
    monthlyRental: Number,
    rentalDuration: Number,
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

// Create Models
const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

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
        message: 'VidyaShare API is running on Vercel!',
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
app.post('/api/books', authenticateToken, async (req, res) => {
    try {
        const bookData = req.body;
        bookData.owner = req.user.id;

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
            paymentRequired: finalAdvance + monthlyRental
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const booksListed = await Book.countDocuments({ owner: req.user.id });
        const booksRented = await Transaction.countDocuments({ 
            buyer: req.user.id,
            transactionType: 'rent'
        });

        res.json({
            user,
            stats: {
                booksListed,
                booksRented,
                totalEarned: 0,
                rating: user.rating
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

export default app;