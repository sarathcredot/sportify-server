

const BaseController = require("./baseController");


class BankAccountController extends BaseController {

    constructor() {

        super()
        this.getOrganiserBankAccount = this.getOrganiserBankAccount.bind(this);
    }


    async getOrganiserBankAccount(req, res) {
        try {

        } catch (error) {
            this.handleError(res, error);
        }
    }
}


module.exports = BankAccountController;