const axios = require('axios');
const cheerio = require('cheerio');

/**
 * @returns {Promise<Object>} Scraped data object
 */
async function scrapeAnimeNewsNetwork() {
    const baseUrl = 'https://www.animenewsnetwork.com';
    try {
        const { data: html } = await axios.get(`${baseUrl}/`, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            }
        });

        const $ = cheerio.load(html);

        const featuredArticles = $('#marquee a.marquee-item').map((_, el) => {
            const element = $(el);
            const title = element.find('.overlay h2').text().trim();
            const relativeLink = element.attr('href');
            const link = relativeLink ? `${baseUrl}${relativeLink}` : null;
            const relativeImage = element.find('.cover-image').data('src');
            const image = relativeImage ? `${baseUrl}${relativeImage}` : null;
            const description = element.find('.overlay div').last().text().trim();

            return { title, link, image, description };
        }).get();
        
        const extractArticleData = (selector) => {
            return $(selector).map((_, el) => {
                const element = $(el);
                const title = element.find('h3 a').text().trim();
                const relativeLink = element.find('h3 a').attr('href');
                const link = relativeLink ? `${baseUrl}${relativeLink}` : null;
                const relativeImage = element.find('.thumbnail').data('src');
                const image = relativeImage ? `${baseUrl}${relativeImage}` : null;
                const category = element.find('.overlay .category').text().trim();
                const timestamp = element.find('.byline time').attr('datetime');
                const comments = element.find('.byline .comments a').text().trim() || '0 comments';
                const description = element.find('.snippet .hook').text().trim();
                const topics = element.find('.topics a').map((i, topic) => $(topic).text().trim()).get();

                return { title, link, image, category, timestamp, comments, description, topics };
            }).get();
        };

        const topNews = extractArticleData('#topfeed .herald.box');
        const mainFeed = extractArticleData('#mainfeed .herald.box');

        return {
            featuredArticles,
            topNews,
            mainFeed,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

scrapeAnimeNewsNetwork()
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(error => console.error(error.message));
