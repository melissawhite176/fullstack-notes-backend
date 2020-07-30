//index.js file imports the actual application from the app.js file
//and then starts the application

//contents of file used to start the application
const app = require('./app')
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')

//create server with Node.js HTTP module
const server = http.createServer(app)

//tell server to listen on the defined port (defined in config)
//and print to console to let us know the server is up and running
server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})