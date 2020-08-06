/*The test imports the Express application from the app.js module
and wraps it with the supertest function into a so-called superagent object.
This object is assigned to the api variable and
tests can use it for making HTTP requests to the backend.
Our test makes an HTTP GET request to the api/notes url
and verifies that the request is responded to with the status code 200.
The test also verifies that the Content-Type header is set to application/json,
indicating that the data is in the desired format.*/

const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Note = require('../models/note')

//------------------------
/*In order to make our tests more robust,we have to reset the database
and generate the needed test data in a controlled manner before we run the tests.

The database is cleared out at the beginning, and after that we save the two notes
stored in the initialNotes array to the database. Doing this, we ensure that the
database is in the same state before every test is run.*/
const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only Javascript',
    imporant: true,
  },
]

//------------------------
//Let's initialize the database before every test with the beforeEach function
beforeEach(async () => {
  await Note.deleteMany({})

  let noteObject = new Note(initialNotes[0])
  await noteObject.save()

  noteObject = new Note(initialNotes[1])
  await noteObject.save()
})

/*The async/await syntax is related to the fact that
making a request to the API is an asynchronous operation.
The Async/await syntax can be used for writing
asynchronous code with the appearance of synchronous code.*/

//------------------------
test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

//------------------------
test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(initialNotes.length)
})

//------------------------
test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes')

  const contents = response.body.map(r => r.content)

  expect(contents).toContain(
    'Browser can execute only Javascript'
  )
})

//------------------------
/*Once all the tests (there is currently only one) have finished running
we have to close the database connection used by Mongoose.
This can be easily achieved with the afterAll method */
afterAll(() => {
  mongoose.connection.close()
})
