require('dotenv').config();

const jwt = require('jsonwebtoken');

function tokenRequest(token) {
    try{
        let decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        let obj = {"success": "Token is valid", "data": decodedToken};
        return obj;
    } catch (err) {
        return {"error": "Token is invalid"}
    }
}

module.exports = tokenRequest;