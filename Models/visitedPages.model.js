const mongoose = require('mongoose');
const PagesVisitedModel = new mongoose.Schema({
   
    visitedPages: {
        type: String
    },
    count: {
        type: Number
    }
});

const PagesVisited = mongoose.model("pagesVisited", PagesVisitedModel);
module.exports = PagesVisited;