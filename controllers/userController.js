const tokenRequest = require("../requests/token.request");

function getUser(req, res){
    const token = req.cookies.authToken;
    const decoded_user = tokenRequest(token);
    const role = decoded_user.data.user.role.name;
    const name = decoded_user.data.user.name;
    res.json({ success: `hello ${name}, your role is ${role}`})
}

module.exports = {
    getUser
}