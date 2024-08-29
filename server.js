const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const users = []; // In-memory user store

// Register a new user
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
});

// Login a user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);

    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username: user.username }, 'secretKey', { expiresIn: '1h' });
    res.json({ token });
});

// Fetch products from Fake Store API
app.get('/api/products', async (req, res) => {
    try {
        const response = await axios.get('https://fakestoreapi.com/products');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get a specific product
app.get('/api/products/:id', async (req, res) => {
    try {
        const response = await axios.get(`https://fakestoreapi.com/products/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product details' });
    }
});

// Example of a protected route
app.get('/api/protected', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'secretKey', (err, user) => {
        if (err) return res.sendStatus(403);
        res.json({ message: 'This is a protected route', user });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});