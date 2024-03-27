const express = require('express');
const axios = require('axios');
const { performance } = require('perf_hooks');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const WINDOW_SIZE = 10;
const TEST_SERVER_URL = "http://20.244.56.144/"; // Replace with actual test server URL
const QUALIFIED_IDS = new Set(['prime', 'fibo', 'even', 'random']); // Full form for local API, short form for test server

const numberCache = [];

const fetchAndUpdateCache = async (qualifiedId) => {
    const url = `${TEST_SERVER_URL}/numbers/${qualifiedId}`;
    try {
        const response = await axios.get(url, { timeout: 500 });
        const numbers = response.data;
        numbers.forEach(number => {
            if (!numberCache.includes(number)) {
                numberCache.push(number);
            }
        });
    } catch (error) {
        console.error("Error fetching numbers:", error);
    }
};

const getAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return (sum / numbers.length).toFixed(2);
};

app.get('/numbers/:qualifiedId', async (req, res) => {
    const qualifiedId = req.params.qualifiedId;
    if (!QUALIFIED_IDS.has(qualifiedId)) {
        return res.status(400).json({ error: 'Invalid qualified ID' });
    }

    const start = performance.now();
    await fetchAndUpdateCache(qualifiedId);
    const currentNumbers = numberCache.slice(-WINDOW_SIZE);
    const previousNumbers = currentNumbers.slice(0, -1);
    const average = getAverage(currentNumbers);

    const end = performance.now();
    console.log(`Request processed in ${end - start} milliseconds`);

    res.json({
        numbers: currentNumbers,
        windowPrevState: previousNumbers,
        windowCurrState: currentNumbers,
        avg: average
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
