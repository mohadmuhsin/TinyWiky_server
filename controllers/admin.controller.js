const History = require('../Models/history.model');
const PagesVisited = require('../Models/visitedPages.model');
const Jwt  = require('jsonwebtoken')
require('dotenv').config();
const Joi = require("joi");
const { Validate } = require("../validations/joi.validation");
const Admin = require('../Models/admin.model');
const { generateAccessToken, generateRefreshToken, reGenerateAccessToken } = require('../auth/jwt/jwt.auth');
const SchemaElements = {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
};


const adminController = {
    async getHistory(req, res) {
        try {
            const { order } = req.params;
            const sortOrder = (order === "asc") ? 1 : -1
            const history = await History.find({}).sort({ count: sortOrder })
            if (history)
                return res.status(200).json(history)

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async getVisitedPages(req,res){
        try {
            const visitedPages = await PagesVisited.find({}).sort({ count: 1 })
            if (visitedPages)
                return res.status(200).json(visitedPages)
            console.log(visitedPages);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' }); 
        }
    },
    async admin_login(req, res) {
        try {
            const { email, password } = req.body.data;
            const authData = {
                email: email,
                password: password
            }

            const validate = Validate({
                email: SchemaElements.email,
                password: SchemaElements.password,
            }, authData)
            if (!validate.status) {
                return res.status(400).send(validate.response[0].message)
            }

            const admin = await Admin.findOne({ email: email })
            if (!admin) {
                return res.status(404).json({ message: "You are not authenticated" });
            }

            if (admin.password === password) {
                const payload = {
                    id: admin._id,
                    email: admin.email
                }
                
                let access =  generateAccessToken(payload, res)
                let refresh = generateRefreshToken(payload,res)
                
                if (!access) 
                    return res.status(500).json({ message: "something went wrong. Please try again" });

                return res.status(200).json({ message: "Welcome to TinyWiky",access })
            }else{
               return res.status(401).json({message:"Password is incorrect"})    
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    async refreshToken(req,res){
        try {
            const refreshToken = req.params.token;
            const claim = Jwt.verify(refreshToken,process.env.SECRET_KEY)
            if(!claim)
            return res.status(400).json({messgae:"something went wrong try again"});
            const admin = await Admin.findOne({_id:claim.id});
            const payload  = {
                id:admin._id,
                email:admin.email
            }
            
            try {
                const access = await reGenerateAccessToken(refreshToken, payload, res);
                res.status(200).send(access);
            } catch (error) {
                console.error(error);
                res.status(400).json({ message: "Something went wrong, try again" });
            }
           
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });  
        }
    },
    async adminLogout(req,res){
        try {
            res.cookie("jwt", "", { maxAge: 0 });
            res.cookie("refreshToken", "", { maxAge: 0 });
            res.send({ message: "logout success" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' }); 
        }
    }
}

module.exports = adminController