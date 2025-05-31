// Vercel serverless function entry point
const { createServer } = require('../dist/index.js');

let app;

module.exports = async (req, res) => {
  if (!app) {
    // Create the Express app instance
    const server = await createServer();
    app = server;
  }
  
  // Handle the request with Express
  return app(req, res);
};