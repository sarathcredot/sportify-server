const mongoose = require('mongoose');
const TournamentTeams = require('../models/TournamentTeams');
const User = require('../models/User');
const Team = require('../models/Team');

async function up() {
  try {
    // Get all tournament teams
    const tournamentTeams = await TournamentTeams.find({}).populate('team');

    // Update each tournament team to set teamManager from team.manager
    for (const team of tournamentTeams) {
      if (team.team && team.team.manager) {
        await TournamentTeams.updateOne(
          { _id: team._id },
          { $set: { teamManager: team.team.manager } }
        );
      } else {
        // If no team or manager exists, set to null
        await TournamentTeams.updateOne(
          { _id: team._id },
          { $set: { teamManager: null } }
        );
      }
    }

    console.log('Successfully updated teamManager field from team managers');
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

async function down() {
  try {
    // Remove teamManager field from all tournament teams
    await TournamentTeams.updateMany(
      {},
      { $unset: { teamManager: "" } }
    );

    console.log('Successfully removed teamManager field from tournament teams');
  } catch (error) {
    console.error('Error in migration rollback:', error);
    throw error;
  }
}

module.exports = { up, down }; 