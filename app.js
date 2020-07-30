//app.js creates the actual application and connects to the database
const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const notesRouter = require('./controllers/notes')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

//-----CONNECTION TO MONGODB------------
logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })
//---------------------------------------
//cross origin resource sharing
app.use(cors())
//built-in middleware to show static content
app.use(express.static('build'))
//json parser middleware
app.use(express.json())
//request logger middleware
app.use(middleware.requestLogger)

//defining router for blogs route (controllers/blogs.js)
app.use('/api/notes', notesRouter)

//unknown endpoint middleware
app.use(middleware.unknownEndpoint)
//error handler middleware
app.use(middleware.errorHandler)

module.exports = app