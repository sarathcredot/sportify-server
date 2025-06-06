
const express = require('express');
const router = express.Router();
const BankAccountController = require("../../controllers/bankaccountController");

const bankAccountController = new BankAccountController();


router.get('/', bankAccountController.getOrganiserBankAccount());