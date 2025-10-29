const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// In a production environment, you would use Application Default Credentials.
// The service account key is used here for demonstration purposes.
// See: https://firebase.google.com/docs/admin/setup#initialize-sdk
try {
  const serviceAccount = require('./serviceAccountKey.json');
  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.log('Initializing with Application Default Credentials...');
  initializeApp();
}

const db = getFirestore();

module.exports = { db };