import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'hired', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent multiple bids by same user on same gig
bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
