const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find()
      .select('-testCases')
      .populate('createdBy', 'username');
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single problem
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('createdBy', 'username');
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new problem
router.post('/', auth, async (req, res) => {
  const problem = new Problem({
    title: req.body.title,
    description: req.body.description,
    difficulty: req.body.difficulty,
    testCases: req.body.testCases,
    createdBy: req.user.id
  });

  try {
    const newProblem = await problem.save();
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a problem
router.patch('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (problem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this problem' });
    }

    Object.assign(problem, req.body);
    const updatedProblem = await problem.save();
    res.json(updatedProblem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a problem
router.delete('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (problem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this problem' });
    }

    await problem.remove();
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 