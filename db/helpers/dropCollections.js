const mongoose = require('mongoose');

module.exports = async function dropCollections() {
  try {
    const { db } = mongoose.connection;
    const collections = await db.listCollections().toArray();
    const names = collections.map((collection) => collection.name);
    return Promise.all(
      names.map(async (name) => {
        await db.dropCollection(name);
      })
    );
  } catch (error) {
    console.log(error);
    return [];
  }
};
