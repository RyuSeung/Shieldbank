var db = require('../../middlewares/db');
var express = require('express');
var router = express.Router();
var tokenauth = require('./tokenauth');
const profile = require('../../middlewares/profile');
const fs = require('fs');

router.get('/', function (req, res, next) {
    if (req.cookies.Token) {
        tokenauth.admauthresult(req, function (aResult) {
            if (aResult == true) {
                db.query(`SELECT filepath
                          FROM notices
                          WHERE id = ${req.query.id}`, function (error, results) {
                    if (error) {
                        throw error;
                    }
                    var fp = results[0].filepath
                    db.query(`DELETE
                              FROM notices
                              WHERE id = ${req.query.id}`, function (error, results) {
                        if (error) {
                            throw error;
                        }
                        fs.unlink(fp, err => {
                        })
                        res.redirect('viewBoard');
                    });
                });
            } else {
                res.render('temp/notice/alert');
            }
        });
    } else {
        res.render('temp/notice/alert');
    }
});

module.exports = router;
