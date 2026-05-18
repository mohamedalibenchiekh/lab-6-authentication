// EVENT MONGOOSE SCHEMA
// Defines event data structure with validation

import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: 'Event date must be in the future',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      minlength: [2, 'Location must be at least 2 characters'],
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [10000, 'Capacity cannot exceed 10000'],
    },
    attendees: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
    attendeeList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // This automatically handles createdAt and updatedAt
    collection: 'events',
  }
);

// Methods
eventSchema.methods.addAttendee = async function (userId) {
  if (this.attendees < this.capacity) {
    if (!this.attendeeList.includes(userId)) {
      this.attendeeList.push(userId);
      this.attendees++;
      return await this.save();
    }
  }
  return this;
};

eventSchema.methods.removeAttendee = async function (userId) {
  this.attendeeList = this.attendeeList.filter((id) => !id.equals(userId));
  this.attendees = Math.max(0, this.attendees - 1);
  return await this.save();
};

// Statics
eventSchema.statics.findUpcoming = function () {
  return this.find({
    status: 'upcoming',
    date: { $gte: new Date() },
  }).sort({ date: 1 });
};

eventSchema.statics.findByLocation = function (location) {
  return this.find({
    location: { $regex: location, $options: 'i' },
  });
};

// Indexes for performance
eventSchema.index({ date: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ title: 'text', description: 'text' });

export default eventSchema;
