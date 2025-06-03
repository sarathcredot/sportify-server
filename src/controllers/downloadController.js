
const downloadService = require("../services/downloadService")
const ResponseHandler = require('../utils/responseHandler');
const BaseController = require('./baseController');

module.exports = {

    downloadTournamentPlayers: async (req, res) => {


        try {

            const { tournamentId } = req.params;

            console.log("downloadTournamentPlayers called", tournamentId);


            const result = await downloadService.downloadTournamentPlayers(tournamentId);
            console.log("downloadTournamentPlayers result", result);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=players.pdf");
            res.json(ResponseHandler.success("tournament players document", result));


        } catch (error) {

            consol.log("downloadTournamentPlayers error", error);

            BaseController.handleError(res, error);


        }
    }
}