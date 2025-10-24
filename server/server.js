const express = require('express');
const fs = require('fs/promises');
const cors = require('cors');
const path = require('path'); // Добавляем модуль path

const app = express();
const port = 3000;

app.use(cors()); // Включить CORS для всех источников (настройте правильно для продакшна!)
app.use(express.json()); // Middleware для парсинга JSON-тел запросов

// Обслуживание статических файлов (HTML, CSS, JS)
// Убедитесь, что ваш index.html, style.css, script.js находятся в папке public
app.use(express.static('public'));

// Определяем абсолютные пути к файлам JSON
const productsDataPath = path.join(__dirname, 'server', 'DB', 'mockProducts.json');
const usersDataPath = path.join(__dirname, 'server', 'DB', 'mockUsers.json');

// --- Маршруты для Пользователей (CRUD) ---

// API endpoint для получения пользователей (GET)
app.get('../server/DB/mockusers.json', async (req, res) => {
    try {
        const data = await fs.readFile(usersDataPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Error reading users.json:", error);
        // Если файл не существует, вернуть пустой массив
        if (error.code === 'ENOENT') {
            res.json([]);
        } else {
            res.status(500).send('Error reading users data.');
        }
    }
});

// API endpoint для обновления пользователей (PUT)
app.put('../server/DB/mockusers.json', async (req, res) => {
    try {
        const data = JSON.stringify(req.body, null, 2);
        await fs.writeFile(usersDataPath, data, 'utf8');
        res.status(200).send('Users data updated successfully.');
    } catch (error) {
        console.error("Error writing to users.json:", error);
        res.status(500).send('Error updating users data.');
    }
});


// --- Маршруты для Продуктов (CRUD) ---

// API endpoint для получения продуктов (GET)
app.get('../server/DB/mockProducts.json', async (req, res) => {
    try {
        const data = await fs.readFile(productsDataPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Error reading mockProducts.json:", error);
        // Если файл не существует, вернуть пустой массив
        if (error.code === 'ENOENT') {
            res.json([]);
        } else {
            res.status(500).send('Error reading products data.');
        }
    }
});

// API endpoint для обновления продуктов (PUT)
app.put('../server/DB/mockProducts.json', async (req, res) => {
    try {
        const data = JSON.stringify(req.body, null, 2);
        await fs.writeFile(productsDataPath, data, 'utf8');
        res.status(200).send('Products data updated successfully.');
    } catch (error) {
        console.error("Error writing to mockProducts.json:", error);
        res.status(500).send('Error updating products data.');
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
