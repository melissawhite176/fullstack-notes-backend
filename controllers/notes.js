//CONTROLLERS/NOTES.JS -> all of the routes related to notes in this directory

/*A router object is an isolated instance of middleware and routes.
You can think of it as a “mini-application,” capable only of performing middleware and routing functions.
Every Express application has a built-in app router.
A router behaves like middleware itself, so you can use it as an argument to app.use()
or as the argument to another router’s use() method.
The top-level express object has a Router() method that creates a new router object.
Once you’ve created a router object, you can add middleware and HTTP method routes
(such as get, put, post, and so on) to it just like an application.*/
const notesRouter = require('express').Router()

//blog schema from blog.js (models)
const Note = require('../models/note')

//----------FETCH ALL NOTES---------------
/*path in the route handler has shortened to ('/')
the router middleware was used to define "related routes"
defined in app.js -> app.use('/api/notes', notessRouter)*/
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

//-------FETCH INDIVIDUAL NOTE----------
/*path in the route handler has shortened to ('/:id')
/the router middleware was used to define "related routes"
/defined in app.js -> app.use('/api/notes', notesRouter)*/
notesRouter.get('/id:', (request, response, next) => {
  notesRouter.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end
      }
    })
    .catch(error => next(error))
})

//------CREATE NEW NOTE-----------
notesRouter.post('/', (request, response, next) => {
  const body = request.body

  /*note constructor function to create blog object
  /properties match the Blog schema in model/blog.js*/
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  note
    .save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})

//--------DELETE INDIVIDUAL NOTE----------
/*path in the route handler has shortened to ('/:id')
/the router middleware was used to define "related routes"
/defined in app.js -> app.use('/api/notes', notesRouter)*/
notesRouter.delete('/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//--------UPDATE INDIVIDUAL NOTE----------
/*path in the route handler has shortened to ('/:id')
/the router middleware was used to define "related routes"
/defined in app.js -> app.use('/api/notes', notesRouter)*/
notesRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

module.exports = notesRouter
