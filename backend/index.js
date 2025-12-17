const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { log } = require("console");
const { useResolvedPath } = require("react-router-dom");

app.use(express.json());
app.use(cors());

// Database Connection with MongoDB
mongoose.connect("mongodb+srv://kennethadmin:kennethpassword@cluster0.bnsii0x.mongodb.net/ecommerce")

// API Creation

app.get("/", (req, res)=>{
    res.send("Express App is running")
})

// Image Storage Engine

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})


// Creating Upload endpoint for Images
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single("product"), (req, res)=>{
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}` 
    })
})

// Create Schema for Products

const Product = mongoose.model("Product", {
    id:{
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,        
    },
    new_price:{
        type: Number,
        required: true,
    },
    old_price:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now,
    },
    available:{
        type: Boolean,
        default: true,
    },   
})

app.post('/addproduct', async(req, res)=>{
    let products = await Product.find({});
    let id;
    if (products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved to Database");
    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating API for deleting Products

app.post('/removeproduct', async(req, res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed from the Database");
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API for updating Products
app.post('/updateproduct', async(req, res)=>{
    try {
        const { id, name, old_price, new_price, category } = req.body;
        
        const updatedProduct = await Product.findOneAndUpdate(
            { id: id }, 
            { 
                name: name,
                old_price: old_price,
                new_price: new_price,
                category: category,
                date: new Date() 
            },
            { new: true } 
        );
        
        if (updatedProduct) {
            console.log("Product updated:", updatedProduct);
            res.json({
                success: true,
                message: "Product updated successfully",
                product: updatedProduct
            });
        } else {
            console.log("Product not found with id:", id);
            res.json({
                success: false,
                message: "Product not found"
            });
        }
    } catch (error) {
        console.error("Update error:", error);
        res.json({
            success: false,
            message: error.message
        });
    }
})

// Creating API for getting all Products

app.get('/allproducts', async(req, res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

app.listen(port, (error)=>{
    if (!error){
        console.log("Server running on port "+port)
    }
    else{
        console.log("Error: "+error)
    }
})

// User Schema

const User = mongoose.model('User',{
    name: {
        type:String,
    },
    email:{
        type: String,
        unique: true,
    },
    password:{
        type: String,
    },
    cartData:{
        type: Object,
    },
    date:{
        type: Date,
        default: Date.now,
    }
})

// Creating Endpoint for User Registration

app.post('/signup', async(req, res)=>{
    let check = await User.findOne({email:req.body.email});
    if (check) {
        return res.status(400).json({success:false, errors:"E-mail address already in use!"})
    }
    let cart = {};
    for (let i = 0; i < 300; i++){
        cart[i] = 0;
    }
    const user = new User({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({success:true, token})
})

//User Login
app.post('/login', async(req, res)=>{
    let user = await User.findOne({email:req.body.email});
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare){
            const data = {
                user:{
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({success: true, token});
        }
        else {
            res.json({success: false, errors: "Incorrect e-mail or password"})
        }
    }
    else{
        res.json({success: false, errors:"Incorrect e-mail or password"})
    }
})

// Endpoint for New Collection
app.get('/newcollections', async(req, res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection fetched");
    res.send(newcollection);
})

//Endpoint for Popular

app.get('/popular', async(req, res)=>{
    let products = await Product.find({category:"womens"});
    let popular = products.slice(0,4);
    console.log("Popular section fetched");
    res.send(popular);
})

// Middleware to fetch User

    const fetchUser = async(req, res, next)=>{
        const token = req.header('auth-token');
        if (!token){
            res.status(401).send({errors: "Invalid Token. Logout and Login again."})
        }
        else{
            try{
                const data = jwt.verify(token, 'secret_ecom');
                req.user = data.user;
                next();
            } catch(error){
                res.status(401).send({errors:"Invalid Token. Logout and Login again."})
            }
        }
    }

// Adding Items in Cart

app.post('/addtocart', fetchUser, async(req, res)=>{
    try {
        console.log("Adding", req.body.itemId, "to cart for user:", req.user.id);
        
        let userData = await User.findOne({_id:req.user.id});
        
        if (!userData) {
            return res.status(404).json({success: false, error: "User not found"});
        }
        
        if (!userData.cartData) {
            userData.cartData = {};
        }
        
        const itemId = req.body.itemId;
        
        if (!userData.cartData[itemId]) {
            userData.cartData[itemId] = 0;
        }
        
        userData.cartData[itemId] += 1;
        
        await User.findOneAndUpdate(
            {_id: req.user.id},
            {cartData: userData.cartData},
            {new: true}
        );
        
        console.log("Cart updated. Item", itemId, "quantity:", userData.cartData[itemId]);
        
        res.json({
            success: true,
            message: "Item added to cart",
            cartData: userData.cartData,
            itemId: itemId,
            quantity: userData.cartData[itemId]
        });
        
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({success: false, error: error.message});
    }
});


// Remove Product in Cart
app.post('/removefromcart', fetchUser, async(req, res)=>{
    try {
        console.log("Removing", req.body.itemId, "from cart for user:", req.user.id);
        
        let userData = await User.findOne({_id:req.user.id});
        
        if (!userData) {
            return res.status(404).json({success: false, error: "User not found"});
        }
        
        if (!userData.cartData) {
            userData.cartData = {};
        }
        
        const itemId = req.body.itemId;
        
        if(userData.cartData[itemId] > 0) {
            userData.cartData[itemId] -= 1;
            
            if (userData.cartData[itemId] === 0) {
                delete userData.cartData[itemId];
            }
        } else {
            return res.json({
                success: false,
                message: "Item not in cart"
            });
        }
        
        await User.findOneAndUpdate(
            {_id: req.user.id},
            {cartData: userData.cartData},
            {new: true}
        );
        
        console.log("Cart updated. Item", itemId, "quantity:", userData.cartData[itemId] || 0);
        
        res.json({
            success: true,
            message: "Item removed from cart",
            cartData: userData.cartData,
            itemId: itemId,
            quantity: userData.cartData[itemId] || 0
        });
        
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({success: false, error: error.message});
    }
});

// Get Cart Items
app.post('/getcart', fetchUser, async(req, res)=>{
    try {
        console.log("Getting cart for user:", req.user.id);
        
        let userData = await User.findOne({_id:req.user.id});
        
        if (!userData) {
            return res.status(404).json({success: false, error: "User not found"});
        }
        
        res.json({
            success: true,
            cartData: userData.cartData || {}
        });
        
    } catch (error) {
        console.error("Error getting cart:", error);
        res.status(500).json({success: false, error: error.message});
    }
});

// Transaction Schema
const Transaction = mongoose.model('Transaction', {
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    items: [{
        productId: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'cash'],
        default: 'card'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled', 'shipped', 'delivered'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    notes: String
});

// Generate unique transaction ID
const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TXN-${timestamp}-${random}`;
};

