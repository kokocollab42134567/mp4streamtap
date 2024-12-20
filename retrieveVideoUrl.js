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
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Open the provided URL
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Wait for the video element to load and retrieve the src attribute
        const videoSrc = await page.evaluate(() => {
            const videoElement = document.querySelector('#mainvideo');
            return videoElement ? videoElement.src : null;
        });

        await browser.close();

        if (videoSrc) {
            res.json({ videoUrl: videoSrc });
        } else {
            res.status(404).json({ error: 'Video URL not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
