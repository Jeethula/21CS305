const express = require('express');
const axios = require('axios');
const { performance } = require('perf_hooks');

const app = express();
const PORT = process.env.PORT || 3000;


const WINDOW_SIZE = 10;
const TEST_SERVER_URL = "http://20.244.56.144"; 
const QUALIFIED_IDS_SHORT = ['p', 'f', 'e', 'r']; 
const QUALIFIED_IDS_MAP = {
    'p': 'prime',
    'f': 'fibo',
    'e': 'even',
    'r': 'rand'
}; 

const numberCache = {};

const fetchAndUpdateCache = async (qualifiedId) => {
    const fullQualifiedId = QUALIFIED_IDS_MAP[qualifiedId];
    const url = `${TEST_SERVER_URL}/numbers/${fullQualifiedId}`;
    try {
        const response = await axios.get(url, { timeout: 500 });
        const numbers = response.data;
        numberCache[qualifiedId] = numbers;
    } catch (error) {
        console.error("Error fetching numbers:", error);
    }
};

const getAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return (sum / numbers.length).toFixed(2);
};

const handleRequest = async (qualifiedId, res) => {
    if (!QUALIFIED_IDS_SHORT.includes(qualifiedId)) {
        return res.status(400).json({ error: 'Invalid qualified ID' });
    }

    const start = performance.now();
    await fetchAndUpdateCache(qualifiedId);
    const currentNumbers = numberCache[qualifiedId] || [];
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
};

app.get('/numbers/:qualifiedId', (req, res) => {
    const qualifiedId = req.params.qualifiedId;
    handleRequest(qualifiedId, res);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
