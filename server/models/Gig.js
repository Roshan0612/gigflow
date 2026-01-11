import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: 0
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'assigned'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;
