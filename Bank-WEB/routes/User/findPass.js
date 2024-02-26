var express = require('express');
const mysql = require('mysql');
const dbConfig = require('../../middlewares/userdb'); // MySQL 연결 설정 파일
const Response = require("../../middlewares/Response");
const {decryptRequest, decryptEnc, encryptResponse} = require("../../middlewares/crypt");
const axios = require("axios");
const sha256 = require("js-sha256");

var router = express.Router();

//인증번호 랜덤 생성 함수
function generateRandomVerificationCode() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* GET users listing. */
router.get('/', function (req, res, next) {
    var username = req.query.username;
    res.render("temp/findPass", {select: "login", username: username});
});


//router.post('/', async function (req, res, next) {
router.post('/', (req, res) => {
    const username = req.body.username;
    const phone = req.body.phone;
    const baseData = `{"username" : "${username}", "phone" : "${phone}"}`
    let resStatus = ""
    let resMessage = ""

    axios({
        method: "post",
        url: api_url + "/api/User/findPass",
        data: encryptResponse(baseData)
    }).then((data) => {
        resStatus = decryptRequest(data.data).status
        resMessage = decryptRequest(data.data).data.message

        if (resStatus.code === 200) {
            const coolsms = require('coolsms-node-sdk').default;
            // apiKey, apiSecret 설정
            const messageService = new coolsms('NCSJNBLDEOQZTVKQ', 'UCJV18RJCZSDJGGONWZXM6D2LVYJJBWB');

            const auth_num = generateRandomVerificationCode();
            const auth_num_str = auth_num.toString();

            //if로 이미 authnum있으면~
            dbConfig.query(`SELECT * FROM smsauths WHERE username = '${username}'`, function(error, results, fields) {
                if (error) {
                    throw error;
                }
                else if(results.length > 0) {
                    dbConfig.query(`UPDATE smsauths SET authnum = '${auth_num_str}' WHERE username = '${username}'`, function(error, result) {
                        if (error) {
                            throw error;
                        }
                    });
                }else {
                    dbConfig.query(`INSERT INTO smsauths (username, authnum) VALUES ('${username}', '${auth_num_str}')`, function(error, result) {
                        if (error) {
                            throw error;
                        }
                    });
                }
            });

            //2건 이상의 메시지를 발송할 때는 sendMany, 단일 건 메시지 발송은 sendOne을 이용해야 합니다. 
            messageService.sendOne(
                {
                to: phone,
                from: "01027638820",
                text: auth_num_str
                }
                // 1만건까지 추가 가능
            ).then(res => console.log(res))
            .catch(err => console.error(err));
            return res.send(`<script>alert('인증번호가 발송되었습니다.');location.href = \"/user/smsAuth?username=${username}\";</script>`);
            //res.render(`/user/smsAuth?username=${username}`, {select: "smsAuth", message: resMessage});
        } else {
            res.render("temp/findPass", {select: "findPass", message: resMessage})
        }
    })
})

module.exports = router;