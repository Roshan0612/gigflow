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

    // Emit real-time notification to gig owner
    const io = getSocketIO();
    if (io) {
      const gigOwnerId = gig.ownerId.toString();
      io.emitToUser(gigOwnerId, 'new_bid', {
        message: `New bid received for "${gig.title}"`,
        gigId: gig._id,
        gigTitle: gig.title,
        bid: {
          _id: bid._id,
          freelancerId: bid.freelancerId,
          message: bid.message,
          price: bid.price,
          status: bid.status,
          createdAt: bid.createdAt
        }
      });
    }

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
  const { bidId } = req.params;
  const session = await mongoose.startSession();

  let hiredBid = null;
  let hiredGig = null;

  try {
    await session.withTransaction(async () => {
      // Re-fetch bid inside transaction
      const bid = await Bid.findById(bidId)
        .session(session)
        .populate('gigId')
        .populate('freelancerId', 'name email');

      if (!bid) {
        // Throw to abort transaction and bubble correct response
        const err = new Error('BID_NOT_FOUND');
        err.code = 'BID_NOT_FOUND';
        throw err;
      }

      // Re-fetch gig inside transaction for snapshot isolation
      const gig = await Gig.findById(bid.gigId._id).session(session);
      if (!gig) {
        const err = new Error('GIG_NOT_FOUND');
        err.code = 'GIG_NOT_FOUND';
        throw err;
      }

      // Verify user is the gig owner
      if (gig.ownerId.toString() !== req.user._id.toString()) {
        const err = new Error('NOT_OWNER');
        err.code = 'NOT_OWNER';
        throw err;
      }

      // Abort if gig already assigned
      if (gig.status !== 'open') {
        const err = new Error('GIG_ASSIGNED');
        err.code = 'GIG_ASSIGNED';
        throw err;
      }

      // 1) Update gig → assigned (conditional to ensure single-writer wins)
      const gigUpdate = await Gig.updateOne(
        { _id: gig._id, status: 'open' },
        { $set: { status: 'assigned' } },
        { session }
      );

      if (gigUpdate.modifiedCount !== 1) {
        const err = new Error('GIG_ASSIGNED');
        err.code = 'GIG_ASSIGNED';
        throw err;
      }

      // 2) Update selected bid → hired
      await Bid.updateOne(
        { _id: bid._id },
        { $set: { status: 'hired' } },
        { session }
      );

      // 3) Update all other bids → rejected
      await Bid.updateMany(
        { gigId: gig._id, _id: { $ne: bid._id } },
        { $set: { status: 'rejected' } },
        { session }
      );

      hiredBid = bid;
      hiredGig = gig;
    }, {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' }
    });
  } catch (error) {
    // Map known errors to HTTP statuses
    session.endSession();

    if (error && error.code === 'BID_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Bid not found.' });
    }
    if (error && error.code === 'GIG_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Gig not found.' });
    }
    if (error && error.code === 'NOT_OWNER') {
      return res.status(403).json({ success: false, message: 'Only the gig owner can hire freelancers.' });
    }
    if (error && error.code === 'GIG_ASSIGNED') {
      return res.status(400).json({ success: false, message: 'This gig has already been assigned to another freelancer.' });
    }

    console.error('Hire bid error:', error);
    return res.status(500).json({ success: false, message: 'Server error while hiring freelancer. Please try again.' });
  }

  session.endSession();

  // Emit only after successful commit
  if (hiredBid && hiredGig) {
    // Re-fetch bid to return updated status after transaction
    const freshBid = await Bid.findById(hiredBid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title budget');

    const io = getSocketIO();
    if (io) {
      const freelancerId = hiredBid.freelancerId._id.toString();
      io.emitToUser(freelancerId, 'hired_notification', {
        message: `You have been hired for "${hiredGig.title}"`,
        gigId: hiredGig._id,
        gigTitle: hiredGig.title
      });

      // Notify gig owner about gig status update
      const gigOwnerId = hiredGig.ownerId.toString();
      io.emitToUser(gigOwnerId, 'gig_updated', {
        gigId: hiredGig._id
      });

      // Notify all rejected bidders
      const rejectedBids = await Bid.find({
        gigId: hiredGig._id,
        _id: { $ne: hiredBid._id },
        status: 'rejected'
      }).populate('freelancerId', '_id');

      rejectedBids.forEach((rejectedBid) => {
        const rejectedFreelancerId = rejectedBid.freelancerId._id.toString();
        io.emitToUser(rejectedFreelancerId, 'gig_updated', {
          gigId: hiredGig._id,
          message: `The gig "${hiredGig.title}" has been assigned to another freelancer.`
        });
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Freelancer hired successfully.',
      bid: freshBid
    });
  }

  // Fallback (should not occur): treat as conflict
  return res.status(409).json({ success: false, message: 'Hire operation could not be completed.' });
};
