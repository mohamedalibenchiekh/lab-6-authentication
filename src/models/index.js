// MONGOOSE MODELS
// Export all models

import mongoose from 'mongoose';
import eventSchema from './EventSchema.js';
import userSchema from './UserSchema.js';

export const Event = mongoose.model('Event', eventSchema);
export const User = mongoose.model('User', userSchema);

export default { Event, User };
