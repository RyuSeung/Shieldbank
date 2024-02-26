var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
const Sequelize = require("sequelize");
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse, decryptRequest} = require("../../../middlewares/crypt");

/**
 * Beneficiary approve route
 * This endpoint allows to view is_loan of any user
 * @path                             - /api/loan/loan
 * @middleware                       - Checks admin authorization
 * @param loan_amount
 * @param username
 * @return                           - Status
 */
router.post('/', validateUserToken, (req, res) => {
    var r = new Response();
    let username = req.body.username;
    let loan_amount = req.body.loan_amount;
    let account_number = req.body.account_number;

    Model.account.findOne({
        where: {
            account_number: account_number
        },
        attributes: ["balance"]
    }).then((data) => {
        if (data) {
            Model.users.update({
                is_loan: true
            }, {
                where : {
                    username: username
                }
            }).then(() => {
                Model.loan.create({ 
                    username: username,
                    loan_amount: loan_amount
                }).then(() => {
                    Model.account.update({
                        balance: Sequelize.literal(`balance + ${loan_amount}`)
                    }, {
                        where: {
                            account_number: account_number,
                            username : username
                        }
                    }).then(() => {
                        r.status = statusCodes.SUCCESS;
                        r.data = {
                            "message": "Success"
                        };
                        return res.json(encryptResponse(r));
                    });
                });
            });
        } else {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "error error"
            };
            return res.json(encryptResponse(r));
        }
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": err.toString()
        };
        return res.json(encryptResponse(r));
    });
})


module.exports = router;