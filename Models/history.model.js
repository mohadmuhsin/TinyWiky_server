const mongoose = require('mongoose');
const HistoryModel = new mongoose.Schema({

    word: {
        type: String
    },
    count: {
        type: Number
    }

});

const History = mongoose.model("history", HistoryModel);
module.exports = History;