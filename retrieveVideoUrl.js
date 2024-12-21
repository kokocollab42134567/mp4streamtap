const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// API endpoint
app.get('/getVideo', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // Launch Puppeteer with cloud-friendly configurations
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome', // For Render or systems with pre-installed Chrome
            headless: true, 
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Reduce memory usage in cloud environments
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();

        // Open the provided URL
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for the video element to load and retrieve the src attribute
        const videoSrc = await page.evaluate(() => {
            const videoElement = document.querySelector('#mainvideo');
            return videoElement ? videoElement.src : null;
        });

        await browser.close();

        if (videoSrc) {
            res.json({ videoUrl: videoSrc });
        } else {
            res.status(404).json({ error: 'Video URL not found on the page' });
        }
    } catch (error) {
        console.error('Error while processing request:', error.message);
        res.status(500).json({
            error: 'An error occurred while processing the request',
            details: error.message, // Include detailed error message for debugging
        });
    }
});

// Health check endpoint (optional)
app.get('/', (req, res) => {
    res.send('Puppeteer Video URL Retriever API is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
