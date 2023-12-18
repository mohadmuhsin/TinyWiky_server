/* eslint-disable comma-dangle */
const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtSecret = process.env.SECRET_KEY;

module.exports = {

    generateAccessToken(payload, res) {
        const token = jwt.sign(payload, jwtSecret, { expiresIn: "1m" });
        let maxAge = 30 * 60 * 1000
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge,
        });

        return token
    },

    generateRefreshToken(payload, res) {
        const { id } = payload

        const refreshSecret = jwt.sign({ id }, jwtSecret, {
            expiresIn: "30d",
        });

        let maxAge = 30 * 24 * 60 * 60 * 1000
        res.cookie("refreshToken", refreshSecret, {
            // httpOnly: true,
            maxAge: maxAge,
        });

        return refreshSecret;
    },


    async reGenerateAccessToken(refreshToken, payload, res) {
        const { id } = payload;

        try {
            jwt.verify(refreshToken, jwtSecret);

            const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '30m' });
            res.cookie('jwt', accessToken, {
                httpOnly: true,
                maxAge: 30 * 60 * 1000,
            });

            const refreshSecret = jwt.sign({ id }, jwtSecret, { expiresIn: '30d' });
            res.cookie('refreshToken', refreshSecret, {
                // httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.json({ accessToken });

        } catch (error) {
            console.error("Error in reGenerateAccessToken:", error.message);
            res.status(500).json({ error: 'Internal Server Error' });
            throw error;
        }
    },


    async verifyToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).json("You are not authenticated");
            const token = authHeader.split(" ")[1];
            let decodedToken;
            try {
                decodedToken = jwt.verify(token, jwtSecret);
            } catch (error) {
                console.error("Error verifying JWT:", error.message);
                return res.status(401).json({ message: "JWT Expired. Please login" });
            }
            req.admin = decodedToken
            next();
        } catch (error) {
            console.error("Error verifying JWT:", error.message);
        }
    },
};