import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import { getSocketIO } from '../socket/index.js';

export const createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    // Validation
    if (!gigId || !message || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: gigId, message, price.'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0.'
      });
    }

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found.'
      });
    }

    // Check if gig is still open
    if (gig.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This gig is no longer accepting bids.'
      });
    }

    // Prevent gig owner from bidding on their own gig
    if (gig.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own gig.'
      });
    }

    // Create bid (duplicate bids are prevented by unique index on gigId + freelancerId)
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price
    });

    // Populate freelancer info
    await bid.populate('freelancerId', 'name email');
    await bid.populate('gigId', 'title budget');

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully.',
      bid
    });
  } catch (error) {
    console.error('Create bid error:', error);

    // Handle duplicate bid error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already placed a bid on this gig.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating bid.'
    });
  }
};

export const getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found.'
      });
    }

    // Only gig owner can view bids
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the gig owner can view bids.'
      });
    }

    // Get all bids for this gig
    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bids.'
    });
  }
};

// CRITICAL: Atomic hiring logic with MongoDB transactions
export const hireBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    // Find the bid within transaction
    const bid = await Bid.findById(bidId)
      .populate('gigId')
      .populate('freelancerId', 'name email')
      .session(session);

    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Bid not found.'
      });
    }

    const gig = bid.gigId;

    // Verify user is the gig owner
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Only the gig owner can hire freelancers.'
      });
    }

    // CRITICAL: Verify gig status is still "open"
    // This prevents race condition where two hire requests occur simultaneously
    if (gig.status !== 'open') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'This gig has already been assigned to another freelancer.'
      });
    }

    // ATOMIC OPERATIONS WITHIN TRANSACTION:

    // 1. Update gig status to "assigned"
    await Gig.findByIdAndUpdate(
      gig._id,
      { status: 'assigned' },
      { session }
    );

    // 2. Update selected bid to "hired"
    await Bid.findByIdAndUpdate(
      bidId,
      { status: 'hired' },
      { session }
    );

    // 3. Update all other bids for this gig to "rejected"
    await Bid.updateMany(
      { 
        gigId: gig._id, 
        _id: { $ne: bidId } 
      },
      { status: 'rejected' },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send Socket.io notification to hired freelancer
    const io = getSocketIO();
    if (io) {
      const freelancerId = bid.freelancerId._id.toString();
      io.emitToUser(freelancerId, 'hired_notification', {
        message: `You have been hired for "${gig.title}"`,
        gigId: gig._id,
        gigTitle: gig.title
      });
    }

    res.status(200).json({
      success: true,
      message: 'Freelancer hired successfully.',
      bid
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error('Hire bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while hiring freelancer. Please try again.'
    });
  }
};
