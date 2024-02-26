// const { Boards } = require('../../models');
var db = require("../../middlewares/db");
var express = require("express");
var router = express.Router();
var tokenauth = require("./tokenauth");
var {decryptEnc,} = require("../../middlewares/crypt");
const profile = require("../../middlewares/profile");

router.get("/", function (req, res, next) {
    if (!req.cookies.Token) return res.render("temp/qna/alert");
    tokenauth.authresult(req, function (aResult) {
        if (aResult == true) {
            const cookie = decryptEnc(req.cookies.Token);
            profile(cookie).then((data) => {
                if (data.data.is_admin) {
                    db.query(`SELECT *
                              FROM qnas`, function (error, results) {
                        if (error) {
                            throw error;
                        }

                        var cookieData = data.data;
                        res.render("temp/qna/viewboard", {
                            select: "qnas",
                            u_data: cookieData.username,
                            results: results,
                        });

                    });
                } else {
                    var userId = data.data.username;
                    db.query(`SELECT *
                              FROM qnas
                              where userId = '${userId}'`, function (error, results) {
                        if (error) {
                            throw error;
                        }
                        var cookieData = data.data;
                        res.render("temp/qna/viewboard", {
                            select: "qnas",
                            u_data: cookieData.username,
                            results: results,
                        });
                    });
                }
            });
        } else {
            res.render("temp/qna/alert");
        }
    });
});

module.exports = router;
