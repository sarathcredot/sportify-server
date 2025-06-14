const mongoose = require('mongoose');
const City = require('../models/City');
const Tournament = require('../models/Tournament');

async function up() {
  console.log('Starting city name fix migration...');
  
  try {
    // Find all cities where name is a MongoDB ObjectId
    console.log('Searching for cities with ID names...');
    const citiesWithIdNames = await City.find({
      name: /^[0-9a-fA-F]{24}$/
    });

    console.log(`Found ${citiesWithIdNames.length} cities with ID names`);
    
    if (citiesWithIdNames.length === 0) {
      console.log('No cities found with ID names. Migration complete.');
      return;
    }

    let processedCount = 0;
    let errorCount = 0;

    for (const city of citiesWithIdNames) {
      try {
        console.log(`\nProcessing city ${city._id} with name: ${city.name}`);
        
        // Find the actual city using the ID in the name field
        const actualCity = await City.findById(city.name);
        
        if (!actualCity) {
          console.log(`❌ Could not find city with ID: ${city.name}`);
          errorCount++;
          continue;
        }

        console.log(`Found actual city: ${actualCity._id} with name: ${actualCity.name}`);

        // Update all tournaments that reference this city to point to the actual city
        const updateResult = await Tournament.updateMany(
          { location: city._id },
          { location: actualCity._id }
        );

        console.log(`Updated ${updateResult.modifiedCount} tournament references from city ${city._id} to ${actualCity._id}`);

        // Delete the city with incorrect name
        const deleteResult = await City.deleteOne({ _id: city._id });
        console.log(`Deleted city with ID: ${city._id} (deleted: ${deleteResult.deletedCount})`);
        
        processedCount++;
      } catch (error) {
        console.error(`❌ Error processing city ${city._id}:`, error);
        errorCount++;
      }
    }

    console.log('\nMigration Summary:');
    console.log(`Total cities processed: ${processedCount}`);
    console.log(`Total errors encountered: ${errorCount}`);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    // This is a data fix migration, so we don't implement a down migration
    console.log('This migration cannot be rolled back as it fixes data inconsistencies');
  } catch (error) {
    console.error('Error in migration rollback:', error);
    throw error;
  }
}

module.exports = { up, down }; 