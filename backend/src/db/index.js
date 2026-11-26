const { Schema, model, models, isObjectIdLike, clearCache } = require('./firestoreModel');
const { getDb, initializeFirebase, setMockDb } = require('./firebase');

const Types = {
  ObjectId: {
    isValid: isObjectIdLike,
  },
  Mixed: Schema.Types.Mixed,
};

const connection = {
  readyState: 1,
  on: () => {},
  once: () => {},
};

async function connect() {
  const db = initializeFirebase();
  connection.readyState = 1;
  return db;
}

module.exports = {
  Schema,
  SchemaTypes: Schema.Types,
  model,
  models,
  Types,
  isValidObjectId: isObjectIdLike,
  Promise: global.Promise,
  connection,
  connect,
  getDb,
  setMockDb,
  clearCache,
};
