
const BankAccount = require('../models/BankAccount');
const mongoose = require('mongoose');


class BankAccountService {

    async getBankAccountById(organiserId) {

        try {


            const bankAccount = await BankAccount.findOne({ organizerId: organiserId });

            if (!bankAccount) {
                throw new Error('Bank account not found for the given organiser ID');
            }

            return bankAccount;

        } catch (error) {

            throw new Error('Failed to fetch bank account');
        }

    }

    async addBankAccount(organiserId, accountData) {
        try {
            const newBankAccount = new BankAccount({
                organizerId: organiserId,
                ...accountData
            });
            await newBankAccount.save();
            return newBankAccount;
        } catch (error) {
            throw new Error('Failed to add bank account');
        }
    }

    async editBankAccount(organiserId, accountData) {

        try {
            const bankAccount = await BankAccount.findOneAndUpdate(
                { organizerId: organiserId },
                { $set: accountData },
                { new: true } // returns the updated document
            );

            if (!bankAccount) {
                throw new Error("Bank account not found");
            }

            return bankAccount;
        } catch (error) {
            console.error("Edit Bank Account Error:", error);
            throw new Error("Failed to edit bank account");
        }
    }


    async deleteBankAccount(organiserId) {

        try {

            const result = await BankAccount.findOneAndDelete({ organizerId: organiserId })

            return result

        } catch (error) {

            throw new Error("Failed to delete bank account");
        }

    }

}

module.exports = new BankAccountService();

