const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const City = require('../models/City');

async function up() {
  try {
    // Get all unique locations from tournaments
    const tournaments = await Tournament.find({});
    const uniqueLocations = [...new Set(tournaments.map(t => t.location))];

    // Create cities for each unique location
    for (const location of uniqueLocations) {
      if (location) {
        await City.findOneAndUpdate(
          { name: location },
          { name: location },
          { upsert: true, new: true }
        );
      }
    }

    // Update tournament locations to reference city documents
    for (const tournament of tournaments) {
      if (tournament.location) {
        const city = await City.findOne({ name: tournament.location });
        if (city) {
          await Tournament.updateOne(
            { _id: tournament._id },
            { $set: { location: city._id } }
          );
        }
      }
    }

    console.log('Successfully migrated tournament locations to city references');
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

async function down() {
  try {
    // Get all tournaments with city references
    const tournaments = await Tournament.find({ location: { $exists: true } });

    // Update tournament locations back to city names
    for (const tournament of tournaments) {
      if (tournament.location) {
        const city = await City.findById(tournament.location);
        if (city) {
          await Tournament.updateOne(
            { _id: tournament._id },
            { $set: { location: city.name } }
          );
        }
      }
    }

    console.log('Successfully reverted tournament locations back to city names');
  } catch (error) {
    console.error('Error in migration rollback:', error);
    throw error;
  }
}

module.exports = { up, down }; 