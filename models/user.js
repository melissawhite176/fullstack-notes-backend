/*Mongoose schema for users:
In this case, we make the decision to store the ids
of the notes created by the user in the user document.
Let's define the model for representing a user in the models/user.js file*/

/*In stark contrast to the conventions of relational databases,
references ('ref') are now stored in both documents: the note references the user who created it,
and the user has an array of references to all of the notes created by them.*/

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  notes: [
    //The ids of the notes are stored within the user document as an array of Mongo ids.
    //The definition is as follows:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
    //The type of the field is ObjectId that references note-style documents.
    //Mongo does not inherently know that this is a field that references notes,
    //the syntax is purely related to and defined by Mongoose.
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    //the passwordHash should not be revealed
    delete returnedObject.passswordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User