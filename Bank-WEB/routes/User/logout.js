var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
    res.clearCookie("Token");
    res.send("<script>alert('로그아웃 되었습니다.');location.href='/';</script>");
});


module.exports = router;