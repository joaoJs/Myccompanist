const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const eventSchema = new Schema(
    {
    title: {
      type: String
    },
    creator: {
      type: String,
      required: true
    },
    content: {
      type: String
    },
    date: {
      type: Date
    },
    time: {
      type: String
    },
    location: {
      type: String,
      required: true
    },
    requiredInstruments: {
      type: String
    }
  },
  {
    timestamps: true
  }
);



const EventsModel = mongoose.model('Event', eventSchema);

module.exports = EventsModel;
