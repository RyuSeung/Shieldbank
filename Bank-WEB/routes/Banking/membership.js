var express = require('express');
var router = express.Router();
const axios = require("axios");
const profile = require('../../middlewares/profile');
const {decryptRequest} = require("../../middlewares/crypt")
const checkCookie = require("../../middlewares/checkCookie");
const IpCheck = require('../../middlewares/IpCheck');
var userdb = require('../../middlewares/userdb');



HTML_PNG = `<img src="../img/membership.png" style="width:100%;">`
// HTML_PNG = `<img src="http://www.sukybank.com/img/membership.png">`

router.get('/', checkCookie, function (req, res) {
    const cookie = req.cookies.Token

    profile(cookie).then(pending => {
        axios({
            method: "post",
            url: api_url + "/api/beneficiary/ceiling",
            headers: {"authorization": "1 " + cookie}
        }).then((data) => {
            let html = ""
            const resStatus = decryptRequest(data.data).status;
            const resData = decryptRequest(data.data).data;

            if(Array.isArray(resData))
            {
                html +=
                    "<h2 align='center'>환영합니다, 관리자님!</h2>\n" +
                    "<thead>\n" +
                    "   <tr>\n" +
                    "      <th>사용자명</th>\n" +
                    "      <th>현재 멤버십</th>\n" +
                    "      <th colspan='3'>권한 변경</th>\n" +
                    "   </tr>\n" +
                    "</thead>\n" + HTML_PNG
                
                const printData = resData.slice(1,)
                printData.forEach(x => {
                    html += 
                    `<tbody>
                        <tr>
                            <td>${x.username}</td>`
                    html += `<td><b>${x.membership}</b></td>`
                    html += 
                        `<td><a href="/bank/membership/silver?id=${x.id}" class="btn btn-secondary btn-user btn-block">SILVER</td>
                        <td><a href="/bank/membership/gold?id=${x.id}" class="btn btn-warning btn-user btn-block">GOLD</td>
                        <td><a href="/bank/membership/platinum?id=${x.id}" class="btn btn-info btn-user btn-block">PLATINUM</td>
                    </tr>
                </tbody>`

                })
            } else if (resStatus.code === 200) {
                if(resData.membership === "ADMIN") {
                    html += "<h2>이 사이트에는 멤버십을 관리할 유저가 없습니다!</h2>"
                }
                else {
                    html += `<h2 align='center'>회원님의 멤버십 등급은 ${resData.membership}등급입니다.</h2>`
                    html += HTML_PNG
                }
            } else {
                html += "<h2>오류입니다.</h2>"
            }
            res.render("Banking/membership", {html: html, pending: pending, select: "membership"})
        })
    })
});

router.get('/silver', [checkCookie, IpCheck], function (req, res, next) {
    const id = req.query.id;
    userdb.query(`UPDATE users
                  SET membership = 'SILVER'
                  WHERE id =${id};`, function (error, results) {
        if (error) { throw error; }
    });

    return res.redirect("/bank/membership")
});

router.get('/gold', [checkCookie, IpCheck], function (req, res, next) {
    const id = req.query.id;
    userdb.query(`UPDATE users
                  SET membership = 'GOLD'
                  WHERE id =${id};`, function (error, results) {
        if (error) { throw error; }
    });

    return res.redirect("/bank/membership")
});

router.get('/platinum', [checkCookie, IpCheck], function (req, res, next) {
    const id = req.query.id;
    userdb.query(`UPDATE users
                  SET membership = 'PLATINUM'
                  WHERE id =${id};`, function (error, results) {
        if (error) { throw error; }
    });

    return res.redirect("/bank/membership")
});

module.exports = router;