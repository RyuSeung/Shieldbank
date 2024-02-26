var express = require('express');
var router = express.Router();
const {seoultime} = require("../../middlewares/seoultime")
const {encryptResponse, decryptRequest} = require('../../middlewares/crypt')
const axios = require("axios")
const sha256 = require("js-sha256")
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render("temp/signup", {select: "login"});
});

router.post('/', function (req, res, next) {
    const {username, password, email, phone} = req.body;
    const sha256Pass = sha256(password)
    const baseData = `{"username": "${username}", "password": "${sha256Pass}", "email": "${email}", "phone" :"${phone}", "sendtime": "${seoultime}"}`
    const enData = encryptResponse(baseData);

    axios({
        method: "post",
        url: api_url + "/api/user/register",
        data: enData
    }).then((data) => {
        let result = decryptRequest(data.data);
        if (result.status.code == 200) {
            return res.send("<script>alert('SUCCESS');location.href = \"/user/login\";</script>");

        } else {
            return res.send("<script>alert('FAIL');location.href = \"/user/signup\";</script>");

        }
    })
});


module.exports = router;
