const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/server', express.static(path.join(__dirname, '.')));
app.use('/data', express.static(path.join(__dirname, '../data')));

const USERS_FILE = path.join(__dirname, '../data/users.json');
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

// Вспомогательная функция для чтения файлов
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Ошибка чтения файла ${filePath}:`, error);
        return [];
    }
}

// Вспомогательная функция для записи файлов
function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Ошибка записи файла ${filePath}:`, error);
        return false;
    }
}

// Аутентификация
app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    
    if (!login || !password) {
        return res.status(400).json({ success: false, error: 'Логин и пароль обязательны' });
    }

    try {
        const users = readJsonFile(USERS_FILE);
        const user = users.find(u => u.username === login && u.password === password);
        
        if (user) {
            res.json({ success: true, user: user });
        } else {
            res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

app.post('/api/register', (req, res) => {
    const { login, password, name } = req.body;
    
    if (!login || !password) {
        return res.status(400).json({ success: false, error: 'Логин и пароль обязательны' });
    }

    try {
        const users = readJsonFile(USERS_FILE);
        
        if (users.find(u => u.username === login)) {
            return res.status(400).json({ success: false, error: 'Пользователь уже существует' });
        }

        const newUser = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            username: login,
            password: password,
            name: name || login,
            role: 'user'
        };

        users.push(newUser);
        
        if (writeJsonFile(USERS_FILE, users)) {
            res.json({ success: true, user: newUser });
        } else {
            res.status(500).json({ success: false, error: 'Ошибка сохранения пользователя' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Управление товарами
app.get('/api/products', (req, res) => {
    try {
        const products = readJsonFile(PRODUCTS_FILE);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки товаров' });
    }
});

app.get('/api/products/:id', (req, res) => {
    try {
        const products = readJsonFile(PRODUCTS_FILE);
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

app.post('/api/products', (req, res) => {
    try {
        const { name, price, description, image } = req.body;
        
        if (!name || !price || !description || !image) {
            return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
        }

        const products = readJsonFile(PRODUCTS_FILE);
        
        const newProduct = {
            id: Date.now(),
            name: name.trim(),
            price: Number(price),
            description: description.trim(),
            image: image.trim()
        };
        
        products.push(newProduct);
        
        if (writeJsonFile(PRODUCTS_FILE, products)) {
            res.json({ success: true, product: newProduct });
        } else {
            res.status(500).json({ error: 'Ошибка сохранения товара' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавляем PUT метод для обновления товара
app.put('/api/products/:id', (req, res) => {
    try {
        const { name, price, description, image } = req.body;
        const productId = parseInt(req.params.id);
        
        if (!name || !price || !description || !image) {
            return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
        }

        const products = readJsonFile(PRODUCTS_FILE);
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        products[productIndex] = {
            ...products[productIndex],
            name: name.trim(),
            price: Number(price),
            description: description.trim(),
            image: image.trim()
        };
        
        if (writeJsonFile(PRODUCTS_FILE, products)) {
            res.json({ success: true, product: products[productIndex] });
        } else {
            res.status(500).json({ error: 'Ошибка обновления товара' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавляем DELETE метод для удаления товара
app.delete('/api/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const products = readJsonFile(PRODUCTS_FILE);
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        products.splice(productIndex, 1);
        
        if (writeJsonFile(PRODUCTS_FILE, products)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Ошибка удаления товара' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/products/update', (req, res) => {
    try {
        if (writeJsonFile(PRODUCTS_FILE, req.body)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Ошибка обновления товаров' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Управление пользователями
app.get('/api/users', (req, res) => {
    try {
        const users = readJsonFile(USERS_FILE);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки пользователей' });
    }
});

app.get('/api/users/:id', (req, res) => {
    try {
        const users = readJsonFile(USERS_FILE);
        const user = users.find(u => u.id == req.params.id);
        
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'Пользователь не найден' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/users/:id', (req, res) => {
    try {
        const { username, name, role, password } = req.body;
        const userId = parseInt(req.params.id);
        
        if (!username || !name || !role) {
            return res.status(400).json({ error: 'Логин, имя и роль обязательны' });
        }

        if (role !== 'admin' && role !== 'user') {
            return res.status(400).json({ error: 'Роль должна быть admin или user' });
        }

        const users = readJsonFile(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Проверяем уникальность логина
        const existingUser = users.find(u => u.username === username && u.id !== userId);
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
        }

        // Обновляем данные
        users[userIndex].username = username.trim();
        users[userIndex].name = name.trim();
        users[userIndex].role = role;
        
        if (password && password.trim() !== '') {
            users[userIndex].password = password.trim();
        }

        if (writeJsonFile(USERS_FILE, users)) {
            res.json({ success: true, user: users[userIndex] });
        } else {
            res.status(500).json({ error: 'Ошибка обновления пользователя' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const users = readJsonFile(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Не позволяем удалить последнего администратора
        const adminUsers = users.filter(u => u.role === 'admin');
        if (users[userIndex].role === 'admin' && adminUsers.length === 1) {
            return res.status(400).json({ error: 'Нельзя удалить последнего администратора' });
        }

        users.splice(userIndex, 1);
        
        if (writeJsonFile(USERS_FILE, users)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Ошибка удаления пользователя' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/users', (req, res) => {
    const { username, password, name, role = 'user' } = req.body;
    
    if (!username || !password || !name) {
        return res.status(400).json({ error: 'Логин, пароль и имя обязательны' });
    }

    if (role !== 'admin' && role !== 'user') {
        return res.status(400).json({ error: 'Роль должна быть admin или user' });
    }

    try {
        const users = readJsonFile(USERS_FILE);
        
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
        }

        const newUser = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            username: username.trim(),
            password: password.trim(),
            name: name.trim(),
            role: role
        };

        users.push(newUser);
        
        if (writeJsonFile(USERS_FILE, users)) {
            res.json({ success: true, user: newUser });
        } else {
            res.status(500).json({ error: 'Ошибка создания пользователя' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обработка несуществующих маршрутов
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});