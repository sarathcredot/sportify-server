
const downloadService = require("../services/downloadService")
const ResponseHandler = require('../utils/responseHandler');
const BaseController = require('./baseController');

module.exports = {

    downloadTournamentPlayers: async (req, res) => {


        try {

            const { tournamentId } = req.params;

            console.log("downloadTournamentPlayers called", tournamentId);


            const result = await downloadService.downloadTournamentPlayers(tournamentId);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=players.pdf");
            res.json(ResponseHandler.success("tournament players document", result));


        } catch (error) {

            consol.log("downloadTournamentPlayers error", error);

            BaseController.handleError(res, error);


        }
    },


    downloadTournamentTeam:async(req,res)=>{
        try {

            const { tournamentId } = req.params;

            console.log("downloadTournamentTeam called", tournamentId);

            const result = await downloadService.downloadTournamentTeam(tournamentId);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=teams.pdf");
            res.json(ResponseHandler.success("tournament teams document", result));

        } catch (error) {

            console.log("downloadTournamentTeam error", error);

            BaseController.handleError(res, error);

        }
    }
}