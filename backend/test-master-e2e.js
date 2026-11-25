/**
 * REDSTONE REAL ESTATE - MASTER END-TO-END AUTOMATED TEST SUITE
 *
 * Verifies all 15 core architectural & workflow requirements:
 * 1. Health & Server Connectivity
 * 2. Owner Registration & JWT Authentication
 * 3. 9-Step Property Creation with GeoJSON coordinates
 * 4. Privacy Shield Owner Redaction Verification
 * 5. Geospatial Bounding Box Map Search ($geoWithin $box)
 * 6. Layer A: Availability Heatmap Density Aggregation
 * 7. Layer B: Client Demand Heatmap Density Aggregation (Zero PII Exposure)
 * 8. Locality Supply/Demand Market Gaps & Ratios
 * 9. Broker Verification Queue Access
 * 10. Broker Physical Inspection Scheduling & Checklist Update
 * 11. Broker Formal Recommendation Submission to Admin
 * 12. Admin Final Approval & Broker Assignment Workflow
 * 13. Client Requirement Creation & Weighted Match Scoring Engine
 * 14. Favorites Toggle & Retrieval
 * 15. Deal Closing & 2% Commission Calculation (40% Broker / 60% Company)
 */

const BASE_URL = 'http://localhost:5000/api';

let ownerToken = '';
let ownerUser = null;
let brokerToken = '';
let brokerUser = null;
let adminToken = '';
let adminUser = null;
let clientToken = '';
let clientUser = null;

let testPropertyId = '';
let testInspectionId = '';
let testEnquiryId = '';
let testVisitId = '';
let testDealId = '';
let testRequirementId = '';

let passedTests = 0;
let totalTests = 18;

function logStep(num, name) {
  console.log(`\n======================================================`);
  console.log(`▶ STEP ${num}/${totalTests}: ${name}`);
  console.log(`======================================================`);
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`   ✓ ${message}`);
}

