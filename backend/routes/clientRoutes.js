const express = require('express');
const router = express.Router();
const {
  createRequirement,
  getMyRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  getRequirementMatches,
  toggleFavorite,
  getMyFavorites,
  createSavedSearch,
  getMySavedSearches,
  deleteSavedSearch,
} = require('../controllers/clientController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

// Requirements
router.post('/requirements', createRequirement);
router.get('/requirements', getMyRequirements);
router.get('/requirements/:id', getRequirementById);
router.patch('/requirements/:id', updateRequirement);
router.delete('/requirements/:id', deleteRequirement);
router.get('/requirements/:id/matches', getRequirementMatches);

// Favorites
router.post('/favorites/:propertyId', toggleFavorite);
router.get('/favorites', getMyFavorites);

// Saved Searches
router.post('/saved-searches', createSavedSearch);
router.get('/saved-searches', getMySavedSearches);
router.delete('/saved-searches/:id', deleteSavedSearch);

module.exports = router;
