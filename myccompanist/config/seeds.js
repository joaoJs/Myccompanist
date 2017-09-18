const mongoose = require('mongoose');

const MessageModel = require('../models/message.js');


mongoose.connect('mongodb://localhost/myccompanist');

const messagesArray = [
  {
    from: "jetsy",
    to: 'liu',
    email: 'jet@j.j',
    subject: 'Hello',
    content: 'amerre amerre'
  },
  {
    from: "jetsyx",
    to: 'liux',
    email: 'jetx@j.j',
    subject: 'Hellox',
    content: 'amerrex amerrex'
  }
];

MessageModel.create(
  messagesArray,
  (err, mess) => {
      if (err) {
          return;
      }

      mess.forEach((message) => {
          console.log('New Product ---> ' + message.subject);
      });
  }
);
