const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/server', express.static(path.join(__dirname, '.')));
app.use('/data', express.static(path.join(__dirname, '../data')));

const USERS_FILE = path.join(__dirname, '../data/users.json');
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    
    if (!login || !password) {
        return res.json({ success: false, error: 'Логин и пароль обязательны' });
    }

    try {
        const usersData = fs.readFileSync(USERS_FILE, 'utf8');
        const users = JSON.parse(usersData);
        const user = users.find(u => u.username === login && u.password === password);
        
        if (user) {
            res.json({ success: true, user: user });
        } else {
            res.json({ success: false, error: 'Неверный логин или пароль' });
        }
    } catch (error) {
        res.json({ success: false, error: 'Ошибка сервера' });
    }
});

app.post('/api/register', (req, res) => {
    const { login, password, name } = req.body;
    
    if (!login || !password) {
        return res.json({ success: false, error: 'Логин и пароль обязательны' });
    }

    try {
        const usersData = fs.readFileSync(USERS_FILE, 'utf8');
        const users = JSON.parse(usersData);
        
        if (users.find(u => u.username === login)) {
            return res.json({ success: false, error: 'Пользователь уже существует' });
        }

        const newUser = {
            id: users.length + 1,
            username: login,
            password: password,
            name: name || login,
            role: 'user'
        };

        users.push(newUser);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        
        res.json({ success: true, user: newUser });
    } catch (error) {
        res.json({ success: false, error: 'Ошибка сервера' });
    }
});

app.get('/api/products', (req, res) => {
    try {
        const productsData = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const products = JSON.parse(productsData);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки продуктов' });
    }
});

app.get('/api/products/:id', (req, res) => {
    try {
        const productsData = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const products = JSON.parse(productsData);
        const product = products.find(p => p.id == req.params.id);
        
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Товар не найден' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

app.post('/api/products', (req, res) => {
    try {
        const productsData = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const products = JSON.parse(productsData);
        
        const newProduct = {
            id: Date.now(),
            ...req.body
        };
        
        products.push(newProduct);
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        
        res.json({ success: true, product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сохранения продукта' });
    }
});

app.post('/api/products/update', (req, res) => {
    try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления продуктов' });
    }
});


