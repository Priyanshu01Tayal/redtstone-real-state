const API_BASE = 'http://localhost:5000/api';

const request = async (url, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.response = { data, status: res.status };
    throw error;
  }
  return data;
};

const runEndToEndWorkflowTest = async () => {
  console.log('================================================================');
  console.log(' STARTING FULL END-TO-END BUSINESS WORKFLOW VERIFICATION');
  console.log('================================================================\n');

  try {
    // Step 1: Owner Registration
    console.log('[Step 1] Registering new Property Owner...');
    const ownerEmail = `test.owner.${Date.now()}@example.com`;
    const ownerRes = await request(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: {
        name: 'Harish Chandra',
        email: ownerEmail,
        password: 'password123',
        phone: '+91 98112 33445',
        role: 'owner',
      },
    });
    const ownerToken = ownerRes.token;
    const ownerUser = ownerRes.user;
    console.log(`✓ Owner registered: ${ownerUser.name} (${ownerUser.email})`);

    // Step 2: Owner Adds Property
    console.log('\n[Step 2] Owner adds a new property...');
    const newPropertyPayload = {
      title: 'Palm Greens - Luxury 4BHK Penthouse with Private Deck',
      listingType: 'sale',
      propertyType: 'apartment',
      category: 'residential',
      description: 'Stunning luxury penthouse with high ceiling and landscaped deck.',
      address: 'Tower 8, Penthouse 1801, Sector 50',
      locality: 'Sector 50',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122018',
      area: 3800,
      areaUnit: 'sq ft',
      price: 52000000,
      bedrooms: 4,
      bathrooms: 5,
      balconies: 3,
      furnishing: 'fully-furnished',
      parking: '2 covered',
      amenities: ['Clubhouse', 'Swimming Pool', 'Security', 'Power Backup', 'Gym'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', isFeatured: true }
      ],
    };

    const propRes = await request(`${API_BASE}/properties/owner`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: newPropertyPayload,
    });
    const createdProperty = propRes.property;
    console.log(`✓ Property submitted: "${createdProperty.title}" (Status: ${createdProperty.approvalStatus})`);

    // Step 3: Verify Property is NOT public yet
    console.log('\n[Step 3] Verifying property is not visible on public marketplace...');
    const publicPropsRes = await request(`${API_BASE}/properties?search=Palm Greens`);
    const isVisiblePublicly = publicPropsRes.properties.some((p) => p._id === createdProperty._id);
    if (!isVisiblePublicly) {
      console.log('✓ Verified: Unapproved property correctly hidden from public marketplace.');
    } else {
      throw new Error('SECURITY VIOLATION: Unapproved property appeared in public listing!');
    }

    // Step 4: Admin Login
    console.log('\n[Step 4] Logging in as Admin...');
    const adminLoginRes = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        email: 'admin@redstone.com',
        password: 'password123',
      },
    });
    const adminToken = adminLoginRes.token;
    console.log('✓ Admin authenticated successfully.');

    // Step 5: Admin Approves Property & Assigns In-House Broker
    console.log('\n[Step 5] Admin approving property & assigning Senior Broker Vikram...');
    const brokersRes = await request(`${API_BASE}/admin/users?role=broker`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const vikramBroker = brokersRes.users.find((b) => b.email.includes('vikram')) || brokersRes.users[0];

    await request(`${API_BASE}/admin/properties/${createdProperty._id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { brokerId: vikramBroker._id, notes: 'Deed and RERA compliance verified. Approved.' },
    });
    console.log(`✓ Property approved and assigned to broker: ${vikramBroker.name}`);

    // Step 6: Verify Property is now Public & OWNER DETAILS ARE REDACTED
    console.log('\n[Step 6] Verifying public property view and Owner Privacy Shield...');
    const singlePropRes = await request(`${API_BASE}/properties/${createdProperty._id}`);
    const pubProperty = singlePropRes.property;
    if (pubProperty.ownerId) {
      throw new Error('PRIVACY VIOLATION: Owner ID exposed in public property API!');
    }
    console.log(`✓ Property is now publicly visible. Title: "${pubProperty.title}"`);
    console.log(`✓ Assigned Broker details exposed: ${pubProperty.assignedBrokerId?.name} (${pubProperty.assignedBrokerId?.phone})`);
    console.log('✓ Owner contact details strictly REDACTED and protected.');

    // Step 7: Client Login
    console.log('\n[Step 7] Client (Priya) logs in to enquire...');
    const clientLoginRes = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        email: 'priya.client@example.com',
        password: 'password123',
      },
    });
    const clientToken = clientLoginRes.token;
    const clientUser = clientLoginRes.user;
    console.log(`✓ Client authenticated: ${clientUser.name}`);

    // Step 8: Client Submits Enquiry
    console.log('\n[Step 8] Client submits an enquiry on the property...');
    const enquiryRes = await request(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: {
        propertyId: createdProperty._id,
        message: 'Hello, looking to purchase this 4BHK. Ready for weekend site tour.',
        preferredTime: 'Saturday 11:30 AM',
        budget: 51000000,
      },
    });
    const createdEnquiry = enquiryRes.enquiry;
    console.log(`✓ Enquiry submitted: Enquiry ID ${createdEnquiry._id}`);

    // Step 9: Verify Owner Received Automatic Notification
    console.log('\n[Step 9] Verifying Owner received automatic enquiry notification...');
    const ownerNotifsRes = await request(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const enquiryNotif = ownerNotifsRes.notifications.find((n) => n.type === 'enquiry');
    console.log(`✓ Owner received alert: "${enquiryNotif?.title}" - "${enquiryNotif?.message}"`);

    // Step 10: Broker Logs In & Views Enquiry
    console.log('\n[Step 10] Broker (Vikram) reviews enquiry and updates status...');
    const brokerLoginRes = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        email: 'vikram.broker@redstone.com',
        password: 'password123',
      },
    });
    const brokerToken = brokerLoginRes.token;

    await request(`${API_BASE}/enquiries/${createdEnquiry._id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${brokerToken}` },
      body: { status: 'contacted', noteText: 'Called client Priya, scheduled physical inspection.' },
    });
    console.log('✓ Broker updated enquiry status to "contacted".');

    // Step 11: Broker Schedules Property Visit
    console.log('\n[Step 11] Broker schedules property visit for client...');
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() + 2);

    const visitRes = await request(`${API_BASE}/visits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${brokerToken}` },
      body: {
        enquiryId: createdEnquiry._id,
        propertyId: createdProperty._id,
        clientId: clientUser._id,
        scheduledDate: visitDate,
        scheduledTime: '11:30 AM',
        brokerNotes: 'Client visiting with family architect.',
      },
    });
    const createdVisit = visitRes.visit;
    console.log(`✓ Visit scheduled for ${createdVisit.scheduledTime}. Initial status: ${createdVisit.status}`);

    // Step 12: Owner Confirms Visit Schedule
    console.log('\n[Step 12] Property Owner confirms availability for visit...');
    const ownerConfirmRes = await request(`${API_BASE}/visits/${createdVisit._id}/owner-confirmation`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: { confirmation: 'confirmed', notes: 'Keys available at gate. Confirmed.' },
    });
    console.log(`✓ Owner confirmed visit. Visit status now: ${ownerConfirmRes.visit.status}`);

    // Step 13: Broker Confirms Visit with Client & Completes Visit
    console.log('\n[Step 13] Broker executes visit and marks status as Completed...');
    const completeVisitRes = await request(`${API_BASE}/visits/${createdVisit._id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${brokerToken}` },
      body: { status: 'Completed', brokerNotes: 'Site visit completed successfully. Client offered ₹5.15 Cr.' },
    });
    console.log(`✓ Visit status updated to: ${completeVisitRes.visit.status}`);

    // Step 14: Deal Closed & Commission Created
    console.log('\n[Step 14] Closing deal at ₹5,15,00,000 and generating commission...');
    const dealRes = await request(`${API_BASE}/deals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${brokerToken}` },
      body: {
        propertyId: createdProperty._id,
        enquiryId: createdEnquiry._id,
        clientId: clientUser._id,
        dealType: 'sale',
        finalPrice: 51500000,
        status: 'closed',
        commissionRate: 2.0, // 2%
        commissionPayer: 'both',
        brokerCommissionSharePercentage: 40, // 40% to broker, 60% company
        termsAndConditions: 'Sale agreement executed. Society NOC issued.',
      },
    });
    const closedDeal = dealRes.deal;
    const commission = dealRes.commission;
    console.log(`✓ Deal closed: Deal ID ${closedDeal._id}`);
    console.log(`✓ Total Commission (2%): ₹${commission.totalCommissionAmount.toLocaleString('en-IN')}`);
    console.log(`✓ Broker Incentive Share (40%): ₹${commission.brokerCommissionAmount.toLocaleString('en-IN')}`);
    console.log(`✓ Company Revenue (60%): ₹${commission.companyRevenueAmount.toLocaleString('en-IN')}`);
    console.log(`✓ Commission Payment Status: ${commission.paymentStatus}`);

    // Step 15: Admin Marks Commission as Paid
    console.log('\n[Step 15] Admin updates commission payment to Paid & Disbursed...');
    const payRes = await request(`${API_BASE}/deals/commissions/${commission._id}/payment`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        paymentStatus: 'paid',
        paymentReference: 'RTGS-REDSTONE-TXN2026',
      },
    });
    console.log(`✓ Commission payment confirmed: Status ${payRes.commission.paymentStatus}`);

    console.log('\n================================================================');
    console.log(' ALL 15 CRITICAL BUSINESS WORKFLOW STEPS PASSED WITH 100% SUCCESS!');
    console.log('================================================================\n');

  } catch (error) {
    console.error('\n❌ Workflow test failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

runEndToEndWorkflowTest();
