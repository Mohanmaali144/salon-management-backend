import cron from "node-cron";
import fs from "fs";
import path from "path";

/**
 * scheduleFileCleanup - deletes files older than specified hours
 * @param {String} folderPath - path of folder to clean
 * @param {Number} olderThanHours - files older than this will be deleted
 */
export const scheduleFileCleanup = (folderPath, olderThanHours = 24) => {
  // Run every day at midnight (can customize)
  cron.schedule("0 0 * * *", () => {
    console.log(`[Cron] Running file cleanup in ${folderPath}`);

    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error("Error reading folder:", err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;

          const fileAgeHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
          if (fileAgeHours > olderThanHours) {
            fs.unlink(filePath, (err) => {
              if (!err) console.log(`Deleted old file: ${filePath}`);
            });
          }
        });
      });
    });
  });
};





// USE CASE
// const uploadFolder = "./uploads";
// Delete files older than 24 hours every day at midnight
// scheduleFileCleanup(uploadFolder, 24);