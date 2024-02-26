var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse } = require("../../../middlewares/crypt");

/**
 * Account view route
 * @path                 - /api/mydata/view
 * @middleware
 * @return               
 */
router.post('/', validateUserToken, (req, res) => {
    var r = new Response();
    console.log("Request username in /api/mydata/view.js", req.username);
    Model.account.findAll({
        where: {
            username: req.username
        },
        attributes: ["balance", "account_number", "bank_code"]
    }).then((data) => {
        console.log("api/mydata' LOG@@@@@@@@@@@@@@@@@@@@:",data);
        if(data.length > 0) {
            r.status = statusCodes.SUCCESS;
            r.data = data;
            return res.json(encryptResponse(r));
        } else {
            r.status = statusCodes.NOT_AUTHORIZED;
            r.data = {
                "message": "Not authorized"
            }
            return res.json(encryptResponse(r));
        }
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": err.toString()
        };
        res.json(encryptResponse(r));
    });
});

module.exports = router;