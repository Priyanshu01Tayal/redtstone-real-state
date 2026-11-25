
const express = require('express');
const router = express.Router();

const {
  getPublicProperties,
  getPublicPropertyById,
  getFeaturedProperties,
  ownerCreateProperty,
  ownerGetMyProperties,
  ownerUpdateProperty,
  ownerDeleteProperty,
  updateCategorizedMedia,
  process3DExperience,
  review3DExperience,
  get3DExperience,
} = require('../controllers/propertyController');

const { protect, optionalProtect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

// Public routes
router.get('/featured', getFeaturedProperties);
router.get('/', optionalProtect, getPublicProperties);
router.get('/:id', optionalProtect, getPublicPropertyById);
router.get('/:id/3d-experience', get3DExperience);

// Owner / Media routes
router.post('/owner', protect, authorize('owner', 'admin'), ownerCreateProperty);

router.get(
  '/owner/my-properties',
  protect,
  authorize('owner', 'admin'),
  ownerGetMyProperties
);

router.put(
  '/owner/:id',
  protect,
  authorize('owner', 'admin'),
  ownerUpdateProperty
);

router.delete(
  '/owner/:id',
  protect,
  authorize('owner', 'admin'),
  ownerDeleteProperty
);

router.post('/:id/media', protect, updateCategorizedMedia);

router.post(
  '/:id/3d-experience/process',
  protect,
  process3DExperience
);

router.put(
  '/:id/3d-experience/review',
  protect,
  authorize('broker', 'admin'),
  review3DExperience
);

// Media upload endpoint - Cloudinary
router.post('/upload', protect, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file',
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    }));

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully to Cloudinary',
      files: uploadedFiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
