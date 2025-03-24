const express = require("express");
const axios = require("axios");
const { JSDOM } = require("jsdom");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/scrape", async (req, res) => {
    try {
        const keyword = req.query.keyword;
        if (!keyword) return res.status(400).json({ error: "Keyword is required" });

        const url = `https://www.amazon.com.br/s?k=${encodeURIComponent(keyword)}`;
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const dom = new JSDOM(data);
        const document = dom.window.document;

        let products = [];
        document.querySelectorAll(".s-result-item").forEach(item => {
            const title = item.querySelector("h2 a span")?.textContent || "No title";
            const rating = item.querySelector(".a-icon-star-small")?.textContent || "No rating";
            const reviews = item.querySelector(".s-link-style span")?.textContent || "0";
            const image = item.querySelector(".s-image")?.src || "No image";
            products.push({ title, rating, reviews, image });
        });

        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
