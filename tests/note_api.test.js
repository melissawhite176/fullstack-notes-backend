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
const bcrypt = require('bcrypt')

const User = require('../models/user')
const Note = require('../models/note')

//------------------------
//Let's initialize the database before every test with the beforeEach function
/*Promise.all- Promise.all executes the promises it receives in parallel.
If the promises need to be executed in a particular order, this will be problematic.
In situations like this,the operations can be executed inside of a for...of block,
that guarantees a specific execution order.*/

beforeEach(async () => {
  jest.setTimeout(30000)

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

//------------------------------------------
describe('when there is initially some notes saved', () => {

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

    expect(response.body).toHaveLength(helper.initialNotes.length)
  })

  //------------------------
  test('a specific note is within the returned notes', async () => {

    const response = await api.get('/api/notes')

    const contents = response.body.map(r => r.content)

    expect(contents).toContain(
      'Browser can execute only Javascript'
    )
  })
})

//------------------------------------------
describe('viewing a specific note', () => {

  //------------------------
  test('succeeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDb()

    const noteToView = notesAtStart[0]

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedNoteToView = JSON.parse(JSON.stringify(noteToView))

    expect(resultNote.body).toEqual(processedNoteToView)
  })
  //------------------------
  test('fails with a statuscode 404 if note does not exist', async () => {

    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/notes/${validNonexistingId}`)
      .expect(404)
  })
  //------------------------
  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/notes/${invalidId}`)
      .expect(400)
  })
})


//------------------------------------------
describe('addition of a new note', () => {
  //------------------------
  /*Let's write a test that adds a new note and verifies that the amount of notes returned
  by the API increases, and that the newly added note is in the list. */

  test('a valid note can be added', async () => {

    const usersAtStart = await helper.usersInDb()
    const firstUser = usersAtStart[0]
    const firstUserId = firstUser.id

    console.log('usersAtStart:', usersAtStart)
    console.log('firstUser:', firstUser)
    console.log('firstUserId:', firstUserId)

    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
      userId: firstUserId
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

    console.log('notesAtEnd:', notesAtEnd)

    const contents = notesAtEnd.map(r => r.content)
    expect(contents).toContain(
      'async/await simplifies making async calls'
    )
  })

  //------------------------
  /*Let's also write a test that verifies that a note without content
  will not be saved into the database.*/

  test('note without content is not added', async () => {

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

    const notesAtStart = await helper.notesInDb()
    const noteToView = notesAtStart[0]

    const resultNote =
      await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(resultNote.body).toEqual(noteToView)
  })
})


//------------------------------------------
describe('deletion of a note', () => {
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

  test('succeeds with status code 204 if id is valid', async () => {
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
})

test('a note can be updated', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToUpdate = notesAtStart[0]

  const update = {
    content: 'HTML is VERY easy',
    important: true
  }

  await api
    .put(`/api/notes/${noteToUpdate.id}`)
    .send(update)
    .expect(200)

  const notesAtEnd = await helper.notesInDb()

  expect(notesAtEnd).toHaveLength(
    helper.initialNotes.length
  )

  const contents = notesAtEnd.map(r => r.content)
  expect(contents).toContain(update.content)
})

//------------------------------------------
describe('when there is initially one user in db', () => {
  //------------------------
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

//------------------------
/*Once all the tests have finished running
we have to close the database connection used by Mongoose.
This can be easily achieved with the afterAll method */
afterAll(() => {
  mongoose.connection.close()
})
