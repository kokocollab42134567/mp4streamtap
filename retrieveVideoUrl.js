const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// API endpoint to retrieve video URL
app.get('/getVideo', async (req, res) => {
    const { url } = req.query;

    // Validate input
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // Launch Puppeteer with Render-friendly options
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();

        // Navigate to the provided URL
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000, // 60 seconds timeout
        });

        // Wait for the video element to load and retrieve the `src` attribute
        const videoSrc = await page.evaluate(() => {
            const videoElement = document.querySelector('#mainvideo');
            return videoElement ? videoElement.src : null;
        });

        await browser.close();

        // Respond with the video URL or an error if not found
        if (videoSrc) {
            res.json({ videoUrl: videoSrc });
        } else {
            res.status(404).json({ error: 'Video URL not found. Please check the page structure.' });
        }
    } catch (error) {
        console.error('Error occurred:', error);

        // Close the browser in case of an error
        try {
            const openBrowsers = await puppeteer.defaultBrowser;
            if (openBrowsers) await openBrowsers.close();
        } catch (browserError) {
            console.error('Failed to close Puppeteer browser:', browserError);
        }

        // Return appropriate HTTP response for the error
        res.status(500).json({
            error: 'An error occurred while processing the request',
            details: error.message,
        });
    }
});

// Start the Express server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
