const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageModel = require('./message.js');
const EventsModel = require('./events.js');


const userSchema = new Schema(
    {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    password: { type: String
    },
    linkedinID: { type: String },
    instrument: {
      type: String
    },
    prof_pic: {
      type: String,
      default: "https://benopus111.files.wordpress.com/2012/01/schoenberg_blaues-s-p-february-1910.jpg"
    },
    messages: [ MessageModel.schema ],
    sentMessages: [ MessageModel.schema ],
    events: [ EventsModel.schema ],
    grades: [],
    ratingHistory: [],
    role: {
    type: String,
    enum : ['GUEST', 'EDITOR', 'ADMIN'],
    default : 'GUEST'
  }
  },
  {
    timestamps: true
  }
);

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
