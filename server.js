// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// API ключ (передается через переменную окружения или жестко)
const API_KEY = '9aa06403-4ee1-4714-8435-473bd419356d';
const ZEN_API_BASE = 'https://api.izen.lol/v1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Эндпоинт: обход URL (GET /api/bypass?url=...)
app.get('/api/bypass', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ status: 'failed', result: 'Missing url parameter' });
    }

    try {
        const response = await axios.get(`${ZEN_API_BASE}/bypass`, {
            params: { url },
            headers: {
                'x-api-key': API_KEY
            },
            timeout: 30000 // 30 секунд
        });

        // Проксируем ответ от ZEN-API
        res.status(response.status).json(response.data);
    } catch (error) {
        // Обработка ошибок axios
        if (error.response) {
            // Ответ от сервера с кодом ошибки
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // Запрос был сделан, но ответа нет
            res.status(500).json({ status: 'failed', result: 'No response from ZEN-API' });
        } else {
            // Ошибка при настройке запроса
            res.status(500).json({ status: 'failed', result: error.message });
        }
    }
});

// Эндпоинт: принудительное обновление (GET /api/refresh?url=...)
app.get('/api/refresh', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ status: 'failed', result: 'Missing url parameter' });
    }

    try {
        const response = await axios.get(`${ZEN_API_BASE}/refresh`, {
            params: { url },
            headers: {
                'x-api-key': API_KEY
            },
            timeout: 60000 // 60 секунд для refresh (может быть медленнее)
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            res.status(500).json({ status: 'failed', result: 'No response from ZEN-API' });
        } else {
            res.status(500).json({ status: 'failed', result: error.message });
        }
    }
});

// Эндпоинт: список поддерживаемых сервисов (не требует ключа)
app.get('/api/supported', async (req, res) => {
    try {
        const response = await axios.get(`${ZEN_API_BASE}/supported`, {
            timeout: 10000
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ status: 'failed', result: 'Failed to fetch supported services' });
        }
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`API ключ: ${API_KEY}`);
    console.log(`Открыть в браузере: http://localhost:${PORT}`);
});