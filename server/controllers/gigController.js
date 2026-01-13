import Gig from '../models/Gig.js';
import { getSocketIO } from '../socket/index.js';

export const getGigs = async (req, res) => {
  try {
    const { search } = req.query;

    // Build query - only get open gigs
    const query = { status: 'open' };

    // Add search filter if provided
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Get gigs and populate owner info
    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: gigs.length,
      gigs
    });
  } catch (error) {
    console.error('Get gigs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gigs.'
    });
  }
};

export const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    // Validation
    if (!title || !description || !budget) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, budget.'
      });
    }

    if (budget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget must be greater than 0.'
      });
    }

    // Create gig with logged-in user as owner
    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id
    });

    // Populate owner info
    await gig.populate('ownerId', 'name email');

    // Emit real-time event to connected clients about the new gig
    try {
      const io = getSocketIO();
      if (io) {
        // Emit the newly created gig (populated) to all connected clients
        io.emit('gig_created', gig);
      }
    } catch (emitErr) {
      console.error('Error emitting gig_created event:', emitErr);
    }

    res.status(201).json({
      success: true,
      message: 'Gig created successfully.',
      gig
    });
  } catch (error) {
    console.error('Create gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating gig.'
    });
  }
};

export const getGigById = async (req, res) => {
  try {
    const { id } = req.params;

    const gig = await Gig.findById(id).populate('ownerId', 'name email');

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found.'
      });
    }

    res.status(200).json({
      success: true,
      gig
    });
  } catch (error) {
    console.error('Get gig by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gig.'
    });
  }
};
