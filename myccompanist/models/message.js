const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
    from: {
      type: String,
      required: true
    },
    to: {
      type: String
    },
    email: {
      type: String
    },
    subject: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 999
    },
    read: {
      type: String
    }
  },
  {
    timestamps: true
  }
);


const MessageModel = mongoose.model('Message', messageSchema);

module.exports = MessageModel;
