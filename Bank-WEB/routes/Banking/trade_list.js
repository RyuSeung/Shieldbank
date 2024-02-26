var express = require('express');
var router = express.Router();
const axios = require("axios");
const profile = require("../../middlewares/profile")
const {decryptRequest, encryptResponse, decryptEnc} = require("../../middlewares/crypt")
const checkCookie = require("../../middlewares/checkCookie")
var {seoultime, simpletime} = require('../../middlewares/seoultime');

var html_data = ` <input type="date" id="start" name="tripstart"
value="${simpletime}"
min="2023-01-01" max="${simpletime}">&nbsp;&nbsp;
검색종료일&nbsp;&nbsp;<input type="date" id="end" name="tripend"
value="${simpletime}"
min="2023-01-01" max="${simpletime}">&nbsp;&nbsp;
<input type ="submit" value ="검색">
</form>
<tr><th>뱅크 코드</th><th>송금자</th><th>뱅크 코드</th><th>수취인</th><th>금액</th><th>시간</th></tr></thead>`;

router.get("/", checkCookie, async (req, res) => {
    // var row = global.realdata;
    const cookie = req.cookies.Token;
    // var bt= req.body.tripstart;
    // var be= req.body.tripend;
    profile(cookie).then((data) => {
            axios({
                method: "post",
                url: api_url + "/api/transactions/view/search", // URL 수정 해야 됨
                headers: {
                    "authorization": "1 " + cookie
                },
                data: { // 서버에서 req.body.{} 로 확인할 수 있다.
                    tripstart: '1998-02-20 00:00:00',
                    tripend: simpletime
                },
                // data: enData             // 데이터 안씀
            }).then((data2) => {
                if(data2){
                var get_html = null
                get_html = html_data;
                de_data = decryptRequest(data2.data);
                row = de_data.data.result;
                    row.forEach(function (i) {
                        var temp = i.sendtime ;
                        get_html += "<tr><td>" + i.from_bankcode + "</td><td>" + i.from_account + "</td><td>" + i.to_bankcode + "</td><td>" + i.to_account + "</td><td>" + i.amount + "</td><td>" + (i.sendtime).substring(0, temp.length - 5).replace('T', ' '); + "</td></tr>" ;
                    });
                    }
                    return res.render("Banking/trade_list", {pending: data, html: get_html, select: "list"});
            }).catch(function (error) {
                return res.render("Banking/trade_list", {pending: data, html: html_data, select: "list"});
            });
        });
    });

router.post("/", checkCookie, async (req, res) => {
    const cookie = req.cookies.Token;
    var bt= req.body.tripstart;
    var be= req.body.tripend;
   
    profile(cookie).then((data) => {
        axios({
            method: "post",
            url: api_url + "/api/transactions/view/search", // URL 수정 해야 됨
            headers: {
                "authorization": "1 " + cookie
            },
            data: { // 서버에서 req.body.{} 로 확인할 수 있다.
                tripstart: bt,
                tripend: be
            },
            // data: enData
            // 데이터 안씀
        }).then((data2) => {
            var post_html = null
            post_html = html_data;
            de_data = decryptRequest(data2.data);
            // global.realdata = de_data.data.result
            row = de_data.data.result;
                row.forEach(function (i) {
                    var temp = i.sendtime ;
                    console.log(i.sendtime)
                    // post_html += "<tr><td>" + i.from_account + "</td><td>" + i.to_account + "</td><td>" + i.amount + "</td><td>" + temp.substring(0, temp.length - 5); + "</td></tr>" ;
                    post_html += "<tr><td>" + i.from_account + "</td><td>" + i.to_account + "</td><td>" + i.amount + "</td><td>" + (i.sendtime).substring(0, temp.length - 5).replace('T', ' '); + "</td></tr>" ;
                });
                
            return res.render("Banking/trade_list", {pending: data, html: post_html, select: "list"});

        }).catch(function (error) {
            return res.render("Banking/trade_list", {pending: data, html: html_data, select: "list"});
        });

        // res.render("Banking/trade_list",{pending:data})
    });

});
    
module.exports = router;