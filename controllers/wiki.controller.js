const https = require('https');
const History = require('../Models/history.model');
const PagesVisited = require('../Models/visitedPages.model');


const wikiController = {
    async search(req, res) {
        try {
            const { searchTerm } = req.params;
            
            const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${searchTerm}`;
            const exists = await History.findOne({ word: { $regex: new RegExp(searchTerm, 'i') } })
            if (exists) {
                const update = await History.updateOne(
                    { word: { $regex: new RegExp(searchTerm, 'i') } },
                    { $inc: { count: 1 } }
                );
            } else {
                const newDoc = new History({
                    word: searchTerm,
                    count: 1
                }).save()
            }

            https.get(apiUrl, (response) => {
                let data = '';

                // A chunk of data has been received.
                response.on('data', (chunk) => {
                    data += chunk;
                });


                // The whole response has been received.
                response.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        const searchResults = jsonData.query.search;

                        // Assuming you want to send the search results to the client
                        return res.status(200).json(searchResults);
                    } catch (parseError) {
                        console.error(parseError);
                        return res.status(500).json({ error: 'Error parsing API response' });
                    }
                });
            }).on('error', (error) => {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async slug(req, res) {
        try {
            const { slug } = req.params;
            const apiUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${slug}&prop=text`;


            const exists = await PagesVisited.findOne({ visitedPages: { $regex: new RegExp(slug, 'i') } })
            if (exists) {
                const update = await PagesVisited.updateOne(
                    { visitedPages: { $regex: new RegExp(slug, 'i') } },
                    { $inc: { count: 1 } }
                );
            } else {
                const newDoc = new PagesVisited({
                    visitedPages: slug,
                    count: 1
                }).save()
            }
            
            https.get(apiUrl, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        const { title, text } = jsonData.parse;

                        return res.status(200).json({ title, htmlContent: text['*'] });
                    } catch (parseError) {
                        console.error(parseError);
                        return res.status(500).json({ error: 'Error parsing API response' });
                    }
                });
            }).on('error', (error) => {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    
};

module.exports = wikiController;
