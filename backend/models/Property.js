const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide property title'],
      trim: true,
      maxlength: 180,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    purpose: {
      type: String,
      enum: ['sale', 'rent', 'pg', 'lease'],
      default: 'sale',
      index: true,
    },
    listingType: {
      type: String,
      enum: ['sale', 'rent', 'pg', 'lease'],
      default: 'sale',
      index: true,
    },
    propertyType: {
      type: String,
      enum: [
        'flat',
        'apartment',
        'independent_house',
        'villa',
        'builder_floor',
        'pg',
        'hostel',
        'shop',
        'office',
        'showroom',
        'warehouse',
        'commercial_building',
        'industrial',
        'agricultural_land',
        'residential_plot',
        'commercial_plot',
        'farmhouse',
      ],
      required: [true, 'Property type is required'],
      index: true,
    },
    category: {
      type: String,
      enum: ['residential', 'commercial', 'land'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed description'],
    },
    // Location Details
    address: {
      type: String,
      required: true,
    },
    streetAddress: {
      type: String,
      default: '',
    },
    society: {
      type: String,
      default: '',
    },
    locality: {
      type: String,
      required: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    pincode: {
      type: String,
      required: true,
    },
    // GeoJSON Point location for 2dsphere indexing and spatial queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [77.3653, 28.628],
      },
    },
    // Legacy coordinate object compatibility
    coordinates: {
      lat: { type: Number, default: 28.628 },
      lng: { type: Number, default: 77.3653 },
    },
    // Area & Price Details
    area: {
      type: Number,
      required: [true, 'Area is required'],
    },
    builtUpArea: {
      type: Number,
    },
    carpetArea: {
      type: Number,
    },
    plotArea: {
      type: Number,
    },
    areaUnit: {
      type: String,
      enum: ['sq ft', 'sq yd', 'acre'],
      default: 'sq ft',
    },
    price: {
      type: Number,
      required: [true, 'Price / Rent amount is required'],
      index: true,
    },
    deposit: {
      type: Number,
      default: 0,
    },
    maintenanceCharges: {
      type: Number,
      default: 0,
    },
    brokerageTerms: {
      type: String,
      default: 'Standard 2% brokerage on sale / 1 month rent on lease',
    },
    pricePerSqFt: {
      type: Number,
    },
    negotiable: {
      type: Boolean,
      default: true,
    },
    // Specifications (Dynamic based on property type)
    bhk: {
      type: Number,
      default: 0,
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    balconies: {
      type: Number,
      default: 0,
    },
    furnishing: {
      type: String,
      enum: ['unfurnished', 'semi-furnished', 'fully-furnished', 'not-applicable'],
      default: 'unfurnished',
    },
    parking: {
      type: String,
      enum: ['none', '1 covered', '2 covered', 'open', 'multiple'],
      default: '1 covered',
    },
    floorNumber: {
      type: Number,
      default: 1,
    },
    totalFloors: {
      type: Number,
      default: 4,
    },
    facing: {
      type: String,
      enum: ['North', 'East', 'South', 'West', 'North-East', 'North-West', 'South-East', 'South-West'],
      default: 'East',
    },
    ageOfProperty: {
      type: String,
      enum: ['new_construction', '0-1_years', '1-5_years', '5-10_years', '10+_years'],
      default: '0-1_years',
    },
    availability: {
      type: String,
      enum: ['immediate', 'within_15_days', 'within_30_days', 'after_30_days'],
      default: 'immediate',
    },
    ownerRequirements: {
      type: String,
      default: '',
    },
    expectedPrice: {
      type: Number,
    },
    // Amenities
    amenities: {
      type: [String],
      default: [],
    },
    // Media
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        caption: { type: String, default: '' },
        category: { type: String, default: 'other' },
        isFeatured: { type: Boolean, default: false },
        isPanorama: { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    videos: [
      {
        url: { type: String, required: true },
        title: { type: String, default: '' },
        duration: { type: Number, default: 0 },
      },
    ],
    floorPlanUrl: {
      type: String,
      default: '',
    },
    // Organized categorized property media
    categorizedMedia: {
      exterior: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: 'Exterior View' },
          isFeatured: { type: Boolean, default: false },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      livingRoom: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: 'Living Room' },
          isPanorama: { type: Boolean, default: false },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      bedrooms: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: 'Bedroom' },
          isPanorama: { type: Boolean, default: false },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      kitchen: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: 'Kitchen' },
          isPanorama: { type: Boolean, default: false },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      bathrooms: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: 'Bathroom' },
          isPanorama: { type: Boolean, default: false },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      balcony: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: 'Balcony' },
          isPanorama: { type: Boolean, default: false },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      other: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: 'Other Area' },
          isPanorama: { type: Boolean, default: false },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      walkthroughVideos: [
        {
          url: { type: String, required: true },
          title: { type: String, default: 'Property Walkthrough Video' },
          duration: { type: Number, default: 0 },
        },
      ],
      panoramas: [
        {
          url: { type: String, required: true },
          roomName: { type: String, default: 'Living Room' },
          caption: { type: String, default: '360 Panorama' },
        },
      ],
    },
    // Interactive 3D / 360° / Photo Walkthrough Experience Job Lifecycle
    threeDExperience: {
      status: {
        type: String,
        enum: [
          'not_requested',
          'media_uploaded',
          'processing',
          'processing_failed',
          'ready_for_review',
          'approved',
          'published',
        ],
        default: 'not_requested',
        index: true,
      },
      experienceType: {
        type: String,
        enum: ['none', 'photo_walkthrough', '360_tour', '3d_mesh', 'gaussian_splat'],
        default: 'none',
      },
      modelUrl: {
        type: String,
        default: '',
      },
      panoramaScenes: [
        {
          roomId: { type: String },
          roomName: { type: String },
          panoramaUrl: { type: String, required: true },
          caption: { type: String, default: '' },
          yaw: { type: Number, default: 0 },
          pitch: { type: Number, default: 0 },
        },
      ],
      walkthroughRooms: [
        {
          roomId: { type: String },
          roomName: { type: String },
          category: { type: String },
          imageUrl: { type: String, required: true },
          caption: { type: String, default: '' },
        },
      ],
      processingJobId: {
        type: String,
      },
      processingError: {
        type: String,
        default: '',
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: {
        type: Date,
      },
      publishedAt: {
        type: Date,
      },
    },
    // Ownership
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedBrokerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // Verification & Inspection Workflow
    verificationStatus: {
      type: String,
      enum: [
        'PENDING_BROKER_VERIFICATION',
        'CONTACTING_OWNER',
        'INSPECTION_SCHEDULED',
        'INSPECTION_COMPLETED',
        'VERIFIED',
        'REJECTED',
      ],
      default: 'PENDING_BROKER_VERIFICATION',
      index: true,
    },
    inspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection',
    },
    // Publication & Approval Status
    publicationStatus: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'rejected', 'suspended', 'unlisted'],
      default: 'pending_approval',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    // Availability & Deal Status
    availabilityStatus: {
      type: String,
      enum: ['available', 'under_negotiation', 'sold', 'rented', 'leased', 'inactive'],
      default: 'available',
      index: true,
    },
    listingStatus: {
      type: String,
      enum: ['active', 'under_negotiation', 'sold', 'rented', 'inactive'],
      default: 'active',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Analytics
    viewsCount: {
      type: Number,
      default: 0,
    },
    enquiriesCount: {
      type: Number,
      default: 0,
    },
    visitsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save synchronization hook
propertySchema.pre('save', function (next) {
  // Sync listingType and purpose
  if (this.purpose && !this.listingType) {
    this.listingType = this.purpose;
  } else if (this.listingType && !this.purpose) {
    this.purpose = this.listingType;
  }

  // Calculate pricePerSqFt
  if (this.price && this.area && this.area > 0) {
    this.pricePerSqFt = Math.round(this.price / this.area);
  }

  // Ensure GeoJSON location and coordinates lat/lng are in sync
  if (this.coordinates && this.coordinates.lng && this.coordinates.lat) {
    if (!this.location || !this.location.coordinates || this.location.coordinates.length < 2) {
      this.location = {
        type: 'Point',
        coordinates: [this.coordinates.lng, this.coordinates.lat],
      };
    } else {
      this.location.coordinates = [this.coordinates.lng, this.coordinates.lat];
    }
  } else if (this.location && this.location.coordinates && this.location.coordinates.length === 2) {
    this.coordinates = {
      lng: this.location.coordinates[0],
      lat: this.location.coordinates[1],
    };
  }

  // Category fallback
  if (!this.category) {
    if (['shop', 'office', 'showroom', 'warehouse', 'commercial_building', 'industrial', 'commercial_plot'].includes(this.propertyType)) {
      this.category = 'commercial';
    } else if (['agricultural_land', 'residential_plot'].includes(this.propertyType)) {
      this.category = 'land';
    } else {
      this.category = 'residential';
    }
  }

  // Keep approvalStatus and publicationStatus synchronized
  if (this.isModified('approvalStatus') && !this.isModified('publicationStatus')) {
    if (this.approvalStatus === 'approved') this.publicationStatus = 'approved';
    else if (this.approvalStatus === 'rejected') this.publicationStatus = 'rejected';
    else this.publicationStatus = 'pending_approval';
  } else if (this.isModified('publicationStatus') && !this.isModified('approvalStatus')) {
    if (this.publicationStatus === 'approved') this.approvalStatus = 'approved';
    else if (this.publicationStatus === 'rejected') this.approvalStatus = 'rejected';
    else this.approvalStatus = 'pending';
  }

  // Keep listingStatus and availabilityStatus synchronized
  if (this.isModified('availabilityStatus') && !this.isModified('listingStatus')) {
    if (this.availabilityStatus === 'available') this.listingStatus = 'active';
    else if (this.availabilityStatus === 'inactive') this.listingStatus = 'inactive';
    else if (this.availabilityStatus === 'sold') this.listingStatus = 'sold';
    else if (this.availabilityStatus === 'rented') this.listingStatus = 'rented';
  }

  next();
});

// Indexes
propertySchema.index({ location: '2dsphere' });
propertySchema.index({ city: 1, locality: 1, purpose: 1, propertyType: 1, price: 1, publicationStatus: 1 });
propertySchema.index({ approvalStatus: 1, listingStatus: 1 });
propertySchema.index({ title: 'text', locality: 'text', city: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);
