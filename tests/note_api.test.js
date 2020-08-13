/*The test imports the Express application from the app.js module
and wraps it with the supertest function into a so-called superagent object.
This object is assigned to the api variable and
tests can use it for making HTTP requests to the backend.
Our test makes an HTTP GET request to the api/notes url
and verifies that the request is responded to with the status code 200.
The test also verifies that the Content-Type header is set to application/json,
indicating that the data is in the desired format.*/

const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Note = require('../models/note')

//------------------------
//Let's initialize the database before every test with the beforeEach function
beforeEach(async () => {
  await Note.deleteMany({})

  let noteObjects = helper.initialNotes
    .map(note => new Note(note))
  const promiseArray = noteObjects.map(note => note.save())
  await Promise.all(promiseArray)
})

/*The async/await syntax is related to the fact that
making a request to the API is an asynchronous operation.
The Async/await syntax can be used for writing
asynchronous code with the appearance of synchronous code.*/

//------------------------
test('notes are returned as json', async () => {
  jest.setTimeout(30000)

  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

//------------------------
test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(helper.initialNotes.length)
})

//------------------------
test('a specific note is within the returned notes', async () => {
  jest.setTimeout(30000)

  const response = await api.get('/api/notes')

  const contents = response.body.map(r => r.content)

  expect(contents).toContain(
    'Browser can execute only Javascript'
  )
})

//------------------------
/*Let's write a test that adds a new note and verifies that the amount of notes returned
by the API increases, and that the newly added note is in the list. */

test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const notesAtEnd = await helper.notesInDb()
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

  const contents = notesAtEnd.map(r => r.content)
  expect(contents).toContain(
    'async/await simplifies making async calls'
  )
})

//------------------------
/*Let's also write a test that verifies that a note without content
will not be saved into the database.*/

test('note without content is not added', async () => {
  jest.setTimeout(30000)

  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(500)

  const notesAtEnd = await helper.notesInDb()

  expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
})
//------------------------
test('a specific note can be viewed', async () => {
  jest.setTimeout(30000)

  const notesAtStart = await helper.notesInDb()
  const noteToView = notesAtStart[0]

  const resultNote =
    await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

  expect(resultNote.body).toEqual(noteToView)
})

//------------------------
test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToDelete = notesAtStart[0]

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)

  const notesAtEnd = await helper.notesInDb()

  expect(notesAtEnd).toHaveLength(
    helper.initialNotes.length - 1
  )

  const contents = notesAtEnd.map(r => r.content)

  expect(contents).not.toContain(noteToDelete.content)
})

//------------------------
/*Once all the tests have finished running
we have to close the database connection used by Mongoose.
This can be easily achieved with the afterAll method */
afterAll(() => {
  mongoose.connection.close()
})
