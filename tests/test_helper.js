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

const nonExistingId = async () => {
  const note = new Note({ content: 'willremovethissoon' })
  await note.save()
  await note.remove()

  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

module.exports = {
  initialNotes, nonExistingId, notesInDb
}