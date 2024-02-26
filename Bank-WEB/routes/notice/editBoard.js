var db = require('../../middlewares/db');
var {seoultime} = require("../../middlewares/seoultime");
var express = require('express');
var router = express.Router();
var tokenauth = require('./tokenauth');
var {decryptEnc} = require("../../middlewares/crypt");
const profile = require('../../middlewares/profile');
const multer = require('multer')
const checkCookie = require("../../middlewares/checkCookie")
const fs = require('fs');
const upload = multer({
    storage: multer.diskStorage(
        {
            destination: function (req, file, cb) {
                cb(null, req.body.fid);
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
        }
    )
});

router.get('/', function (req, res, next) {
    if (req.cookies.Token) {
        var cookie = decryptEnc(req.cookies.Token);
        profile(cookie).then((data) => {
            var cookieData = data.data;
            tokenauth.admauthresult(req, function (aResult) {
                if (aResult == true) {
                    db.query(`SELECT *
                              FROM notices
                              where id = ${
                                      req.query.id
                              }`, function (error, results) {
                        if (error) {
                            throw error;
                        }
                        res.render('temp/notice/editBoard', {
                            select: "notices",
                            results: results,
                            u_data: cookieData.username,
                            tempid: req.query.id
                        });
                    });
                } else {
                    res.render('temp/notice/alert');
                }
            });
        });
    } else {
        res.render('temp/notice/alert');
    }
});

router.post('/edit', checkCookie, upload.single("imgimg"), function (req, res, next) {
    let filepath = "";
    let destination = "";
    if (req.file) {
        destination = req.file.destination;
        if (destination) {
            filepath = destination + "/" + req.file.filename;
        } else {
            filepath = req.file.filename;
        }
        const {title, contents, pid, deletepath} = req.body;

        db.query(`UPDATE notices
                  SET title     = '${title}',
                      content   = '${contents}',
                      filepath  = '${filepath}',
                      updatedAt = '${seoultime}'
                  WHERE id = ${pid}`, function (error, results) {
            if (error) {
                throw error;
            }
            fs.unlink(deletepath, err => {
            })
            res.redirect('../viewBoard');
        });

    } else {
        filepath = null;
        destination = null;

        const {title, contents, pid} = req.body;

        db.query(`UPDATE notices
                  SET title     = '${title}',
                      content   = '${contents}',
                      updatedAt = '${seoultime}'
                  WHERE id = ${pid}`, function (error, results) {
            if (error) {
                throw error;
            }
            res.redirect('../viewBoard');
        });
    }
});

module.exports = router;
