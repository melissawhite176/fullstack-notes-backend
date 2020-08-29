//CONTROLLERS/NOTES.JS -> all of the routes related to notes in this directory

const User = require('../models/user')

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
  const notes = await Note
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})

//-------FETCH INDIVIDUAL NOTE----------
/*path in the route handler has shortened to ('/:id')
/the router middleware was used to define "related routes"
/defined in app.js -> app.use('/api/notes', notesRouter)*/
notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

//------CREATE NEW NOTE-----------
notesRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findById(body.userId)

  /*note constructor function to create blog object
  /properties match the Blog schema in model/blog.js*/
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  response.json(savedNote)
})

//--------DELETE INDIVIDUAL NOTE----------
/*path in the route handler has shortened to ('/:id')
/the router middleware was used to define "related routes"
/defined in app.js -> app.use('/api/notes', notesRouter)*/
notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

//--------UPDATE INDIVIDUAL NOTE----------
/*path in the route handler has shortened to ('/:id')
/the router middleware was used to define "related routes"
/defined in app.js -> app.use('/api/notes', notesRouter)*/
notesRouter.put('/:id', async (request, response) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  const updatedNote = await Note.findByIdAndUpdate(request.params.id, note, { new: true })
  response.json(updatedNote)
})

module.exports = notesRouter
