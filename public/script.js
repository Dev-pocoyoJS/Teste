// script.js
(function() {
    'use strict';

    const urlInput = document.getElementById('urlInput');
    const bypassBtn = document.getElementById('bypassBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const statusText = document.getElementById('statusText');
    const resultContent = document.getElementById('resultContent');
    const resultLink = document.getElementById('resultLink');
    const timeText = document.getElementById('timeText');
    const rawResponse = document.getElementById('rawResponse');

    // Базовый URL бэкенда (изменяется при деплое)
    const API_BASE = '/api';

    // Функция отправки запроса на бэкенд
    async function sendBypassRequest(url, mode) {
        // mode: 'bypass' или 'refresh'
        const endpoint = mode === 'refresh' ? '/refresh' : '/bypass';
        const fullUrl = `${API_BASE}${endpoint}?url=${encodeURIComponent(url)}`;

        // Показать индикатор загрузки
        statusText.innerHTML = '<span class="loader"></span> Выполняется запрос...';
        resultContent.style.display = 'none';
        rawResponse.style.display = 'none';

        try {
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            // Отобразить сырой ответ для отладки
            rawResponse.textContent = JSON.stringify(data, null, 2);
            rawResponse.style.display = 'block';

            if (!response.ok) {
                statusText.textContent = `Ошибка ${response.status}: ${data.result || 'Неизвестная ошибка'}`;
                resultContent.style.display = 'none';
                return;
            }

            // Успешный ответ (status === 'success')
            if (data.status === 'success' && data.result) {
                statusText.textContent = '✅ Обход выполнен успешно';
                resultLink.href = data.result;
                resultLink.textContent = data.result;
                timeText.textContent = data.time || '—';
                resultContent.style.display = 'block';
            } else {
                statusText.textContent = `Ошибка: ${data.result || 'Неизвестная ошибка'}`;
                resultContent.style.display = 'none';
            }
        } catch (error) {
            statusText.textContent = `❌ Ошибка сети: ${error.message}`;
            resultContent.style.display = 'none';
            rawResponse.style.display = 'none';
        }
    }

    function handleBypass() {
        const url = urlInput.value.trim();
        if (!url) {
            statusText.textContent = '⚠️ Введите URL для обхода';
            resultContent.style.display = 'none';
            rawResponse.style.display = 'none';
            return;
        }
        sendBypassRequest(url, 'bypass');
    }

    function handleRefresh() {
        const url = urlInput.value.trim();
        if (!url) {
            statusText.textContent = '⚠️ Введите URL для принудительного обновления';
            resultContent.style.display = 'none';
            rawResponse.style.display = 'none';
            return;
        }
        sendBypassRequest(url, 'refresh');
    }

    bypassBtn.addEventListener('click', handleBypass);
    refreshBtn.addEventListener('click', handleRefresh);

    // Обработка нажатия Enter в поле ввода
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBypass();
        }
    });
})();