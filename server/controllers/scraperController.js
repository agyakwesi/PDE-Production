const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { callAI } = require('../services/aiHelpers');

// Groq SDK is now handled in aiHelpers.js via callAI

exports.scrapeFragrantica = async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('fragrantica.com')) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    // Launch Puppeteer with args for Render/Production compatibility
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu"
      ]
    });
    
    const page = await browser.newPage();
    
    // Set a realistic User Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Disable request interception to ensure full page load (fixes missing elements)
    // await page.setRequestInterception(true); 
    
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
        
        // Scroll down to trigger lazy-loaded elements (accords, notes, etc.)
        await page.evaluate(() => window.scrollBy(0, 1500));
        await new Promise(r => setTimeout(r, 2000));
        await page.evaluate(() => window.scrollBy(0, 1500));
        await new Promise(r => setTimeout(r, 1500));

        // Try multiple selectors for the name
        try {
          await page.waitForSelector('h1[itemprop="name"], h1, .perfume-name', { timeout: 15000 });
        } catch(e) {
          console.log("Name selector timeout, will attempt extraction anyway...");
        }
    } catch (e) {
        console.log("Navigation timeout, continuing with partial content...");
    }
    
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

    // Pyramid Extraction
    let notes = "";
    const pyramidDivs = $('div[style*="flex-flow: wrap"][style*="justify-content: center"]');
    
    if (pyramidDivs.length >= 3) {
        // Assuming standard order: Top, Middle, Base
        const getNotesFromDiv = (div) => {
            const notesArr = [];
            $(div).find('div').each((i, el) => {
                const text = $(el).text().trim();
                if (text) notesArr.push(text);
            });
            // Filter duplicates and empty
            return [...new Set(notesArr)].filter(n => n.length > 1);
        };

        const top = getNotesFromDiv(pyramidDivs.eq(0));
        const middle = getNotesFromDiv(pyramidDivs.eq(1));
        const base = getNotesFromDiv(pyramidDivs.eq(2));

        if (top.length || middle.length || base.length) {
            notes = `Top: ${top.join(', ')}; Heart: ${middle.join(', ')}; Base: ${base.join(', ')}`;
        }
    }

    // Always extract Accords using in-page JS (Fragrantica uses Tailwind now, old .accord-bar is dead)
    let accords = '';
    try {
      const accordsData = await page.evaluate(() => {
        // Find the "main accords" h6 header
        const headers = Array.from(document.querySelectorAll('h6'));
        const accordHeader = headers.find(el => el.textContent.trim().toLowerCase() === 'main accords');
        if (!accordHeader) return [];
        
        // The accords container is the next sibling
        const container = accordHeader.nextElementSibling;
        if (!container) return [];
        
        const spans = container.querySelectorAll('.truncate');
        return Array.from(spans).map(s => s.textContent.trim()).filter(t => t.length > 0);
      });
      accords = accordsData.join(', ');
      console.log("Extracted accords:", accords);
    } catch(accErr) {
      console.warn("Accords extraction failed:", accErr.message);
    }

    // Fallback: if pyramid notes are empty, use accords
    if (!notes && accords) {
      notes = accords;
    }
    
    // Enhanced perfumer extraction
    let perfumer = "Master Perfumer";
    const perfumerSelectors = [
      'div[itemprop="brand"] a',
      '.perfumer-avatar + a',
      'a[href*="/noses/"]',
      'div:contains("Perfumer:") + a',
      'p:contains("Nose:") a'
    ];
    
    for (const selector of perfumerSelectors) {
      const found = $(selector).first().text().trim();
      if (found && found.length > 0 && found !== "Master Perfumer") {
        perfumer = found;
        break;
      }
    }

    // AI Description Shortening
    if (description && description.length > 200) {
      try {
        let cleanDesc = description
          .replace(/Sponsored.*/i, "")
          .replace(/Read about this perfume.*/i, "")
          .replace(/Jomashop.*/i, "")
          .trim();

        const systemPrompt = "You are a luxury perfume copywriter. Shorten perfume descriptions to 2-3 elegant sentences (max 150 words). Remove unnecessary details, keep only the essence, mood, and key notes. Be poetic but concise.";
        const userMessage = `Shorten this perfume description:\n\n${cleanDesc}`;
        
        const aiResponse = await callAI(systemPrompt, userMessage, 0.7, 200);
        description = aiResponse || cleanDesc;
      } catch (aiError) {
        console.error("AI description shortening failed:", aiError);
        description = description.substring(0, 200) + '...';
      }
    }

    // Brand Extraction from URL (Reliable)
    let brand = "Unknown";
    try {
      const urlParts = url.split('/perfume/')[1].split('/');
      if (urlParts.length >= 1) {
        brand = urlParts[0].replace(/-/g, ' '); 
        brand = brand.replace(/\b\w/g, l => l.toUpperCase());
      }
    } catch (e) {
      console.log("Could not extract brand from URL");
    }

    const data = { name, brand, image, description, notes, accords, perfumer, rating, gender };

    await browser.close();
    res.json(data);
  } catch (error) {
    console.error("Scraping Error:", error);
    res.status(500).json({ error: "Failed to scrape data" });
  }
};
