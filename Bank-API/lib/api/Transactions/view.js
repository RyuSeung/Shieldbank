var express = require("express");
var router = express.Router();
var Model = require("../../../models/index");
var Response = require("../../Response");
var statusCodes = require("../../statusCodes");
var { validateUserToken } = require("../../../middlewares/validateToken");
const { Op } = require("sequelize");
var { encryptResponse } = require("../../../middlewares/crypt");
/**
 * Transactions viewing route
 * This endpoint allows to view all transactions of authorized user
 * @path                             - /api/transactions/view
 * @middleware
 * @return                           - Status
 */
router.post("/", validateUserToken, (req, res) => {
    var r = new Response();
    let { account_number } = req;
    console.log("transaction's account_number check!!!! : ",account_number);

    Model.transactions
        .findAll({
            where: {
                [Op.or]: [
                    { from_account: account_number },
                    { to_account: account_number },
                ],
            },
            attributes: ["from_account", "to_account", "amount", "sendtime"],
        })
        .then((transactions) => {
            r.status = statusCodes.SUCCESS;
            r.data = transactions;
            return res.json(encryptResponse(r));
        })
        .catch((err) => {
            r.status = statusCodes.SERVER_ERROR;
            r.data = {
                message: err.toString(),
            };
            return res.json(encryptResponse(r));
        });
});

router.post("/search", validateUserToken, async (req, res) => {
    var r = new Response();
    let username = req.username;
    const startDate = req.body.tripstart;
    const endDate = req.body.tripend + " 23:59:59";
    console.log("transaction's account_number check!!!! : ",username);


    //username 받아서 해당 username으로 account 테이블에서 List 뽑아서, 해당 transactions에서 뽑아오는걸로.
    try{
    const results = await Model.sequelize.query(
        // `SELECT DISTINCT * FROM transactions WHERE
        //  (from_account = ${account_number} OR to_account = ${account_number}) AND 
        //  sendtime >= '${startDate}' AND sendtime <= '${endDate}'`

         `         SELECT DISTINCT t.* 
         FROM transactions t 
         JOIN account a ON t.from_account = a.account_number OR t.to_account = a.account_number 
         WHERE a.username = '${username}' AND sendtime >= '${startDate}' AND sendtime <= '${endDate}';

         `
        //  `SELECT DISTINCT * FROM transactions WHERE
        //  sendtime >= '${startDate}' AND sendtime <= '${endDate}'`

        /*
        SELECT * FROM transactions where (from_account=(SELECT * FROM account where username='${username}') or to_account=(SELECT * FROM account where username='${username}'))AND 
         sendtime >= '${startDate}' AND sendtime <= '${endDate}';
         SELECT DISTINCT t.* FROM transactions t JOIN account a ON t.from_account = a.account_number OR t.to_account = a.account_number WHERE a.username = '${username}' AND sendtime >= '${startDate}' AND sendtime <= '${endDate}';
        
        */ 
    );

    const [returndata] = results;
    r.status = statusCodes.SUCCESS;
    r.data = { result: returndata };
    console.log("HIHIHIHIHIHIIHHIHIH**&*&*&*&*(&(&(#@*$&$*#@$&$*($&",r.data)
}
    catch(error){
    r.status = statusCodes.ERROR;
    r.message = error.message;
    }
    return res.json(encryptResponse(r));
});

module.exports = router;
