require('dotenv').config();

module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI || "",
    databaseName: process.env.MONGODB_DB || undefined,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".cjs",
};
