const express = require('express');
const HelpTopic = require('../models/HelpTopic');
const SupportRequest = require('../models/SupportRequest');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all help categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await HelpTopic.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Search help topics
router.get('/search', async (req, res) => {
  try {
    const { query, category, limit = 10 } = req.query;
    
    let searchFilter = { isActive: true };
    
    if (category) {
      searchFilter.category = category;
    }
    
    let helpTopics;
    
    if (query && query.trim().length > 0) {
      // Text search
      searchFilter.$text = { $search: query };
      helpTopics = await HelpTopic.find(searchFilter)
        .select('question answer category viewCount helpfulCount priority')
        .sort({ score: { $meta: 'textScore' }, priority: -1, viewCount: -1 })
        .limit(parseInt(limit));
    } else {
      // No search query, return popular topics
      helpTopics = await HelpTopic.find(searchFilter)
        .select('question answer category viewCount helpfulCount priority')
        .sort({ priority: -1, viewCount: -1 })
        .limit(parseInt(limit));
    }
    
    res.json(helpTopics);
  } catch (error) {
    console.error('Error searching help topics:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get help topics by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    
    const helpTopics = await HelpTopic.find({ 
      category, 
      isActive: true 
    })
      .select('question answer viewCount helpfulCount priority')
      .sort({ priority: -1, viewCount: -1 })
      .limit(parseInt(limit));
    
    res.json(helpTopics);
  } catch (error) {
    console.error('Error fetching category topics:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single help topic and increment view count
router.get('/topic/:id', async (req, res) => {
  try {
    const helpTopic = await HelpTopic.findById(req.params.id);
    
    if (!helpTopic || !helpTopic.isActive) {
      return res.status(404).json({ msg: 'Help topic not found' });
    }
    
    // Increment view count
    helpTopic.viewCount += 1;
    await helpTopic.save();
    
    res.json(helpTopic);
  } catch (error) {
    console.error('Error fetching help topic:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Submit feedback for help topic
router.post('/topic/:id/feedback', async (req, res) => {
  try {
    const { helpful } = req.body; // boolean
    const helpTopic = await HelpTopic.findById(req.params.id);
    
    if (!helpTopic) {
      return res.status(404).json({ msg: 'Help topic not found' });
    }
    
    if (helpful === true) {
      helpTopic.helpfulCount += 1;
    } else if (helpful === false) {
      helpTopic.notHelpfulCount += 1;
    }
    
    await helpTopic.save();
    
    res.json({ 
      msg: 'Feedback submitted successfully',
      helpfulCount: helpTopic.helpfulCount,
      notHelpfulCount: helpTopic.notHelpfulCount
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Log support request
router.post('/support-request', async (req, res) => {
  try {
    const { 
      searchQuery, 
      category, 
      foundSolution, 
      helpTopicViewed,
      escalatedToWhatsApp 
    } = req.body;
    
    const supportRequest = new SupportRequest({
      userId: req.user?.id || null,
      searchQuery,
      category,
      foundSolution,
      helpTopicViewed,
      escalatedToWhatsApp,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });
    
    await supportRequest.save();
    
    res.status(201).json({ msg: 'Support request logged successfully' });
  } catch (error) {
    console.error('Error logging support request:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get popular/trending help topics
router.get('/popular', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const popularTopics = await HelpTopic.find({ isActive: true })
      .select('question category viewCount helpfulCount')
      .sort({ viewCount: -1, helpfulCount: -1 })
      .limit(parseInt(limit));
    
    res.json(popularTopics);
  } catch (error) {
    console.error('Error fetching popular topics:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin routes for managing help topics (protected)
router.post('/admin/topic', auth, async (req, res) => {
  try {
    // Check if user is admin (you can implement role-based auth)
    const userRole = req.user.role || 'user';
    if (userRole !== 'admin' && userRole !== 'owner') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const helpTopic = new HelpTopic(req.body);
    await helpTopic.save();
    
    res.status(201).json(helpTopic);
  } catch (error) {
    console.error('Error creating help topic:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
