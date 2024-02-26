var express = require('express');
var router = express.Router();
var axios = require("axios");
var {encryptResponse, decryptRequest} = require("../../middlewares/crypt");
const profile = require('../../middlewares/profile');
const checkCookie = require("../../middlewares/checkCookie")

var html_data_description = "<h3 align='center'> Mydata 서비스는 타은행의 계좌 잔고확인/송금 까지 한번에 해결할 수 있도록 하는 서비스입니다 !</h3>"



router.get('/', checkCookie, function (req, res) {
    const cookie = req.cookies.Token;
    console.log(cookie);
    profile(cookie).then(profileData => {
        console.log("mydata에서의 profileData : ",profileData);

        return res.render("Banking/mydata", {html_data: "<br/>", pending: profileData, select: "mydata"});
    });
});

// router.post('/', checkCookie, function (req, res) {
//     const cookie = req.cookies.Token;
    
//     console.log(cookie);
//     profile(cookie).then(profileData => {
//         console.log("account_list_post에서의 profileData : ",profileData);
//         axios({
//             method: "post",
//             url: api_url + "/api/mydata/view",
//             headers: {"authorization": "1 " + cookie}
//         }).then((data) => {

//             let result = decryptRequest(data.data).data;
//             console.log("accout new create result : ",result);

//             return res.render("Banking/mydata", {html_data: result, pending: profileData, select: "mydata"});
//         }).catch(function (error) {

//             var html_data = [
//                  { username: error, balance: error, account_number: error, bank_code: error }
//             ];

//             return res.render("Banking/mydata", {html_data: html_data, pending: profileData, select: "mydata"});
//         });
//     });
// });


// 외부 api 응답 출력
router.post('/', checkCookie, function (req, res) {
    const cookie = req.cookies.Token;
    
    profile(cookie).then(profileData => {
        axios({
            method: "post",
            url: api_url + "/api/mydata/req_account",
            headers: {"authorization": "1 " + cookie},
        }).then((data) => {
            var account_list = data.data.data;
            console.log("mydatat got data@@@@@@@@@ : ", account_list);
            var result="";
            
            if(account_list.length > 0) {
                console.log("들어왔다!");
                result = "<tr>\n";
                account_list.forEach(account => {
                    result += "<td>" + account.account_number + "</td>\n";
                    result += "<td>" + account.balance + "</td>\n";
                    result += "<td>" + account.bank_code + "</td>\n";
                    result += "<td style='width:89px'> <button ";
                    result += "class='btn btn-user btn-block' type='button' onclick='redirectToTransferPage(\"" + account.account_number + "\", \"" + account.balance + "\", \"" + account.bank_code + "\")' style='background-color:#b937a4 !important; color:white !important;'>"
                    result += "송금</button></td>";
                    result += "</tr>\n";

                });
                
            }
            else {
                result += "<tr>\n"
                result += "<td colspan='3'>계좌가 없습니다.</td>\n"
                result += "</tr>\n"
            }

            return res.render("Banking/mydata", {html_data: result, pending: profileData, select: "mydata"});
        }).catch(function (error) {

            console.log("mydata error!@@@@@@@@@@");
            return error;
        });
    });
});

module.exports = router;