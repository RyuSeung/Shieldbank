var express = require('express');
var router = express.Router();
var axios = require("axios");
var { encryptResponse, decryptRequest } = require("../../middlewares/crypt");
const profile = require('../../middlewares/profile');
const checkCookie = require("../../middlewares/checkCookie")

router.get('/', checkCookie, function (req, res) {      // 요청하기 버튼 띄워주는 get 요청
    const cookie = req.cookies.Token;

    profile(cookie).then(profileData => {
        //해야되는 것이 is_mydata를 받아와서 1이면 신청하기 버튼이 보이면 안되고, 0이면 신청하기 버튼이 보여야함.
        var is_mydata = profileData.data.is_mydata;
        if (is_mydata) {
            return res.redirect("/bank/mydata");
        }
        else {
            var result = `
            <div style="text-align:center; width:100%; display:inline-block;">
            <form action="/bank/mydata_auth" method="post">
            <button class="btn btn-user btn-block" type="submit" id="view" value="submit" style="background-color:#b937a4 !important; color:white !important;">마이데이터 요청</button>
            </form>
            </div>
          `
            return res.render("Banking/mydata_auth", { html_data: result, pending: profileData, select: "mydata" });
        }

        // return res.render("Banking/mydata_auth", {html_data: "<br/>", pending: profileData, select: "mydata"});
    });
});

router.post('/', checkCookie, function (req, res) {         //해당 요청하기 버튼을 눌렀을 때 post를 보내주는 코드.
    const cookie = req.cookies.Token;

    profile(cookie).then(profileData => {
        axios({
            method: "get",
            url: api_url + "/api/Mydata/mydata_sms",
            headers: { "authorization": "1 " + cookie }
        }).then((data) => {

            let result = decryptRequest(data.data);
            if (result.status.code == 200) { //인증번호가 제대로 보내졌으므로 인증번호를 입력하는 창으로 보냄.
                let result = `
                <form action="/bank/mydata_auth/authnum" method="post" id="authnum">
                  <div class="form-group">
                      <input type="number" class="form-control form-control-user" name="authnum" placeholder="인증번호를 입력해주세요" value="">
                          <br>
                  </div>
                </form>
                <a onclick="document.getElementById('authnum').submit()" class="btn btn-user btn-block" style="background-color:#b937a4 !important; color:white !important;">
                확인
              </a>
              <br>
              <a href="/bank/mydata_auth" onclick="document.getElementById('register').submit();" class="btn btn-user btn-block" style="background-color:#b937a4 !important; color:white !important;">
                취소
              </a>
                `
                return res.render("Banking/success_auth", { html_data: result, pending: profileData, select: "mydata" });
            }
            else {
                let result = "오류입니다."


                return res.render("Banking/success_auth", { html_data: result, pending: profileData, select: "mydata" })
            }
        }).catch(function (error) {

            var html_data = [
                { username: error, balance: error, account_number: error, bank_code: error }
            ];
            return res.render("Banking/mydata_auth", { html_data: html_data, pending: profileData, select: "mydata" });
        });
    });
});


router.post('/authnum', checkCookie, function (req, res) {      //인증번호를 A API로 보내주는 부분.
    const cookie = req.cookies.Token;
    let authnum = req.body.authnum;
    profile(cookie).then(profileData => {
        axios({
            method: "post",
            url: api_url + "/api/Mydata/mydata_sms",
            headers: { "authorization": "1 " + cookie },
            data: {
                authnum: authnum
            }
        }).then((smsdata) => {
            var result = decryptRequest(smsdata.data);
            if (result.status.code == 200) {

                let html_data = `
                <script>
                alert('인증에 성공했습니다');
                window.location.href = "/bank/mydata";
            </script>
              `;
                return res.send(html_data);
            } else {

                let html_data = `
              <script>alert('인증에 실패했습니다');</script>
              `;

                return res.render("Banking/mydata_auth", { html_data: html_data, pending: profileData, select: "mydata" });
            }
        }).catch(function (err) {

            var result = "<tr>에러 페이지 입니다.</tr>"
            return res.render("Banking/mydata_auth", { html_data: result, pending: profileData, select: "mydata" });
        });
    });
})
module.exports = router;