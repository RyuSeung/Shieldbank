var express = require('express');
var router = express.Router();
const axios = require("axios");
const profile = require("../../middlewares/profile")
const {decryptRequest, encryptResponse} = require("../../middlewares/crypt")
const checkCookie = require("../../middlewares/checkCookie")
var {seoultime} = require('../../middlewares/seoultime');


router.get("/", checkCookie, async (req, res) => {
    const cookie = req.cookies.Token;
    //var a_n = req.account_number;
    const accountNumber = req.query.account_number;
    const balance = req.query.balance;
    const bankCode = req.query.bank_code;

    
    profile(cookie).then((data) => {
        axios({
            method: "post",
            url: api_url + "/api/beneficiary/check",
            headers: {"authorization": "1 " + cookie},
        }).then((data2) => {
           //bankcod:555=A은행 , 333=B은행
           var d = decryptRequest((data2.data));
           var results = d.data.accountdata;
           var html_data = `<label>출금 계좌 : </label><input type="text" class="form-control form-control-user" autocomplete="off" id="drop_from" name="from_account" placeholder="${accountNumber}" list="dropdown_from" value="${accountNumber}" readonly><br>`
               


           //html_data += `<input>`;
           html_data += `<select name="bank_code" class="form-control form-control-user" id="bank_code">`
           html_data += `<option value="555">쉴드은행</option>`
           html_data += `<option value="333">창칼은행  </option></select><br>`


           html_data += `<input type="text" class="form-control form-control-user" id="to_account" name="to_account" placeholder="대상 계좌번호"><br>`


           html_data += `<input type="text" class="form-control form-control-user" id="amount" name="amount" placeholder="금액">`


           res.render("Banking/otherbank_send", {pending: data, html: html_data, select: "otherbank_send"});
        });
    });
});


router.post("/post", checkCookie, function (req, res, next) {
    const cookie = req.cookies.Token;
    let json_data = {};
    let result = {};

    

    json_data['from_account'] = parseInt(req.body.from_account);
    json_data['to_account'] = parseInt(req.body.to_account);   //데이터가 숫자로 들어가야 동작함
    json_data['bank_code'] = parseInt(req.body.bank_code);
    json_data['amount'] = parseInt(req.body.amount);
    json_data['sendtime'] = seoultime;


    console.log("000000000000000000000", json_data);


    const en_data = encryptResponse(JSON.stringify(json_data));// 객체를 문자열로 반환 후 암호화


    if(req.body.bank_code == '555') {
        axios({
            method: "post",
            url: api_url + "/api/mydata/b_to_a",
            headers: {"authorization": "1 " + cookie},
            data: en_data
        }).then((data) => {
            result = decryptRequest(data.data);
            statusCode = result.data.status;
            message = result.data.message;


            if(statusCode != 200) {
                res.send(`<script>
                alert("${message}");
                location.href=\"/bank/otherbank_send\";
                </script>`);
            } else {
                res.send(`<script>
                alert("${message}");
                location.href=\"/bank/otherbank_send\";
                </script>`);
            }
        });
    }
    else if(req.body.bank_code == '333') {
        axios({
            method: "post",
            url: api_url + "/api/mydata/b_to_b",
            headers: {"authorization": "1 " + cookie},
            data: en_data
        }).then((data) => {
            result = decryptRequest(data.data);
            statusCode = result.data.status;
            message = result.data.message;
   
            if(statusCode != 200) {
                res.send(`<script>
                alert("${message}");
                location.href=\"/bank/otherbank_send\";
                </script>`);
            } else {
                res.send(`<script>
                alert("${message}");
                location.href=\"/bank/otherbank_send\";
                </script>`);
            }
        });
    }
});


module.exports = router;
