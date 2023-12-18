const mongoose = require('mongoose');
const TokenModel = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    // key: {
    //     type: String,
    //     required:
    // }
})

const Token = mongoose.model("token", TokenModel)
module.exports = Token;