// Checkout endpoint
app.post('/checkout', fetchUser, async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;
        const userId = req.user.id;
        
        // Get user data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        
        // Get user's cart
        const cartItems = user.cartData || {};
        
        // Get products from cart
        const productIds = Object.keys(cartItems).filter(id => cartItems[id] > 0);
        const products = await Product.find({ id: { $in: productIds.map(id => parseInt(id)) } });
        
        if (products.length === 0) {
            return res.status(400).json({ success: false, error: "Cart is empty" });
        }
        
        // Prepare transaction items
        const transactionItems = products.map(product => ({
            productId: product.id,
            name: product.name,
            price: product.new_price,
            quantity: cartItems[product.id],
            image: product.image
        }));
        
        // Calculate total amount
        const totalAmount = transactionItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        // Create transaction
        const transaction = new Transaction({
            transactionId: generateTransactionId(),
            userId: userId,
            userName: user.name,
            userEmail: user.email,
            items: transactionItems,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod,
            status: 'pending'
        });
        
        await transaction.save();
        
        // Clear user's cart after checkout
        user.cartData = {};
        await user.save();
        
        console.log(`Transaction created: ${transaction.transactionId} for user ${user.email}`);
        
        res.json({
            success: true,
            message: "Checkout successful",
            transactionId: transaction.transactionId,
            transaction: transaction
        });
        
    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all transactions (admin)
app.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .sort({ createdAt: -1 }) // Newest first
            .limit(100);
        
        res.json({
            success: true,
            transactions: transactions
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's transactions
app.post('/mytransactions', fetchUser, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            transactions: transactions
        });
    } catch (error) {
        console.error("Error fetching user transactions:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update transaction status (admin)
app.post('/updatetransaction', async (req, res) => {
    try {
        const { transactionId, status, notes } = req.body;
        
        const transaction = await Transaction.findOneAndUpdate(
            { transactionId: transactionId },
            { 
                status: status,
                notes: notes,
                updatedAt: new Date()
            },
            { new: true }
        );
        
        if (!transaction) {
            return res.status(404).json({ success: false, error: "Transaction not found" });
        }
        
        console.log(`Transaction ${transactionId} updated to status: ${status}`);
        
        res.json({
            success: true,
            message: "Transaction updated successfully",
            transaction: transaction
        });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get transaction by ID
app.get('/transaction/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ transactionId: req.params.id });
        
        if (!transaction) {
            return res.status(404).json({ success: false, error: "Transaction not found" });
        }
        
        res.json({
            success: true,
            transaction: transaction
        });
    } catch (error) {
        console.error("Error fetching transaction:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});