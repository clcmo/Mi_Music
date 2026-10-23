require('dotenv').config();
require('./src/app')
  .start()
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