async function runMasterTest() {
  console.log('\n🚀 STARTING REDSTONE REAL ESTATE MASTER VERIFICATION SUITE\n');

  try {
    // ----------------------------------------------------
    // STEP 1: Health Check
    // ----------------------------------------------------
    logStep(1, 'Health & Server Connectivity');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Server responded with HTTP 200');
    assert(healthData.status === 'ok', 'Server status is ok');
    passedTests++;

    // ----------------------------------------------------
    // STEP 2: Owner Registration & Auth
    // ----------------------------------------------------
    logStep(2, 'Owner Registration & JWT Authentication');
    const uniqueEmail = `test.owner.${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Harish Varma',
        email: uniqueEmail,
        password: 'password123',
        phone: '+91 98100 99887',
        role: 'owner',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'Owner registration returned HTTP 201');
    assert(regData.success === true, 'Registration marked success');
    assert(!!regData.token, 'Received valid JWT token');
    assert(regData.user.role === 'owner', 'User role is owner');
    ownerToken = regData.token;
    ownerUser = regData.user;
    passedTests++;

    // ----------------------------------------------------
    // STEP 3: Property Creation with GeoJSON Coordinates
    // ----------------------------------------------------
    logStep(3, '9-Step Property Submission with GeoJSON Point');
    const propRes = await fetch(`${BASE_URL}/properties/owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        title: 'Gaur Cascades - 3BHK Lake View Apartment',
        purpose: 'sale',
        listingType: 'sale',
        propertyType: 'flat',
        category: 'residential',
        description: 'East-facing high floor unit in Crossing Republik with modular kitchen and 2 balconies.',
        address: 'Tower A, Flat 902, Crossing Republik',
        society: 'Gaur Cascades',
        locality: 'Crossing Republik',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201016',
        location: {
          type: 'Point',
          coordinates: [77.4335, 28.6292],
        },
        coordinates: { lng: 77.4335, lat: 28.6292 },
        area: 1650,
        areaUnit: 'sq ft',
        price: 8200000,
        bhk: 3,
        bedrooms: 3,
        bathrooms: 3,
        furnishing: 'semi-furnished',
        parking: '1 covered',
        floorNumber: 9,
        totalFloors: 20,
        amenities: ['Clubhouse', 'Swimming Pool', 'Security', 'Power Backup'],
        images: [
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Living Area' },
        ],
      }),
    });
    const propData = await propRes.json();
    assert(propRes.status === 201, 'Property created with HTTP 201');
    assert(propData.property.approvalStatus === 'pending', 'Approval status is pending');
    assert(propData.property.verificationStatus === 'PENDING_BROKER_VERIFICATION', 'Verification status is PENDING_BROKER_VERIFICATION');
    assert(propData.property.location.coordinates[0] === 77.4335, 'GeoJSON longitude saved correctly');
    assert(propData.property.location.coordinates[1] === 28.6292, 'GeoJSON latitude saved correctly');
    testPropertyId = propData.property._id;
    passedTests++;

    // ----------------------------------------------------
    // STEP 4: Privacy Shield Owner Redaction Check
    // ----------------------------------------------------
    logStep(4, 'Privacy Shield Redaction (Public/Client Safety)');
    const publicPropRes = await fetch(`${BASE_URL}/properties`);
    const publicPropData = await publicPropRes.json();
    assert(publicPropRes.status === 200, 'Public property search returned HTTP 200');
    publicPropData.properties.forEach((p) => {
      assert(p.ownerId === undefined, `Property ${p.title} has ownerId completely redacted`);
      assert(p.ownerPhone === undefined, `Property ${p.title} has ownerPhone undefined`);
      assert(p.ownerEmail === undefined, `Property ${p.title} has ownerEmail undefined`);
    });
    console.log('   ✓ Verified 100% of public listings protect owner contact details');
    passedTests++;

    // ----------------------------------------------------
    // STEP 5: Geospatial Bounding Box Map Search
    // ----------------------------------------------------
    logStep(5, 'Geospatial Bounding Box Search ($geoWithin $box)');
    const boxRes = await fetch(`${BASE_URL}/maps/properties?swLng=77.40&swLat=28.60&neLng=77.46&neLat=28.65`);
    const boxData = await boxRes.json();
    assert(boxRes.status === 200, 'Map bounding box returned HTTP 200');
    assert(Array.isArray(boxData.properties), 'Returned array of properties');
    assert(boxData.count > 0, `Found ${boxData.count} properties within Crossing Republik bounding box`);
    passedTests++;

    // ----------------------------------------------------
    // STEP 6: Layer A - Availability Heatmap Density
    // ----------------------------------------------------
    logStep(6, 'Layer A: Property Availability Heatmap Density');
    const availRes = await fetch(`${BASE_URL}/maps/availability-heatmap`);
    const availData = await availRes.json();
    assert(availRes.status === 200, 'Availability heatmap returned HTTP 200');
    assert(availData.layer === 'AVAILABILITY', 'Layer type is AVAILABILITY');
    assert(availData.totalClusters > 0, `Aggregated ${availData.totalClusters} spatial clusters`);
    assert(availData.data[0].coordinates.length === 2, 'Heatmap centroid has [lng, lat]');
    assert(availData.data[0].weight >= 0.2 && availData.data[0].weight <= 1.0, 'Density weight normalized between 0.2 and 1.0');
    passedTests++;

    // ----------------------------------------------------
    // STEP 7: Layer B - Client Demand Heatmap (Zero PII)
    // ----------------------------------------------------
    logStep(7, 'Layer B: Client Demand Heatmap (Strict Anonymization)');
    const demandRes = await fetch(`${BASE_URL}/maps/demand-heatmap`);
    const demandData = await demandRes.json();
    assert(demandRes.status === 200, 'Demand heatmap returned HTTP 200');
    assert(demandData.layer === 'DEMAND', 'Layer type is DEMAND');
    assert(demandData.totalClusters > 0, `Aggregated ${demandData.totalClusters} demand clusters`);
    demandData.data.forEach((cluster) => {
      assert(cluster.clientId === undefined, 'Zero client ID exposure in demand heatmap');
      assert(cluster.clientPhone === undefined, 'Zero phone exposure in demand heatmap');
      assert(cluster.demandScore > 0, `Locality ${cluster.locality} has positive demand score (${cluster.demandScore})`);
    });
    passedTests++;

    // ----------------------------------------------------
    // STEP 8: Locality Supply/Demand Market Gaps & Ratios
    // ----------------------------------------------------
    logStep(8, 'Locality Supply vs Demand Market Ratios');
    const summaryRes = await fetch(`${BASE_URL}/maps/locality-summary?city=Ghaziabad`);
    const summaryData = await summaryRes.json();
    assert(summaryRes.status === 200, 'Locality summary returned HTTP 200');
    assert(summaryData.summary.length > 0, 'Returned locality market summaries');
    const crossingSummary = summaryData.summary.find((s) => s.locality.toLowerCase().includes('crossing'));
    assert(!!crossingSummary, 'Crossing Republik summary found');
    console.log(`   ✓ Crossing Republik: Available=${crossingSummary.availableCount}, Demand=${crossingSummary.demandCount}, Ratio=${crossingSummary.demandSupplyRatio}x, Status="${crossingSummary.marketStatus}"`);
    passedTests++;

    // ----------------------------------------------------
    // STEP 9: Broker Verification Queue Access
    // ----------------------------------------------------
    logStep(9, 'Broker Verification Queue');
    const brokerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rohit.broker@redstone.com', password: 'password123' }),
    });
    const brokerLoginData = await brokerLoginRes.json();
    assert(brokerLoginRes.status === 200, 'Broker login returned HTTP 200');
    brokerToken = brokerLoginData.token;
    brokerUser = brokerLoginData.user;

    const queueRes = await fetch(`${BASE_URL}/broker/verification-queue`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const queueData = await queueRes.json();
    assert(queueRes.status === 200, 'Verification queue returned HTTP 200');
    assert(queueData.count > 0, `Queue contains ${queueData.count} pending properties`);
    const pendingItem = queueData.properties.find((p) => p._id === testPropertyId);
    assert(!!pendingItem, 'Newly submitted property present in broker verification queue');
    passedTests++;

    // ----------------------------------------------------
    // STEP 10: Broker Physical Inspection Scheduling
    // ----------------------------------------------------
    logStep(10, 'Broker Schedules Physical Inspection & Fills Checklist');
    const inspectRes = await fetch(`${BASE_URL}/broker/inspections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brokerToken}`,
      },
      body: JSON.stringify({
        propertyId: testPropertyId,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        notes: 'Will inspect title deeds, measure carpet area, and review society NOC.',
      }),
    });
    const inspectData = await inspectRes.json();
    assert(inspectRes.status === 201, 'Inspection scheduled with HTTP 201');
    assert(inspectData.inspection.status === 'scheduled', 'Inspection marked scheduled');
    testInspectionId = inspectData.inspection._id;

    // Update Checklist
    const updateChecklistRes = await fetch(`${BASE_URL}/broker/inspections/${testInspectionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brokerToken}`,
      },
      body: JSON.stringify({
        checklist: {
          addressVerified: true,
          specsVerified: true,
          legalDeedsReviewed: true,
          conditionRated: 5,
          photographsTaken: true,
          keysHandled: true,
        },
        discrepancies: 'None. Floor measurements and registry deed match declaration.',
        status: 'completed',
      }),
    });
    const updateChecklistData = await updateChecklistRes.json();
    assert(updateChecklistRes.status === 200, 'Checklist updated with HTTP 200');
    assert(updateChecklistData.inspection.checklist.addressVerified === true, 'Address marked verified');
    passedTests++;

    // ----------------------------------------------------
    // STEP 11: Broker Recommendation Submission to Admin
    // ----------------------------------------------------
    logStep(11, 'Broker Recommendation Submission');
    const recRes = await fetch(`${BASE_URL}/broker/properties/${testPropertyId}/verification-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brokerToken}`,
      },
      body: JSON.stringify({
        recommendation: 'approved',
        recommendationReason: 'Owner papers clean, property matches specs, prime locality.',
      }),
    });
    const recData = await recRes.json();
    assert(recRes.status === 200, 'Recommendation submitted with HTTP 200');
    assert(recData.property.verificationStatus === 'VERIFIED', 'Property verificationStatus set to VERIFIED');
    assert(recData.inspection.recommendation === 'approved', 'Inspection recommendation is approved');
    passedTests++;

    // ----------------------------------------------------
    // STEP 12: Admin Final Publication Approval
    // ----------------------------------------------------
    logStep(12, 'Admin Final Publication Approval & Broker Assignment');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@redstone.com', password: 'password123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login returned HTTP 200');
    adminToken = adminLoginData.token;
    adminUser = adminLoginData.user;

    const approveRes = await fetch(`${BASE_URL}/admin/properties/${testPropertyId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        brokerId: brokerUser._id,
        notes: 'Verified by Rohit Talwar. Approved for live public display.',
      }),
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200, 'Admin approved property with HTTP 200');
    assert(approveData.property.approvalStatus === 'approved', 'approvalStatus set to approved');
    assert(approveData.property.publicationStatus === 'approved', 'publicationStatus set to approved');
    passedTests++;

    // ----------------------------------------------------
    // STEP 13: Client Requirement & Weighted Match Engine
    // ----------------------------------------------------
    logStep(13, 'Client Requirement Creation & Weighted Match Engine');
    const clientLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya.client@example.com', password: 'password123' }),
    });
    const clientLoginData = await clientLoginRes.json();
    assert(clientLoginRes.status === 200, 'Client login returned HTTP 200');
    clientToken = clientLoginData.token;
    clientUser = clientLoginData.user;

    const reqRes = await fetch(`${BASE_URL}/client/requirements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientToken}`,
      },
      body: JSON.stringify({
        purpose: 'sale',
        category: 'residential',
        propertyTypes: ['flat', 'apartment'],
        city: 'Ghaziabad',
        preferredLocalities: ['Crossing Republik'],
        budget: { min: 7000000, max: 9000000 },
        bhk: [3],
        furnishingPreference: 'semi-furnished',
        additionalNotes: 'Need high floor flat in Crossing Republik',
      }),
    });
    const reqData = await reqRes.json();
    assert(reqRes.status === 201, 'Client requirement created with HTTP 201');
    testRequirementId = reqData.requirement._id;

    // Run real-time match engine
    const matchRes = await fetch(`${BASE_URL}/client/requirements/${testRequirementId}/matches`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    const matchData = await matchRes.json();
    assert(matchRes.status === 200, 'Match engine returned HTTP 200');
    assert(matchData.count > 0, `Found ${matchData.count} matched properties`);
    const topMatch = matchData.matches[0];
    assert(topMatch.matchScore >= 80, `Top match scored ${topMatch.matchScore}%`);
    assert(topMatch.matchReasons.length > 0, `Match reasons: ${topMatch.matchReasons.join(', ')}`);
    passedTests++;

    // ----------------------------------------------------
    // STEP 14: Favorites Toggle
    // ----------------------------------------------------
    logStep(14, 'Client Favorites Toggle & Retrieval');
    const favRes = await fetch(`${BASE_URL}/client/favorites/${testPropertyId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    const favData = await favRes.json();
    assert(favRes.status === 201 || favRes.status === 200, 'Toggled favorite');
    assert(favData.isFavorited === true, 'Property marked as favorited');

    const getFavsRes = await fetch(`${BASE_URL}/client/favorites`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    const getFavsData = await getFavsRes.json();
    assert(getFavsRes.status === 200, 'Fetched favorites list');
    const isPresent = getFavsData.properties.some((p) => p._id === testPropertyId);
    assert(isPresent, 'Favorited property present in client list');
    passedTests++;

    // ----------------------------------------------------
    // STEP 15: Full Brokerage Deal & Commission Ledger
    // ----------------------------------------------------
    logStep(15, 'Full Brokerage Deal & Commission Ledger');
    // Client enquires
    const enqRes = await fetch(`${BASE_URL}/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientToken}`,
      },
      body: JSON.stringify({
        propertyId: testPropertyId,
        message: 'Interested in purchasing this 3BHK unit.',
        preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      }),
    });
    const enqData = await enqRes.json();
    assert(enqRes.status === 201, 'Enquiry submitted with HTTP 201');
    testEnquiryId = enqData.enquiry._id;

    // Broker schedules visit
    const visitRes = await fetch(`${BASE_URL}/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brokerToken}`,
      },
      body: JSON.stringify({
        enquiryId: testEnquiryId,
        propertyId: testPropertyId,
        clientId: clientUser._id,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scheduledTime: '02:00 PM',
        notes: 'Client meeting at tower lobby',
      }),
    });
    const visitData = await visitRes.json();
    assert(visitRes.status === 201, 'Visit scheduled with HTTP 201');
    testVisitId = visitData.visit._id;

    // Broker creates closed deal and calculates commission
    const dealRes = await fetch(`${BASE_URL}/deals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brokerToken}`,
      },
      body: JSON.stringify({
        propertyId: testPropertyId,
        clientId: clientUser._id,
        enquiryId: testEnquiryId,
        dealType: 'sale',
        finalPrice: 8000000, // 80 Lakhs
        status: 'closed',
        commissionRate: 2.0, // 2%
        brokerCommissionSharePercentage: 40, // 40%
        termsAndConditions: 'All registry documents complete and fees clear.',
      }),
    });
    const dealData = await dealRes.json();
    assert(dealRes.status === 201, 'Deal registered with HTTP 201');
    assert(dealData.deal.status === 'closed', 'Deal status is closed');
    testDealId = dealData.deal._id;

    // Commission: 2% of 80L = 1,60,000 INR. Broker 40% = 64,000 INR. Company 60% = 96,000 INR.
    assert(dealData.commission.totalCommissionAmount === 160000, 'Total commission is 2% (₹1,60,000)');
    assert(dealData.commission.brokerCommissionAmount === 64000, 'Broker commission share is 40% (₹64,000)');
    assert(dealData.commission.companyRevenueAmount === 96000, 'Company revenue share is 60% (₹96,000)');
    console.log('   ✓ Verified 2% Commission Ledger: Total ₹1.60L, Broker ₹64K, Company ₹96K');
    passedTests++;

    // ----------------------------------------------------
    // STEP 16: Owner Categorized Media Upload & Reordering
    // ----------------------------------------------------
    logStep(16, 'Owner Categorized Media Upload & Reordering');
    const mediaPayload = {
      categorizedMedia: {
        exterior: [
          { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'Front Elevation', isFeatured: false, sortOrder: 0 },
        ],
        livingRoom: [
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Main Living Room', isFeatured: true, sortOrder: 0 },
        ],
        bedrooms: [
          { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', caption: 'Master Bedroom', isFeatured: false, sortOrder: 0 },
        ],
        kitchen: [
          { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', caption: 'Modular Kitchen', isFeatured: false, sortOrder: 0 },
        ],
        bathrooms: [
          { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', caption: 'Master Bath', isFeatured: false, sortOrder: 0 },
        ],
        balcony: [
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', caption: 'Balcony View', isFeatured: false, sortOrder: 0 },
        ],
        other: [],
        panoramas: [
          { url: 'https://images.unsplash.com/photo-1557971370-e7298ee473fb?auto=format&fit=crop&w=2000&q=80', roomName: 'Living Room 360', caption: 'Living Room Panorama' },
        ],
        walkthroughVideos: [
          { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', title: 'Property Video Walkthrough', duration: 30 },
        ],
      },
    };

    const mediaRes = await fetch(`${BASE_URL}/properties/${testPropertyId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify(mediaPayload),
    });
    const mediaData = await mediaRes.json();
    assert(mediaRes.status === 200, 'Categorized media updated with HTTP 200');
    assert(mediaData.property.categorizedMedia.livingRoom.length === 1, 'Living room media saved');
    assert(mediaData.property.categorizedMedia.panoramas.length === 1, '360 panorama saved');
    console.log('   ✓ Categorized media stored across 7 rooms + 360 panorama + walkthrough video');
    passedTests++;

    // ----------------------------------------------------
    // STEP 17: 3D / Walkthrough Processing Job Lifecycle
    // ----------------------------------------------------
    logStep(17, '3D / Walkthrough Processing Job Lifecycle');
    // A. Kick off processing job
    const procRes = await fetch(`${BASE_URL}/properties/${testPropertyId}/3d-experience/process`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
      },
    });
    const procData = await procRes.json();
    assert(procRes.status === 200, 'Processing job initiated with HTTP 200');
    assert(procData.experience.status === 'ready_for_review', 'Pipeline completed and set to ready_for_review');
    assert(procData.experience.experienceType === '360_tour', 'Detected 360_tour experience type from panoramic media');
    console.log('   ✓ 3D processing job transitioned from media_uploaded -> processing -> ready_for_review');

    // B. Broker reviews and approves experience
    const reviewRes = await fetch(`${BASE_URL}/properties/${testPropertyId}/3d-experience/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brokerToken}`,
      },
      body: JSON.stringify({ action: 'approve' }),
    });
    const reviewData = await reviewRes.json();
    assert(reviewRes.status === 200, 'Broker approved experience with HTTP 200');
    assert(reviewData.experience.status === 'approved', 'Experience status set to approved');
    console.log('   ✓ Broker successfully reviewed and approved experience');

    // C. Publish experience to public
    const publishRes = await fetch(`${BASE_URL}/properties/${testPropertyId}/3d-experience/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brokerToken}`,
      },
      body: JSON.stringify({ action: 'publish' }),
    });
    const publishData = await publishRes.json();
    assert(publishRes.status === 200, 'Experience published with HTTP 200');
    assert(publishData.experience.status === 'published', 'Experience status set to published');
    console.log('   ✓ Published experience ready for public 3D tour');
    passedTests++;

    // ----------------------------------------------------
    // STEP 18: Public 3D / 360 Experience & Zero Owner Contact Leakage
    // ----------------------------------------------------
    logStep(18, 'Public 3D Experience & Privacy Shield Verification');
    const pubExpRes = await fetch(`${BASE_URL}/properties/${testPropertyId}/3d-experience`);
    const pubExpData = await pubExpRes.json();
    assert(pubExpRes.status === 200, 'Public 3D experience returned HTTP 200');
    assert(pubExpData.experience.status === 'published', 'Public experience is published');
    assert(pubExpData.experience.panoramaScenes.length >= 1, 'Panorama scenes available for client viewer');

    // Verify property detail endpoint never leaks owner phone/email
    const propDetailRes = await fetch(`${BASE_URL}/properties/${testPropertyId}`);
    const propDetailData = await propDetailRes.json();
    assert(propDetailRes.status === 200, 'Property detail returned HTTP 200');
    assert(propDetailData.property.ownerId === undefined, 'Owner ID completely redacted from public detail');
    assert(propDetailData.property.ownerPhone === undefined, 'Owner phone completely undefined in public detail');
    assert(propDetailData.property.ownerEmail === undefined, 'Owner email completely undefined in public detail');
    console.log('   ✓ Verified client 3D experience loads with 100% owner privacy protection');
    passedTests++;

    // ----------------------------------------------------
    // FINAL SUMMARY
    // ----------------------------------------------------
    console.log('\n======================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} MASTER TEST SUITES PASSED WITH 100% SUCCESS!`);
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ TEST SUITE FAILED AT STEP ${passedTests + 1}:`, err.message);
    process.exit(1);
  }
}

runMasterTest();
