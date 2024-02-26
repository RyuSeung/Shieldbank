var express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
    const url = req.query.url
    apidownurl = "http://127.0.0.1:3000/api/notice/download?filename=" + url //리다이렉트기 때문에 공인 IP넣어야 됨
    res.redirect(apidownurl)
})

module.exports = router;