var db = require('../../middlewares/db');
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
                db.query(`SELECT *
                          FROM qnas
                          WHERE id = ${req.query.id}`, function (error, results) {
                    if (error) {
                        throw error;
                    }
                    res.render('temp/qna/getboard', {select:"qnas",results: results, u_data: cookieData.username});
                });
            } else {
                res.render('temp/qna/alert');
            }
        });
    });
});

module.exports = router;
