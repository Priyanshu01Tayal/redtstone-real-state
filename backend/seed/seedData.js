const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');
const BrokerAssignment = require('../models/BrokerAssignment');
const Enquiry = require('../models/Enquiry');
const Visit = require('../models/Visit');
const FollowUp = require('../models/FollowUp');
const Deal = require('../models/Deal');
const Commission = require('../models/Commission');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Inspection = require('../models/Inspection');
const ClientRequirement = require('../models/ClientRequirement');
const BusinessSettings = require('../models/BusinessSettings');
const Favorite = require('../models/Favorite');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Property.deleteMany({}),
      BrokerAssignment.deleteMany({}),
      Enquiry.deleteMany({}),
      Visit.deleteMany({}),
      FollowUp.deleteMany({}),
      Deal.deleteMany({}),
      Commission.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Inspection.deleteMany({}),
      ClientRequirement.deleteMany({}),
      BusinessSettings.deleteMany({}),
      Favorite.deleteMany({}),
    ]);

    console.log('[Seed] Seeding Business Settings...');
    await BusinessSettings.create({
      defaultCommissionRate: 2.0,
      brokerCommissionSharePercentage: 40.0,
      demandHeatmapThreshold: 1,
      strictOwnerPrivacyShield: true,
      companyName: 'Redstone Real Estate Brokerage Ltd.',
      contactPhone: '+91 98110 00001',
      contactEmail: 'contact@redstone.com',
      headquarters: 'Tower 4, Expressway Commercial Hub, Sector 62, Noida, UP, India',
      supportedLocalities: [
        { name: 'Crossing Republik', city: 'Ghaziabad', center: { type: 'Point', coordinates: [77.433, 28.629] } },
        { name: 'Indirapuram', city: 'Ghaziabad', center: { type: 'Point', coordinates: [77.371, 28.6415] } },
        { name: 'Raj Nagar Extension', city: 'Ghaziabad', center: { type: 'Point', coordinates: [77.447, 28.709] } },
        { name: 'Sector 62', city: 'Noida', center: { type: 'Point', coordinates: [77.362, 28.625] } },
        { name: 'Noida Expressway', city: 'Noida', center: { type: 'Point', coordinates: [77.385, 28.535] } },
        { name: 'Greater Noida West', city: 'Greater Noida', center: { type: 'Point', coordinates: [77.452, 28.583] } },
        { name: 'Golf Course Road', city: 'Gurgaon', center: { type: 'Point', coordinates: [77.098, 28.4595] } },
      ],
    });

    console.log('[Seed] Seeding Users...');
    const users = await User.create([
      // Admin
      {
        name: 'Devraj Chauhan (Director)',
        email: 'admin@redstone.com',
        password: 'password123',
        phone: '+91 98110 00001',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        bio: 'Managing Director & Principal Broker at RedStone Brokerage. 18+ years of real estate transactions.',
      },
      // In-House Brokers
      {
        name: 'Vikram Singhania',
        email: 'vikram.broker@redstone.com',
        password: 'password123',
        phone: '+91 98201 11223',
        role: 'broker',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'Senior Luxury Real Estate Consultant with 9 years of excellence in high-end residential sales and investor portfolios.',
        licenseNumber: 'DL-REA-2021-9872',
        experienceYears: 9,
        specialization: ['Luxury Apartments', 'Golf Villas', 'Penthouses'],
        serviceAreas: ['Golf Course Road, Gurgaon', 'South Delhi', 'Noida Expressway', 'Indirapuram'],
        rating: 4.9,
        dealsCount: 42,
      },
      {
        name: 'Ananya Deshmukh',
        email: 'ananya.broker@redstone.com',
        password: 'password123',
        phone: '+91 98332 44556',
        role: 'broker',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        bio: 'Head of Commercial Leasing & Retail Acquisitions. Specializing in Grade-A IT parks, retail showrooms, and corporate relocations.',
        licenseNumber: 'HR-REA-2022-4412',
        experienceYears: 7,
        specialization: ['Commercial Offices', 'High Street Retail', 'Co-working Assets'],
        serviceAreas: ['Sector 62, Noida', 'Cyber City, Gurgaon', 'Crossing Republik'],
        rating: 4.8,
        dealsCount: 35,
      },
      {
        name: 'Rohit Talwar',
        email: 'rohit.broker@redstone.com',
        password: 'password123',
        phone: '+91 98711 77889',
        role: 'broker',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        bio: 'Residential & Plotted Development Specialist. Helping HNI clients acquire family residences and plots.',
        licenseNumber: 'UP-REA-2023-1092',
        experienceYears: 6,
        specialization: ['Residential Plots', 'High-Rise Condos', 'Builder Floors'],
        serviceAreas: ['Crossing Republik', 'Indirapuram', 'Raj Nagar Extension', 'Greater Noida West'],
        rating: 4.7,
        dealsCount: 28,
      },
      // Property Owners
      {
        name: 'Amit Sharma',
        email: 'amit.owner@example.com',
        password: 'password123',
        phone: '+91 98102 33445',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        bio: 'Real estate investor with residential properties in Delhi NCR.',
      },
      {
        name: 'Sunita Verma',
        email: 'sunita.owner@example.com',
        password: 'password123',
        phone: '+91 98765 43210',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        bio: 'Property owner and developer of boutique residences.',
      },
      {
        name: 'Rajesh Goel',
        email: 'rajesh.owner@example.com',
        password: 'password123',
        phone: '+91 99100 22334',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
        bio: 'Commercial developer and retail space owner in business hubs.',
      },
      // Clients
      {
        name: 'Priya Menon',
        email: 'priya.client@example.com',
        password: 'password123',
        phone: '+91 97110 55667',
        role: 'client',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        bio: 'Tech entrepreneur seeking a modern 3BHK flat in NCR.',
      },
      {
        name: 'Karan Malhotra',
        email: 'karan.client@example.com',
        password: 'password123',
        phone: '+91 98188 66778',
        role: 'client',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        bio: 'Corporate executive looking for premium office/retail space.',
      },
      {
        name: 'Neha Kapoor',
        email: 'neha.client@example.com',
        password: 'password123',
        phone: '+91 99223 88990',
        role: 'client',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Family looking for ready-to-move apartment in Crossing Republik or Indirapuram.',
      },
    ]);

    const admin = users[0];
    const broker1 = users[1]; // Vikram
    const broker2 = users[2]; // Ananya
    const broker3 = users[3]; // Rohit
    const owner1 = users[4];  // Amit
    const owner2 = users[5];  // Sunita
    const owner3 = users[6];  // Rajesh
    const client1 = users[7]; // Priya
    const client2 = users[8]; // Karan
    const client3 = users[9]; // Neha

    console.log('[Seed] Seeding Properties with GeoJSON Coordinates...');

    const properties = await Property.create([
      // 1. Crossing Republik - 3BHK Apartment (Approved, Assigned to Rohit)
      {
        title: 'Panchsheel Wellington - Premium 3BHK High-Rise with Club View',
        purpose: 'sale',
        listingType: 'sale',
        propertyType: 'flat',
        category: 'residential',
        description: 'Exquisite 3BHK flat on 12th floor facing expansive landscaped central park and clubhouse in Crossing Republik. Fully modern wooden modular kitchen, false ceilings with concealed LED lighting, wooden laminate in master bedroom, and two spacious balconies.',
        address: 'Tower 5, Flat 1204, Crossing Republik Township, NH-24',
        society: 'Panchsheel Wellington',
        locality: 'Crossing Republik',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201016',
        location: {
          type: 'Point',
          coordinates: [77.433, 28.629],
        },
        coordinates: { lng: 77.433, lat: 28.629 },
        area: 1750,
        areaUnit: 'sq ft',
        price: 8800000,
        deposit: 0,
        maintenanceCharges: 3500,
        bhk: 3,
        bedrooms: 3,
        bathrooms: 3,
        balconies: 2,
        furnishing: 'semi-furnished',
        parking: '1 covered',
        floorNumber: 12,
        totalFloors: 22,
        facing: 'East',
        ageOfProperty: '1-5_years',
        availability: 'immediate',
        amenities: ['Clubhouse', 'Swimming Pool', 'Gym', 'Security', 'Power Backup', 'Lift', 'Visitor Parking', 'CCTV', 'Vastu Compliant'],
        images: [
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', isFeatured: true, caption: 'Park View Living Room', category: 'livingRoom' },
          { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', isFeatured: false, caption: 'Master Bedroom', category: 'bedrooms' },
          { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', isFeatured: false, caption: 'Designer Modular Kitchen', category: 'kitchen' },
          { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', isFeatured: false, caption: 'Luxury Bathroom', category: 'bathrooms' },
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', isFeatured: false, caption: 'Skyline Terrace Balcony', category: 'balcony' },
        ],
        categorizedMedia: {
          exterior: [
            { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'High-Rise Tower Elevation', sortOrder: 0 },
          ],
          livingRoom: [
            { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Spacious Hall & Dining', sortOrder: 1 },
          ],
          bedrooms: [
            { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', caption: 'Master Suite with Wood Finish', sortOrder: 2 },
          ],
          kitchen: [
            { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', caption: 'Modular Kitchen with Hob', sortOrder: 3 },
          ],
          bathrooms: [
            { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', caption: 'Glass Enclosure Bath', sortOrder: 4 },
          ],
          balcony: [
            { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', caption: 'Lake View Sit-out Balcony', sortOrder: 5 },
          ],
          other: [],
          panoramas: [
            { url: 'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg', roomName: 'Drawing Hall 360°', caption: '360° Flat Living Room & Balcony' },
            { url: 'https://pannellum.org/images/alma.jpg', roomName: 'Master Bedroom 360°', caption: '360° Master Suite' },
            { url: 'https://pannellum.org/images/lascar.jpg', roomName: 'Society Balcony 360°', caption: '360° Lake-Facing Balcony' },
          ],
          walkthroughVideos: [
            { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', title: 'Full 4K Property Walkthrough', duration: 45 },
          ],
        },
        threeDExperience: {
          status: 'published',
          experienceType: '360_tour',
          panoramaScenes: [
            { roomId: 'scene_living', roomName: 'Living Room 360°', panoramaUrl: 'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg', caption: 'Spacious 360° Lake-Facing Drawing Hall' },
            { roomId: 'scene_bedroom', roomName: 'Master Suite 360°', panoramaUrl: 'https://pannellum.org/images/alma.jpg', caption: 'Master Suite with Attached Balcony & Dressing Area' },
            { roomId: 'scene_balcony', roomName: 'Society Balcony 360°', panoramaUrl: 'https://pannellum.org/images/lascar.jpg', caption: 'High-Rise Balcony Overlooking Central Greens' },
          ],
          walkthroughRooms: [
            { roomId: 'room_1', roomName: 'Living Room', category: 'livingRoom', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80', caption: 'Spacious Living Room with False Ceiling & Cove Lighting' },
            { roomId: 'room_2', roomName: 'Master Bedroom', category: 'bedrooms', imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80', caption: 'Master Bedroom with Wooden Floor Finish & Wardrobes' },
            { roomId: 'room_3', roomName: 'Modular Kitchen', category: 'kitchen', imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80', caption: 'L-Shaped Modular Kitchen with Hob & Chimney' },
            { roomId: 'room_4', roomName: 'Balcony View', category: 'balcony', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80', caption: 'Park View Sit-Out Balcony' },
            { roomId: 'room_5', roomName: 'Designer Bathroom', category: 'bathrooms', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80', caption: 'Modern Glass Enclosure Bath with Branded Fittings' },
          ],
          publishedAt: new Date(),
        },
        ownerId: owner1._id,
        assignedBrokerId: broker3._id,
        approvalStatus: 'approved',
        publicationStatus: 'approved',
        verificationStatus: 'VERIFIED',
        listingStatus: 'active',
        availabilityStatus: 'available',
        featured: true,
        viewsCount: 420,
        enquiriesCount: 18,
        visitsCount: 9,
      },

      // 2. Indirapuram - Luxury 4BHK Builder Floor (Approved, Assigned to Vikram)
      {
        title: 'Ahinsa Khand 2 - Luxury 4BHK Independent Builder Floor with Terrace',
        purpose: 'sale',
        listingType: 'sale',
        propertyType: 'independent_house',
        category: 'residential',
        description: 'Brand new construction luxury 4-bedroom builder floor in Ahinsa Khand 2, Indirapuram. Italian marble flooring, individual private lift, dedicated stilt car parking for 2 SUVs, modular kitchen with chimney and hob, and walking distance to metro station.',
        address: 'Plot 88, Ahinsa Khand 2, Near Swarn Jayanti Park',
        locality: 'Indirapuram',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201014',
        location: {
          type: 'Point',
          coordinates: [77.371, 28.6415],
        },
        coordinates: { lng: 77.371, lat: 28.6415 },
        area: 2400,
        areaUnit: 'sq ft',
        price: 19500000,
        deposit: 0,
        maintenanceCharges: 2000,
        bhk: 4,
        bedrooms: 4,
        bathrooms: 4,
        balconies: 3,
        furnishing: 'fully-furnished',
        parking: '2 covered',
        floorNumber: 2,
        totalFloors: 4,
        facing: 'North-East',
        ageOfProperty: 'new_construction',
        availability: 'immediate',
        amenities: ['Lift', 'Security', 'Power Backup', 'CCTV', 'Reserved Parking', 'Vastu Compliant', 'Intercom'],
        images: [
          { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', isFeatured: true, caption: 'Italian Marble Hall' },
          { url: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80', isFeatured: false, caption: 'German Kitchen' },
        ],
        threeDExperience: {
          status: 'published',
          experienceType: '360_tour',
          panoramaScenes: [
            { roomId: 'scene_living', roomName: 'Italian Living Hall 360°', panoramaUrl: 'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg', caption: 'Spacious 4BHK Grand Living Hall with Italian Marble Flooring' },
            { roomId: 'scene_bedroom', roomName: 'Master Bedroom 360°', panoramaUrl: 'https://pannellum.org/images/alma.jpg', caption: 'Master Suite with Attached Luxury Washroom' },
            { roomId: 'scene_balcony', roomName: 'Green View Balcony 360°', panoramaUrl: 'https://pannellum.org/images/lascar.jpg', caption: 'Private Floor Sit-Out Balcony' },
          ],
          walkthroughRooms: [
            { roomId: 'room_1', roomName: 'Grand Living Hall', category: 'livingRoom', imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80', caption: 'Italian Marble Living Hall with Designer False Ceiling' },
            { roomId: 'room_2', roomName: 'German Modular Kitchen', category: 'kitchen', imageUrl: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1600&q=80', caption: 'German Modular Kitchen with Built-in Oven & Island Counter' },
            { roomId: 'room_3', roomName: 'Master Bedroom Suite', category: 'bedrooms', imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80', caption: 'Master Bedroom with Wooden Floor and Dresser' },
          ],
          publishedAt: new Date(),
        },
        ownerId: owner2._id,
        assignedBrokerId: broker1._id,
        approvalStatus: 'approved',
        publicationStatus: 'approved',
        verificationStatus: 'VERIFIED',
        listingStatus: 'active',
        availabilityStatus: 'available',
        featured: true,
        viewsCount: 310,
        enquiriesCount: 15,
        visitsCount: 7,
      },

      // 3. Crossing Republik - 2BHK Apartment for Rent (Approved, Assigned to Rohit)
      {
        title: 'Paramount Symphony - Furnished 2BHK High-Rise for Rent',
        purpose: 'rent',
        listingType: 'rent',
        propertyType: 'flat',
        category: 'residential',
        description: 'Bright and airy 2BHK flat for lease in Paramount Symphony, Crossing Republik. Includes double beds with mattresses, 3-seater sofa, dining table, refrigerator, washing machine, and RO purifier. Ready for immediate move-in.',
        address: 'Tower B, Flat 802, Crossing Republik',
        locality: 'Crossing Republik',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201016',
        location: {
          type: 'Point',
          coordinates: [77.436, 28.627],
        },
        coordinates: { lng: 77.436, lat: 28.627 },
        area: 1100,
        areaUnit: 'sq ft',
        price: 24000,
        deposit: 48000,
        maintenanceCharges: 2200,
        bhk: 2,
        bedrooms: 2,
        bathrooms: 2,
        balconies: 2,
        furnishing: 'fully-furnished',
        parking: '1 covered',
        floorNumber: 8,
        totalFloors: 24,
        facing: 'North',
        ageOfProperty: '1-5_years',
        availability: 'immediate',
        amenities: ['Clubhouse', 'Swimming Pool', 'Gym', 'Security', 'Power Backup', 'Lift'],
        images: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', isFeatured: true, caption: 'Furnished Living Room' },
          { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', isFeatured: false, caption: 'Cozy Bedroom' },
        ],
        threeDExperience: {
          status: 'published',
          experienceType: '360_tour',
          panoramaScenes: [
            { roomId: 'scene_living', roomName: 'Furnished Hall 360°', panoramaUrl: 'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg', caption: 'Furnished 2BHK Hall with Sofa & TV Unit' },
            { roomId: 'scene_bedroom', roomName: 'Bedroom 360°', panoramaUrl: 'https://pannellum.org/images/alma.jpg', caption: 'Bed with Mattress and Double Wardrobe' },
          ],
          walkthroughRooms: [
            { roomId: 'room_1', roomName: 'Furnished Living Room', category: 'livingRoom', imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80', caption: 'Furnished Living Room with Dining Space' },
            { roomId: 'room_2', roomName: 'Cozy Bedroom', category: 'bedrooms', imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=80', caption: 'Cozy Bedroom with Ambient Lighting' },
          ],
          publishedAt: new Date(),
        },
        ownerId: owner1._id,
        assignedBrokerId: broker3._id,
        approvalStatus: 'approved',
        publicationStatus: 'approved',
        verificationStatus: 'VERIFIED',
        listingStatus: 'active',
        availabilityStatus: 'available',
        featured: false,
        viewsCount: 195,
        enquiriesCount: 12,
        visitsCount: 6,
      },

      // 4. Sector 62, Noida - Grade A Commercial IT Office (Approved, Assigned to Ananya)
      {
        title: 'Stellar IT Park - Furnished Corporate Office Suite',
        purpose: 'rent',
        listingType: 'rent',
        propertyType: 'office',
        category: 'commercial',
        description: 'Grade-A fully plug-and-play IT office suite in Sector 62, Noida. 50 linear workstations, 3 executive director cabins, 1 boardroom (12 seater), pantry, and reception desk. 100% 2N power backup and multi-tier security.',
        address: 'Tower 2, 4th Floor, Stellar IT Park, C-25, Sector 62',
        locality: 'Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201309',
        location: {
          type: 'Point',
          coordinates: [77.362, 28.625],
        },
        coordinates: { lng: 77.362, lat: 28.625 },
        area: 3800,
        areaUnit: 'sq ft',
        price: 266000,
        deposit: 798000,
        maintenanceCharges: 45600,
        bhk: 0,
        bedrooms: 0,
        bathrooms: 4,
        balconies: 0,
        furnishing: 'fully-furnished',
        parking: 'multiple',
        floorNumber: 4,
        totalFloors: 14,
        facing: 'East',
        ageOfProperty: '1-5_years',
        availability: 'immediate',
        amenities: ['Power Backup', 'Lift', 'Security', 'CCTV', 'Fire Fighting System', 'Reserved Parking', 'Visitor Parking'],
        images: [
          { url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80', isFeatured: true, caption: 'Office Open Workstations' },
          { url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80', isFeatured: false, caption: 'Boardroom' },
        ],
        ownerId: owner3._id,
        assignedBrokerId: broker2._id,
        approvalStatus: 'approved',
        publicationStatus: 'approved',
        verificationStatus: 'VERIFIED',
        listingStatus: 'active',
        availabilityStatus: 'available',
        featured: true,
        viewsCount: 280,
        enquiriesCount: 11,
        visitsCount: 5,
      },

      // 5. Raj Nagar Extension - 3BHK Gated Apartment (Approved, Assigned to Rohit)
      {
        title: 'SCC Sapphire - Modern 3BHK with Highway Connectivity',
        purpose: 'sale',
        listingType: 'sale',
        propertyType: 'apartment',
        category: 'residential',
        description: 'Vastu compliant 3BHK flat on 6th floor in Raj Nagar Extension. Close to proposed Hindon elevated road and metro corridor. Well-appointed master suite, modular fittings, and covered basement parking.',
        address: 'Tower A, Flat 603, Raj Nagar Extension',
        locality: 'Raj Nagar Extension',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201017',
        location: {
          type: 'Point',
          coordinates: [77.447, 28.709],
        },
        coordinates: { lng: 77.447, lat: 28.709 },
        area: 1425,
        areaUnit: 'sq ft',
        price: 6800000,
        deposit: 0,
        maintenanceCharges: 2500,
        bhk: 3,
        bedrooms: 3,
        bathrooms: 2,
        balconies: 2,
        furnishing: 'semi-furnished',
        parking: '1 covered',
        floorNumber: 6,
        totalFloors: 18,
        facing: 'East',
        ageOfProperty: '0-1_years',
        availability: 'immediate',
        amenities: ['Clubhouse', 'Gym', 'Security', 'Power Backup', 'Lift', 'Vastu Compliant', 'CCTV'],
        images: [
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', isFeatured: true, caption: 'Living Area' },
        ],
        ownerId: owner1._id,
        assignedBrokerId: broker3._id,
        approvalStatus: 'approved',
        publicationStatus: 'approved',
        verificationStatus: 'VERIFIED',
        listingStatus: 'active',
        availabilityStatus: 'available',
        featured: false,
        viewsCount: 160,
        enquiriesCount: 7,
        visitsCount: 4,
      },

      // 6. Golf Course Road, Gurgaon - Ultra Luxury 4BHK (Approved, Assigned to Vikram)
      {
        title: 'The Camellias Grandeur - Ultra Luxury Golf Course Residence',
        purpose: 'sale',
        listingType: 'sale',
        propertyType: 'apartment',
        category: 'residential',
        description: 'Spectacular 4-bedroom luxury condominium with panoramic lake and golf course views. Expansive Italian marble living spaces, VRV central AC, German Poggenpohl kitchen appliances, and private elevator vestibule.',
        address: 'Tower B, 14th Floor, Sector 42, Golf Course Road',
        locality: 'Golf Course Road',
        city: 'Gurgaon',
        state: 'Haryana',
        pincode: '122002',
        location: {
          type: 'Point',
          coordinates: [77.098, 28.4595],
        },
        coordinates: { lng: 77.098, lat: 28.4595 },
        area: 4250,
        areaUnit: 'sq ft',
        price: 58500000,
        deposit: 0,
        maintenanceCharges: 18000,
        bhk: 4,
        bedrooms: 4,
        bathrooms: 5,
        balconies: 3,
        furnishing: 'fully-furnished',
        parking: '2 covered',
        floorNumber: 14,
        totalFloors: 28,
        facing: 'North-East',
        ageOfProperty: '0-1_years',
        availability: 'immediate',
        amenities: ['Clubhouse', 'Swimming Pool', 'Gym', 'Security', 'Power Backup', 'Lift', 'Visitor Parking', 'CCTV', 'Vastu Compliant', 'Intercom'],
        images: [
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', isFeatured: true, caption: 'Grandeur Living' },
          { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', isFeatured: false, caption: 'Golf View Master Suite' },
        ],
        ownerId: owner1._id,
        assignedBrokerId: broker1._id,
        approvalStatus: 'approved',
        publicationStatus: 'approved',
        verificationStatus: 'VERIFIED',
        listingStatus: 'active',
        availabilityStatus: 'available',
        featured: true,
        viewsCount: 520,
        enquiriesCount: 22,
        visitsCount: 14,
      },

      // 7. PENDING VERIFICATION Property - In Indirapuram (Submitted by Sunita, Awaiting Broker Verification)
      {
        title: 'Windsor Park - 3BHK High Floor with Modular Kitchen',
        purpose: 'sale',
        listingType: 'sale',
        propertyType: 'flat',
        category: 'residential',
        description: 'Spacious 3BHK corner unit in Windsor Park, Vaibhav Khand, Indirapuram. High ceiling, 3 attached baths, modular kitchen with quartz countertop. Awaiting physical inspection by Redstone broker.',
        address: 'Tower Aspen, Flat 1401, Vaibhav Khand',
        locality: 'Indirapuram',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201014',
        location: {
          type: 'Point',
          coordinates: [77.375, 28.638],
        },
        coordinates: { lng: 77.375, lat: 28.638 },
        area: 1650,
        areaUnit: 'sq ft',
        price: 13500000,
        deposit: 0,
        maintenanceCharges: 3200,
        bhk: 3,
        bedrooms: 3,
        bathrooms: 3,
        balconies: 2,
        furnishing: 'semi-furnished',
        parking: '1 covered',
        floorNumber: 14,
        totalFloors: 16,
        facing: 'East',
        ageOfProperty: '1-5_years',
        availability: 'immediate',
        amenities: ['Clubhouse', 'Swimming Pool', 'Gym', 'Security', 'Power Backup', 'Lift'],
        images: [
          { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', isFeatured: true, caption: 'Front Balcony' },
        ],
        ownerId: owner2._id,
        approvalStatus: 'pending',
        publicationStatus: 'pending_approval',
        verificationStatus: 'PENDING_BROKER_VERIFICATION',
        listingStatus: 'active',
        availabilityStatus: 'available',
        featured: false,
        viewsCount: 18,
        enquiriesCount: 0,
        visitsCount: 0,
      },

      // 8. INSPECTION COMPLETED Property - In Crossing Republik (Recommended for Approval by Broker Rohit)
      {
        title: 'GH-7 Crossings - 2BHK High-Rise Garden Facing',
        purpose: 'sale',
        listingType: 'sale',
        propertyType: 'flat',
        category: 'residential',
        description: 'Well-maintained 2BHK apartment in GH-7 Crossing Republik. Inspected and verified by broker Rohit Talwar. Recommended for admin approval.',
        address: 'Tower D, Flat 502, GH-7, Crossing Republik',
        locality: 'Crossing Republik',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201016',
        location: {
          type: 'Point',
          coordinates: [77.434, 28.631],
        },
        coordinates: { lng: 77.434, lat: 28.631 },
        area: 1050,
        areaUnit: 'sq ft',
        price: 5500000,
        deposit: 0,
        maintenanceCharges: 1800,
        bhk: 2,
        bedrooms: 2,
        bathrooms: 2,
        balconies: 2,
        furnishing: 'semi-furnished',
        parking: '1 covered',
        floorNumber: 5,
        totalFloors: 14,
        facing: 'North-East',
        ageOfProperty: '1-5_years',
        availability: 'immediate',
        amenities: ['Security', 'Power Backup', 'Lift', 'Vastu Compliant', 'CCTV'],
        images: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', isFeatured: true, caption: 'Main Hall' },
        ],
        ownerId: owner1._id,
        assignedBrokerId: broker3._id,
        approvalStatus: 'pending',
        publicationStatus: 'pending_approval',
        verificationStatus: 'INSPECTION_COMPLETED',
        listingStatus: 'active',
        availabilityStatus: 'available',
        featured: false,
        viewsCount: 25,
        enquiriesCount: 0,
        visitsCount: 0,
      },
    ]);

    const prop1 = properties[0]; // Crossing 3BHK
    const prop2 = properties[1]; // Indirapuram 4BHK
    const prop3 = properties[2]; // Crossing 2BHK Rent
    const prop4 = properties[3]; // Sector 62 Office
    const prop5 = properties[4]; // Raj Nagar Ext 3BHK
    const prop6 = properties[5]; // Golf Course Road
    const prop7 = properties[6]; // Pending verification Indirapuram
    const prop8 = properties[7]; // Inspection completed Crossing

    console.log('[Seed] Seeding Broker Inspections...');
    const inspection = await Inspection.create({
      propertyId: prop8._id,
      brokerId: broker3._id,
      ownerId: owner1._id,
      scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      inspectionDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'completed',
      checklist: {
        addressVerified: true,
        specsVerified: true,
        legalDeedsReviewed: true,
        conditionRated: 5,
        photographsTaken: true,
        keysHandled: true,
      },
      discrepancies: 'None. Floor measurements and registry deed match declaration.',
      inspectionNotes: 'Spacious well-ventilated apartment. Excellent maintenance and society security.',
      inspectionPhotos: [
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', caption: 'Verified living hall' },
      ],
      recommendation: 'approved',
      recommendationReason: 'Clean property papers, prompt owner cooperation, high market appeal.',
      submittedToAdminAt: new Date(),
    });

    prop8.inspectionId = inspection._id;
    await prop8.save();

    console.log('[Seed] Seeding Client Requirements (for Demand Heatmap & Matching)...');
    await ClientRequirement.create([
      // Requirement 1: Priya looking for 3BHK in Crossing Republik
      {
        clientId: client1._id,
        purpose: 'sale',
        category: 'residential',
        propertyTypes: ['flat', 'apartment'],
        city: 'Ghaziabad',
        preferredLocalities: ['Crossing Republik'],
        location: {
          type: 'Point',
          coordinates: [77.433, 28.629],
        },
        searchRadius: 5000,
        budget: { min: 7000000, max: 9500000 },
        area: { min: 1400, max: 2000, unit: 'sq ft' },
        bhk: [3],
        furnishingPreference: 'semi-furnished',
        amenitiesPreference: ['Clubhouse', 'Swimming Pool', 'Security'],
        moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        contactPreference: 'phone',
        additionalNotes: 'Looking for a high floor flat facing park or clubhouse.',
        matchedProperties: [
          { propertyId: prop1._id, matchScore: 94 },
          { propertyId: prop5._id, matchScore: 78 },
        ],
      },

      // Requirement 2: Neha looking for 4BHK builder floor or villa in Indirapuram
      {
        clientId: client3._id,
        purpose: 'sale',
        category: 'residential',
        propertyTypes: ['independent_house', 'villa', 'builder_floor'],
        city: 'Ghaziabad',
        preferredLocalities: ['Indirapuram'],
        location: {
          type: 'Point',
          coordinates: [77.371, 28.6415],
        },
        searchRadius: 4000,
        budget: { min: 15000000, max: 22000000 },
        area: { min: 2000, max: 3000, unit: 'sq ft' },
        bhk: [4],
        furnishingPreference: 'any',
        amenitiesPreference: ['Lift', 'Security', 'Power Backup'],
        status: 'active',
        contactPreference: 'whatsapp',
        additionalNotes: 'Ready funds, prefer independent floor with lift and stilt car parking.',
        matchedProperties: [{ propertyId: prop2._id, matchScore: 98 }],
      },

      // Requirement 3: Client looking for 2BHK rental in Crossing Republik
      {
        clientId: client1._id,
        purpose: 'rent',
        category: 'residential',
        propertyTypes: ['flat', 'apartment'],
        city: 'Ghaziabad',
        preferredLocalities: ['Crossing Republik'],
        location: {
          type: 'Point',
          coordinates: [77.436, 28.627],
        },
        searchRadius: 3000,
        budget: { min: 20000, max: 30000 },
        bhk: [2],
        furnishingPreference: 'fully-furnished',
        status: 'active',
        contactPreference: 'phone',
        matchedProperties: [{ propertyId: prop3._id, matchScore: 96 }],
      },

      // Requirement 4: Commercial corporate client looking in Sector 62, Noida
      {
        clientId: client2._id,
        purpose: 'rent',
        category: 'commercial',
        propertyTypes: ['office'],
        city: 'Noida',
        preferredLocalities: ['Sector 62'],
        location: {
          type: 'Point',
          coordinates: [77.362, 28.625],
        },
        searchRadius: 5000,
        budget: { min: 200000, max: 350000 },
        area: { min: 3000, max: 5000, unit: 'sq ft' },
        furnishingPreference: 'fully-furnished',
        status: 'active',
        contactPreference: 'email',
        matchedProperties: [{ propertyId: prop4._id, matchScore: 95 }],
      },

      // Requirement 5: Budget family seeking flat in Raj Nagar Extension
      {
        clientId: client3._id,
        purpose: 'sale',
        category: 'residential',
        propertyTypes: ['apartment', 'flat'],
        city: 'Ghaziabad',
        preferredLocalities: ['Raj Nagar Extension'],
        location: {
          type: 'Point',
          coordinates: [77.447, 28.709],
        },
        searchRadius: 6000,
        budget: { min: 5000000, max: 7500000 },
        bhk: [2, 3],
        status: 'active',
        contactPreference: 'phone',
        matchedProperties: [{ propertyId: prop5._id, matchScore: 92 }],
      },
    ]);

    console.log('[Seed] Seeding Favorites...');
    await Favorite.create([
      { userId: client1._id, propertyId: prop1._id },
      { userId: client1._id, propertyId: prop2._id },
      { userId: client3._id, propertyId: prop1._id },
    ]);

    console.log('[Seed] Seeding Broker Assignments...');
    await BrokerAssignment.create([
      {
        propertyId: prop1._id,
        brokerId: broker3._id,
        assignedBy: admin._id,
        status: 'active',
        notes: 'Assigned based on Crossing Republik territory specialization.',
      },
      {
        propertyId: prop2._id,
        brokerId: broker1._id,
        assignedBy: admin._id,
        status: 'active',
        notes: 'Assigned for luxury residential expertise.',
      },
      {
        propertyId: prop4._id,
        brokerId: broker2._id,
        assignedBy: admin._id,
        status: 'active',
        notes: 'Assigned for commercial office specialization.',
      },
    ]);

    console.log('[Seed] Seeding Enquiries...');
    const enquiries = await Enquiry.create([
      {
        propertyId: prop1._id,
        clientId: client1._id,
        clientName: client1.name,
        clientEmail: client1.email,
        clientPhone: client1.phone,
        ownerId: owner1._id,
        brokerId: broker3._id,
        message: 'Hello, I am interested in this 3BHK in Panchsheel Wellington. Would like to know maintenance costs and visit this Saturday.',
        preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        preferredTimeSlot: '11:00 AM - 01:00 PM',
        status: 'visit_requested',
        internalBrokerNotes: 'Priya is a pre-approved home loan applicant. High buyer intent.',
      },
      {
        propertyId: prop2._id,
        clientId: client3._id,
        clientName: client3.name,
        clientEmail: client3.email,
        clientPhone: client3.phone,
        ownerId: owner2._id,
        brokerId: broker1._id,
        message: 'Interested in this builder floor in Ahinsa Khand 2. Please coordinate visit with broker.',
        status: 'contacted',
        internalBrokerNotes: 'Spoke with Neha. She will visit with her family on Sunday afternoon.',
      },
    ]);

    console.log('[Seed] Seeding Visits...');
    const visits = await Visit.create([
      {
        enquiryId: enquiries[0]._id,
        propertyId: prop1._id,
        clientId: client1._id,
        brokerId: broker3._id,
        ownerId: owner1._id,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scheduledTime: '11:30 AM',
        status: 'Confirmed',
        ownerNotified: true,
        ownerConfirmed: true,
        brokerNotes: 'Client will be accompanied by spouse. Meeting at Panchsheel Wellington Tower 5 lobby.',
      },
      {
        enquiryId: enquiries[1]._id,
        propertyId: prop2._id,
        clientId: client3._id,
        brokerId: broker1._id,
        ownerId: owner2._id,
        scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        scheduledTime: '03:30 PM',
        status: 'Scheduled',
        ownerNotified: true,
        ownerConfirmed: false,
        brokerNotes: 'Awaiting owner confirmation for Sunday afternoon slot.',
      },
    ]);

    console.log('[Seed] Seeding Completed Deal and Commission...');
    const closedDeal = await Deal.create({
      propertyId: prop6._id,
      clientId: client1._id,
      brokerId: broker1._id,
      ownerId: owner1._id,
      dealType: 'sale',
      finalPrice: 58000000, // 5.80 Cr
      agreementDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      closingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'closed',
      termsAndConditions: 'All registry stamp duty, society transfer fee, and NOC clear.',
    });

    // 2% total commission = 11,60,000 INR
    // 40% broker share = 4,64,000 INR
    // 60% company brokerage = 6,96,000 INR
    await Commission.create({
      dealId: closedDeal._id,
      propertyId: prop6._id,
      brokerId: broker1._id,
      propertyValue: 58000000,
      commissionType: 'percentage',
      commissionRate: 2.0,
      totalCommissionAmount: 1160000,
      commissionPayer: 'both',
      buyerCommissionShare: 580000,
      sellerCommissionShare: 580000,
      brokerCommissionSharePercentage: 40,
      brokerCommissionAmount: 464000,
      companyRevenueAmount: 696000,
      paymentStatus: 'paid',
      paidAmount: 1160000,
      paymentDate: new Date(),
      paymentReference: 'NEFT-REDSTONE-TXN99281',
      notes: 'Commission successfully collected and broker share disbursed.',
    });

    console.log('[Seed] Seeding Notifications...');
    await Notification.create([
      {
        recipientId: owner1._id,
        title: 'New Property Enquiry',
        message: 'Your property in Crossing Republik ("Panchsheel Wellington - Premium 3BHK") received a new enquiry. Assigned broker Rohit Talwar is handling it.',
        type: 'enquiry',
        relatedEntity: { entityType: 'Property', entityId: prop1._id },
        isRead: false,
      },
      {
        recipientId: owner1._id,
        title: 'Property Visit Confirmed',
        message: 'Your property visit for "Panchsheel Wellington" has been scheduled for tomorrow at 11:30 AM.',
        type: 'visit_scheduled',
        relatedEntity: { entityType: 'Visit', entityId: visits[0]._id },
        isRead: true,
      },
      {
        recipientId: broker3._id,
        title: 'New Client Enquiry Received',
        message: 'Priya Menon submitted an enquiry for Panchsheel Wellington.',
        type: 'enquiry',
        relatedEntity: { entityType: 'Enquiry', entityId: enquiries[0]._id },
        isRead: false,
      },
      {
        recipientId: client1._id,
        title: 'Visit Confirmed by Broker & Owner',
        message: 'Your visit for Panchsheel Wellington has been confirmed for tomorrow at 11:30 AM. Broker Rohit Talwar will meet you at the lobby.',
        type: 'visit_confirmed',
        relatedEntity: { entityType: 'Visit', entityId: visits[0]._id },
        isRead: false,
      },
      {
        recipientId: admin._id,
        title: 'New Verification Recommendation',
        message: 'Broker Rohit Talwar completed inspection and recommended approval for "GH-7 Crossings - 2BHK High-Rise Garden Facing".',
        type: 'property_status',
        relatedEntity: { entityType: 'Property', entityId: prop8._id },
        isRead: false,
      },
    ]);

    console.log('[Seed] Seeding Audit Logs...');
    await AuditLog.create([
      {
        userId: admin._id,
        userRole: 'admin',
        action: 'SYSTEM_SEEDED',
        resourceType: 'System',
        details: { message: 'Initial platform master data and NCR coordinates generated' },
      },
    ]);

    console.log('\n======================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(' Demo credentials:');
    console.log(' - Admin:   admin@redstone.com        / password123');
    console.log(' - Broker:  vikram.broker@redstone.com / password123');
    console.log(' - Broker:  rohit.broker@redstone.com  / password123');
    console.log(' - Owner:   amit.owner@example.com    / password123');
    console.log(' - Client:  priya.client@example.com  / password123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
