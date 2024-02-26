// const { Boards } = require('../../models');
var db = require('../../middlewares/db');
var {seoultime} = require("../../middlewares/seoultime");
var express = require('express');
var router = express.Router();
var tokenauth = require('./tokenauth');
var {decryptEnc} = require("../../middlewares/crypt");
const profile = require('../../middlewares/profile');

router.get('/', function (req, res, next) {
    var cookie = decryptEnc(req.cookies.Token);
    profile(cookie).then((data) => {
        var cookieData = data.data;
        tokenauth.authresult(req, function (aResult) {
            if (aResult == true) {
                res.render('temp/qna/writeBoard', {select:"qnas",u_data: cookieData.username});
            } else {
                res.render('temp/qna/alert');
            }
        });
    });
});

router.post('/write', function (req, res, next) {
    var cookie = decryptEnc(req.cookies.Token);
    const {title, contents} = req.body;
    profile(cookie).then((data) => {
        var userId = data.data.username;
        db.query(`INSERT INTO qnas
                  VALUES (NULL, '${userId}', '${title}', '${contents}', '${seoultime}', '${seoultime}', NULL)`, function (error, results) {
            if (error) {
                throw error;
            }
            res.redirect('../viewBoard');
        });
    });
});

module.exports = router;