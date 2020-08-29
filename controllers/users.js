//CONTROLLERS/USERS.JS -> all of the routes related to users in this directory
/*A router object is an isolated instance of middleware and routes.
You can think of it as a “mini-application,” capable only of performing middleware and routing functions.
Every Express application has a built-in app router.
A router behaves like middleware itself, so you can use it as an argument to app.use()
or as the argument to another router’s use() method.
The top-level express object has a Router() method that creates a new router object.
Once you’ve created a router object, you can add middleware and HTTP method routes
(such as get, put, post, and so on) to it just like an application.*/

/*Creating new users happens in compliance with the RESTful conventions discussed in part 3,
by making an HTTP POST request to the users path.Let's define a separate router for
dealing with users in a new controllers/users.js file. Let's take the router into use in
our application in the app.js file, so that it handles requests made to the /api/users url.*/

const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const body = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  try {
    const savedUser = await user.save()
    response.json(savedUser)
  } catch (exception) {
    response.status(400)
      .json({
        error: exception.message
      })
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  response.json(users)
})

usersRouter.delete('/:id', async (request, response) => {
  await User.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = usersRouter

/*The password sent in the request is not stored in the database.
We store the hash of the password that is generated with the bcrypt.hash function. */