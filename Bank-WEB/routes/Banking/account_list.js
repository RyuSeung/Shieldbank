//이조 계좌목록 js파일 추가.
var express = require('express');
var router = express.Router();
var axios = require("axios");
var {encryptResponse, decryptRequest} = require("../../middlewares/crypt");
const profile = require('../../middlewares/profile');
const checkCookie = require("../../middlewares/checkCookie")



router.get('/', checkCookie, function (req, res) {
    const cookie = req.cookies.Token;
    console.log(cookie);
    profile(cookie).then(profileData => {
        console.log("account_list에서의 profileData : ",profileData);
        axios({
            method: "post",
            url: api_url + "/api/account/view",
            headers: {"authorization": "1 " + cookie}
        }).then((data) => {

            let result = decryptRequest(data.data).data;
            console.log("account_list in web result : ",result);

            return res.render("Banking/account_list", {html_data: result, pending: profileData, select: "account_list"});
        }).catch(function (error) {

            var html_data = "<tr>에러</tr>";

            return res.render("Banking/account_list", {html_data: html_data, pending: profileData, select: "account_list"});
        });
    });
});


router.post('/create', checkCookie, function (req, res) {
    const cookie = req.cookies.Token;
    
    console.log(cookie);
    profile(cookie).then(profileData => {
        console.log("account_list_post에서의 profileData : ",profileData);
        axios({
            method: "post",
            url: api_url + "/api/account/create",
            headers: {"authorization": "1 " + cookie}
        }).then((data) => {

            let result = decryptRequest(data.data).data;
            console.log("accout new create result : ",result);

            return res.render("Banking/account_list", {html_data: result, pending: profileData, select: "account_list"});
        }).catch(function (error) {

            var html_data = [
                 { balance: error, account_number: error, bank_code: error }
            ];

            return res.render("Banking/account_list", {html_data: html_data, pending: profileData, select: "account_list"});
        });
    });
});

module.exports = router;
