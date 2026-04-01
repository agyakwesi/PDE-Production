const axios = require('axios');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { callAI } = require('../services/aiHelpers');

// Groq SDK is now handled in aiHelpers.js via callAI

const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-accelerated-2d-canvas",
  "--no-first-run",
  "--no-zygote",
  "--single-process",
  "--disable-gpu"
];

const BULK_BATCH_SIZE = 3;

/**
 * Validate that a URL belongs to fragrantica.com using hostname parsing
 * to prevent subdomain/path bypass attacks.
 */
function isValidFragranticaUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === 'fragrantica.com' || hostname.endsWith('.fragrantica.com');
  } catch {
    return false;
  }
}

/**
 * Scrape a single Fragrantica page using an existing browser instance.
 */
const scrapeWithBrowser = async (browser, url) => {
  const page = await browser.newPage();
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 1000));

    const content = await page.content();
    const $ = cheerio.load(content);

    const name = $('h1[itemprop="name"]').text().replace(/for women and men/i, '').trim();
    const image = $('img[itemprop="image"]').attr('src');
    let description = $('div[itemprop="description"]').text().trim();
    const rating = $('span[itemprop="ratingValue"]').text().trim();

    let gender = "Unisex";
    const titleText = $('h1[itemprop="name"]').text();
    if (titleText.includes("for women")) gender = "Female";
    if (titleText.includes("for men") && !titleText.includes("for women")) gender = "Male";

    let notes = "";
    const pyramidDivs = $('div[style*="flex-flow: wrap"][style*="justify-content: center"]');
    if (pyramidDivs.length >= 3) {
        const getNotesFromDiv = (div) => {
            const notesArr = [];
            $(div).find('div').each((i, el) => {
                const text = $(el).text().trim();
                if (text) notesArr.push(text);
            });
            return [...new Set(notesArr)].filter(n => n.length > 1);
        };
        const top = getNotesFromDiv(pyramidDivs.eq(0));
        const middle = getNotesFromDiv(pyramidDivs.eq(1));
        const base = getNotesFromDiv(pyramidDivs.eq(2));
        if (top.length || middle.length || base.length) {
            notes = `Top: ${top.join(', ')}; Heart: ${middle.join(', ')}; Base: ${base.join(', ')}`;
        }
    }

    let accords = '';
    try {
      const accordsData = await page.evaluate(() => {
        const headers = Array.from(document.querySelectorAll('h6'));
        const accordHeader = headers.find(el => el.textContent.trim().toLowerCase() === 'main accords');
        if (!accordHeader) return [];
        const container = accordHeader.nextElementSibling;
        if (!container) return [];
        const spans = container.querySelectorAll('.truncate');
        return Array.from(spans).map(s => s.textContent.trim()).filter(t => t.length > 0);
      });
      accords = accordsData.join(', ');
    } catch(accErr) {}

    if (!notes && accords) notes = accords;

    let brand = "Unknown";
    try {
      const urlParts = url.split('/perfume/')[1].split('/');
      if (urlParts.length >= 1) {
        brand = urlParts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    } catch (e) {}

    return { name, brand, image, description, notes, accords, rating, gender, url };
  } finally {
    await page.close();
  }
};

// Scrape a single URL (internal function)
const performScrape = async (url) => {
  if (!isValidFragranticaUrl(url)) {
    throw new Error("Invalid URL");
  }

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: BROWSER_ARGS
  });

  try {
    return await scrapeWithBrowser(browser, url);
  } finally {
    await browser.close();
  }
};

exports.scrapeFragrantica = async (req, res) => {
  try {
    const data = await performScrape(req.body.url);
    res.json(data);
  } catch (error) {
    console.error("Scraper Error [scrapeFragrantica]:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

exports.discoverySearch = async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const response = await axios.post('https://google.serper.dev/search', {
      q: `site:fragrantica.com/perfume ${query}`,
      num: 5
    }, {
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const results = response.data.organic
      .filter(item => item.link.includes('fragrantica.com/perfume/'))
      .map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      }));

    res.json(results);
  } catch (error) {
    console.error("Serper Error Details:", error.response?.data || error.message);
    res.status(500).json({ error: "Search failed", details: error.response?.data || error.message });
  }
};

exports.bulkScrape = async (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls)) return res.status(400).json({ error: "URLs array required" });

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: BROWSER_ARGS
  });

  try {
    const results = [];
    for (let i = 0; i < urls.length; i += BULK_BATCH_SIZE) {
      const batch = urls.slice(i, i + BULK_BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (url) => {
          if (!isValidFragranticaUrl(url)) {
            return { url, status: 'error', message: 'Invalid URL' };
          }
          try {
            const data = await scrapeWithBrowser(browser, url);
            return { url, status: 'success', data };
          } catch (err) {
            return { url, status: 'error', message: err.message };
          }
        })
      );
      results.push(...batchResults);
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Bulk operation failed" });
  } finally {
    await browser.close();
  }
};
