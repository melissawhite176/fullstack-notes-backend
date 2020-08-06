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

const api= supertest(app)


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
test('there are two notes', async () => {
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(2)
})

//------------------------
test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes')

  expect(response.body[0].content).toBe('HTML is Easy')
})

//------------------------
/*Once all the tests (there is currently only one) have finished running
we have to close the database connection used by Mongoose.
This can be easily achieved with the afterAll method */
afterAll(() => {
  mongoose.connection.close()
})
