var db = require('../../middlewares/db');
var {seoultime} = require('../../middlewares/seoultime');
var express = require('express');
var router = express.Router();
var tokenauth = require('./tokenauth');
var {decryptEnc} = require("../../middlewares/crypt");
const profile = require('../../middlewares/profile');

router.get('/', function (req, res, next) {
    var cookie = decryptEnc(req.cookies.Token);
    profile(cookie).then((data) => {
        var cookieData = data.data;
        tokenauth.admauthresult(req, function (aResult) {
            if (aResult == true) {
                db.query(`SELECT *
                          FROM qnas
                          where id = ${req.query.id}`, function (error, results) {
                    if (error) {
                        throw error;
                    }
                    res.render('temp/qna/addcomment', {
                        select: "qnas",
                        u_data: cookieData.username,
                        results: results,
                        tempid: req.query.id
                    });
                });
            } else {
                res.render('temp/qna/alert');
            }
        });
    })
});

router.post('/edit', function (req, res, next) {
    const {comment, pid} = req.body;
    //will be extracted from token
    db.query(`UPDATE qnas
              SET comment   = '${comment}',
                  updatedAt = '${seoultime}'
              WHERE id = ${pid}`, function (error, results) {
        if (error) {
            throw error;
        }
        res.redirect('../viewBoard');
    });

});

module.exports = router;