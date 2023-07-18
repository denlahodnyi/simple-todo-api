const app = require('../app');
const connectDB = require('../db/connect');

const { PORT } = process.env;
const port = PORT || 3000;

module.exports = async () => {
  try {
    const mongooseInstance = await connectDB();
    const server = app.listen(port, () => {
      console.log(`🚀 App is listening on port ${port}`);
    });

    server.on('close', () => {
      console.log('Server closed');
    });

    return {
      async stop() {
        await mongooseInstance.disconnect();
        server.close();
      },
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
