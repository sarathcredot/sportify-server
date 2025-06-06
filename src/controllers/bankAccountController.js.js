

const BaseController = require("./baseController");
const bankAccountServic = require("../services/BankAccountService");

class BankAccountController extends BaseController {

    constructor() {

        super()
        this.getOrganiserBankAccount = this.getOrganiserBankAccount.bind(this);
        this.addBankAccount = this.addBankAccount.bind(this)
        this.editBankAccount=this.editBankAccount.bind(this)
        

    }


    async getOrganiserBankAccount(req, res) {
        try {

            const user = req.user;
            const result = await bankAccountServic.getBankAccountById(user.id);
            this.handleSuccess(res, result, "Bank account retrieved successfully");

        } catch (error) {
            this.handleError(res, error);
        }
    }

    async addBankAccount(req, res) {

        try {

            const user = req.user;

            const result = await bankAccountServic.addBankAccount(user?.id, req.body);

            this.handleSuccess(res, result, "Bank account added successfully");

        } catch (error) {

            this.handleError(res, error);
        }
    }

    async editBankAccount(req, res) {


        try {
            const user = req.user
            const result = await bankAccountServic.editBankAccount(user?.id, req.body)
            this.handleSuccess(res, result, "Bank account edited successfully");


        } catch (error) {

            this.handleError(res, error);

        }
    }
    
    async deleteBankAccount(req, res) {

        try {

            const user = req.user
            const result = await bankAccountServic.deleteBankAccount(user?.id)
            this.handleSuccess(res, result, "Bank account delete successfully");


        } catch (error) {

            this.handleError(res, error);

        }

    }
}


module.exports = BankAccountController;