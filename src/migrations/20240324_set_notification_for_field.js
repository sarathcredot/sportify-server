const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { NOTIFICATION_FOR } = require('../utils/constants');

async function up() {
  console.log('Starting notificationFor field migration...');
  
  try {
    // Find all notifications that don't have notificationFor field set
    console.log('Searching for notifications without notificationFor field...');
    const notificationsWithoutField = await Notification.find({
      $or: [
        { notificationFor: { $exists: false } },
        { notificationFor: null },
        { notificationFor: "" }
      ]
    });

    console.log(`Found ${notificationsWithoutField.length} notifications without notificationFor field`);
    
    if (notificationsWithoutField.length === 0) {
      console.log('No notifications found without notificationFor field. Migration complete.');
      return;
    }

    // Update all notifications to set notificationFor as "tournament"
    const updateResult = await Notification.updateMany(
      {
        $or: [
          { notificationFor: { $exists: false } },
          { notificationFor: null },
          { notificationFor: "" }
        ]
      },
      { 
        $set: { notificationFor: NOTIFICATION_FOR.TOURNAMENT }
      }
    );

    console.log(`Updated ${updateResult.modifiedCount} notifications with notificationFor: "${NOTIFICATION_FOR.TOURNAMENT}"`);
    
    // Verify the update
    const remainingNotifications = await Notification.find({
      $or: [
        { notificationFor: { $exists: false } },
        { notificationFor: null },
        { notificationFor: "" }
      ]
    });

    console.log(`Remaining notifications without notificationFor field: ${remainingNotifications.length}`);
    
    console.log('\nMigration Summary:');
    console.log(`Total notifications processed: ${updateResult.modifiedCount}`);
    console.log(`Migration completed successfully`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    // This migration sets a required field, so we don't implement a down migration
    // as it would make the data inconsistent with the current schema requirements
    console.log('This migration cannot be rolled back as it sets a required field');
  } catch (error) {
    console.error('Error in migration rollback:', error);
    throw error;
  }
}

module.exports = { up, down }; 