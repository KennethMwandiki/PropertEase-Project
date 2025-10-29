
const functions = require('@google-cloud/functions-framework');

functions.http('geocode', (req, res) => {
  res.send(`Geocoding for ${req.query.address || req.body.address}!`);
});
