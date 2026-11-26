require('module-alias/register');
const db = require('@/db');
const registerModels = require('@/db/registerModels');

// Make sure we are running node 20+
const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater.\n ');
  process.exit();
}

// import environmental variables from our .env files
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

registerModels();

db.connect().catch((error) => {
  console.log(
    '1. Common Error caused issue -> check your Firebase credentials in .env (FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY)'
  );
  console.error(`2. Error -> : ${error.message}`);
});

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 8888);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running -> On PORT : ${server.address().port}`);
});
