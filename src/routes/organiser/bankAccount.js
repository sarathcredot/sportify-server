
const express = require('express');
const router = express.Router();
const validate = require("../../utils/validate.js")
const BankAccountController = require("../../controllers/bankAccountController.js");
const { bankAccountSchema } = require("../../schemas/bankAccountSchema.js")

const bankAccountController = new BankAccountController();


router.get('/', bankAccountController.getOrganiserBankAccount);
router.post('/', validate(bankAccountSchema), bankAccountController.addBankAccount);
router.patch("/", validate(bankAccountSchema), bankAccountController.updateBankAccount)


module.exports = router;