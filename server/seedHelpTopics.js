const mongoose = require('mongoose');
const HelpTopic = require('./models/HelpTopic');
require('dotenv').config();

const helpTopicsData = [
  // Booking Issues
  {
    category: 'Booking Issues',
    question: 'My booking request is not showing up',
    answer: `Follow these steps to check your booking status:

1. **Check Your Booking Requests Page**
   - Go to "My Booking Requests" from your profile menu
   - Look for your recent requests with status indicators

2. **Refresh the Page**
   - Sometimes data takes a moment to sync
   - Try refreshing the page or logging out and back in

3. **Check Internet Connection**
   - Ensure you have a stable internet connection
   - Try switching between WiFi and mobile data

4. **Verify Booking Submission**
   - Make sure you clicked "Send Booking Request" button
   - Check if you received any confirmation message

If the issue persists, contact us via WhatsApp for immediate assistance.`,
    relatedKeywords: ['booking', 'request', 'not showing', 'missing', 'status', 'disappeared'],
    priority: 9
  },
  {
    category: 'Booking Issues',
    question: 'Owner is not responding to my booking request',
    answer: `Here's what you can do when an owner doesn't respond:

1. **Check Request Status**
   - Go to "My Booking Requests" to see current status
   - Pending requests may take 24-48 hours for response

2. **Send a Follow-up Message**
   - Add a polite message in your booking request
   - Mention your specific requirements clearly

3. **Try Alternative Contact**
   - Use the WhatsApp button on the property page
   - Call directly if phone number is provided

4. **Browse Similar Properties**
   - Look for other properties in the same area
   - Use our filters to find alternatives

5. **Contact Support**
   - If no response after 48 hours, contact our support team
   - We can help facilitate communication

Remember: Owners are usually responsive, but may be busy. Be patient and professional.`,
    relatedKeywords: ['owner', 'not responding', 'no response', 'contact', 'reply', 'communication'],
    priority: 8
  },
  {
    category: 'Booking Issues',
    question: 'Can I cancel my booking request?',
    answer: `Yes, you can cancel your booking request. Here's how:

1. **Cancel Pending Requests**
   - Go to "My Booking Requests" page
   - Find the request you want to cancel
   - Click the "Cancel Request" button

2. **Approved Bookings**
   - Contact the owner directly via WhatsApp/Call
   - Explain your situation politely
   - Most owners are understanding with valid reasons

3. **Booking Policies**
   - Check the property's cancellation policy
   - Some properties may have specific terms
   - Respect the owner's policies

4. **Get Confirmation**
   - Always get written confirmation of cancellation
   - Screenshot important conversations
   - Keep records for your reference

**Note:** Frequent cancellations may affect your booking credibility with owners.`,
    relatedKeywords: ['cancel', 'booking', 'request', 'refund', 'cancellation', 'policy'],
    priority: 7
  },

  // Login & Registration
  {
    category: 'Login & Registration',
    question: 'I forgot my password, how can I reset it?',
    answer: `To reset your password, follow these simple steps:

1. **Go to Login Page**
   - Click on "Login" from the main menu
   - Look for "Forgot Password?" link

2. **Enter Your Email**
   - Type the email address you used to register
   - Make sure it's spelled correctly

3. **Check Your Email**
   - Look for a password reset email from RoomRento
   - Check your spam/junk folder if not in inbox
   - Email may take 2-5 minutes to arrive

4. **Follow Email Instructions**
   - Click the reset link in the email
   - Create a new strong password
   - Confirm your new password

5. **Login with New Password**
   - Return to login page
   - Use your email and new password

**Still having trouble?** Contact us via WhatsApp and we'll help you manually reset your password.`,
    relatedKeywords: ['password', 'forgot', 'reset', 'login', 'email', 'account'],
    priority: 9
  },
  {
    category: 'Login & Registration',
    question: 'I cannot login to my account',
    answer: `Let's troubleshoot your login issue:

1. **Check Your Credentials**
   - Verify email address is correct
   - Ensure password is typed correctly
   - Check if Caps Lock is on

2. **Try Password Reset**
   - Click "Forgot Password?" on login page
   - Follow the reset instructions
   - Create a new password

3. **Clear Browser Data**
   - Clear cookies and cache
   - Try incognito/private browsing mode
   - Disable browser extensions temporarily

4. **Check Email Verification**
   - Make sure you verified your email during registration
   - Check inbox for verification email
   - Click the verification link if not done

5. **Try Different Browser/Device**
   - Test on different browser (Chrome, Firefox, Safari)
   - Try logging in from your mobile device
   - Check if the issue is browser-specific

If none of these work, contact our support team immediately.`,
    relatedKeywords: ['login', 'cannot', 'error', 'access', 'account', 'credentials', 'browser'],
    priority: 8
  },

  // Room Listing & Upload
  {
    category: 'Room Listing & Upload',
    question: 'How do I list my room/property on RoomRento?',
    answer: `Listing your property is easy! Follow these steps:

1. **Create Owner Account**
   - Register as an "Owner" during signup
   - If already registered as renter, contact support to upgrade

2. **Navigate to Add Property**
   - Click "Rentify" in the top menu
   - Choose property type: Room, Hotel, or Shop
   - Select "Add Room" for individual rooms

3. **Fill Property Details**
   - **Title**: Write descriptive title (e.g., "Furnished 1BHK near Metro")
   - **Description**: Detail amenities, rules, nearby facilities
   - **Location**: Enter complete address with landmarks
   - **Price**: Set monthly rent amount
   - **Type**: Choose room type (Single, Double, PG, etc.)

4. **Upload Photos**
   - Add 3-5 high-quality photos
   - Include room, bathroom, kitchen, building exterior
   - Good photos attract more bookings!

5. **Set Location on Map**
   - Use the map picker to mark exact location
   - This helps renters find your property easily

6. **Review and Publish**
   - Double-check all information
   - Click "List Property" to make it live

Your property will be visible to renters immediately after publishing!`,
    relatedKeywords: ['list', 'property', 'room', 'upload', 'add', 'owner', 'rentify'],
    priority: 8
  },
  {
    category: 'Room Listing & Upload',
    question: 'My property photos are not uploading',
    answer: `Photo upload issues can be resolved with these steps:

1. **Check Image Requirements**
   - File size: Maximum 10MB per image
   - Formats: JPG, JPEG, PNG, WebP only
   - Minimum resolution: 800x600 pixels

2. **Internet Connection**
   - Ensure stable internet connection
   - Large files need good upload speed
   - Try switching to WiFi if using mobile data

3. **Try Different Images**
   - Test with a smaller file size first
   - Compress images if they're very large
   - Use basic image editing apps to reduce size

4. **Browser Issues**
   - Clear browser cache and cookies
   - Try different browser (Chrome recommended)
   - Disable ad blockers temporarily
   - Enable JavaScript in browser settings

5. **Upload Tips**
   - Upload one image at a time
   - Wait for each upload to complete
   - Don't navigate away during upload

6. **Mobile App Alternative**
   - Try uploading from mobile device
   - Mobile cameras often have smaller file sizes

If uploads still fail, contact support and we'll help you manually upload photos.`,
    relatedKeywords: ['photos', 'upload', 'images', 'not working', 'error', 'size', 'format'],
    priority: 7
  },

  // Map or Location Problem
  {
    category: 'Map or Location Problem',
    question: 'Map is not loading or showing wrong location',
    answer: `Map issues can be fixed with these troubleshooting steps:

1. **Enable Location Services**
   - Allow location access in your browser
   - For mobile: Go to Settings > Privacy > Location Services
   - For desktop: Click location icon in address bar

2. **Refresh and Reload**
   - Refresh the page completely (Ctrl+F5 or Cmd+Shift+R)
   - Clear browser cache and cookies
   - Try opening in incognito/private mode

3. **Check Internet Connection**
   - Ensure stable internet connection
   - Maps require good connectivity to load
   - Try switching between WiFi and mobile data

4. **Browser Compatibility**
   - Use updated version of Chrome, Firefox, or Safari
   - Disable browser extensions that might block maps
   - Enable JavaScript if disabled

5. **Manual Location Entry**
   - If map fails, manually type complete address
   - Include area, city, state, and pincode
   - Use landmarks for better accuracy

6. **Alternative Method**
   - Copy location from Google Maps
   - Paste coordinates if available
   - Use nearby landmarks as reference

Contact support if map issues persist - we can help set location manually.`,
    relatedKeywords: ['map', 'location', 'not loading', 'wrong', 'gps', 'coordinates', 'address'],
    priority: 6
  },

  // Contact Issues
  {
    category: 'Contact Issues',
    question: 'WhatsApp and Call buttons are not showing',
    answer: `Contact buttons may not appear due to these reasons:

1. **Booking Status Required**
   - WhatsApp/Call buttons appear after booking approval
   - Send a booking request first
   - Wait for owner to approve your request

2. **Property Owner Policy**
   - Some owners prefer booking requests before direct contact
   - This protects both renters and owners
   - Follow the booking process for better response

3. **Browser Issues**
   - Refresh the page completely
   - Clear browser cache and cookies
   - Try different browser or incognito mode

4. **Mobile vs Desktop**
   - Some features work better on mobile
   - Try opening on your smartphone
   - WhatsApp works best on mobile devices

5. **Owner Contact Verification**
   - Owner may not have verified their phone number
   - Report this issue to our support team
   - We'll help verify owner contact details

6. **Alternative Contact Methods**
   - Use the booking request message feature
   - Include your contact details in booking message
   - Ask owner to contact you directly

For immediate contact needs, contact our support team and we'll facilitate communication.`,
    relatedKeywords: ['whatsapp', 'call', 'contact', 'buttons', 'not showing', 'phone', 'owner'],
    priority: 7
  },

  // Payment Issues
  {
    category: 'Payment Issues',
    question: 'How do payments work on RoomRento?',
    answer: `RoomRento payment process is simple and secure:

1. **No Online Payments Required**
   - RoomRento is a listing platform
   - We don't handle money transactions
   - All payments are directly between renter and owner

2. **Payment Discussion**
   - Discuss payment terms during booking
   - Common methods: Cash, Bank Transfer, UPI
   - Agree on advance amount and monthly cycle

3. **Typical Payment Structure**
   - **Advance**: 1-3 months rent as security
   - **Monthly Rent**: Paid at month beginning
   - **Additional**: Electricity, maintenance if applicable

4. **Safety Tips**
   - Never pay full amount before seeing property
   - Ask for receipt for any advance payment
   - Verify owner identity and documents
   - Trust your instincts about the deal

5. **Documentation**
   - Get written agreement for rent terms
   - Keep receipts of all payments
   - Take photos of property condition

6. **Dispute Resolution**
   - For payment disputes, contact our support
   - We'll help mediate between parties
   - Local legal advice may be needed for serious issues

Remember: RoomRento helps you connect safely, but transactions are your responsibility.`,
    relatedKeywords: ['payment', 'money', 'rent', 'advance', 'security', 'deposit', 'transaction'],
    priority: 6
  },

  // General
  {
    category: 'General',
    question: 'How does RoomRento work?',
    answer: `RoomRento is India's trusted room rental platform. Here's how it works:

1. **For Renters (Finding Rooms):**
   - Browse thousands of rooms, PGs, and apartments
   - Filter by location, budget, amenities
   - View detailed photos and descriptions
   - Send booking requests to owners
   - Connect directly after approval

2. **For Owners (Listing Property):**
   - Create free owner account
   - List your rooms with photos and details
   - Receive booking requests from verified renters
   - Approve/reject requests as per your preference
   - Communicate directly with interested renters

3. **Key Features:**
   - **Map Integration**: Find rooms near your work/college
   - **Verified Listings**: All properties are moderated
   - **Direct Contact**: No middleman once connected
   - **Mobile Friendly**: Works perfectly on smartphones
   - **Free Service**: No hidden charges for basic features

4. **Safety & Trust:**
   - User verification system
   - Review and rating system
   - Secure communication platform
   - Spam and fraud protection

5. **Getting Started:**
   - **Renters**: Sign up → Search → Request → Connect
   - **Owners**: Sign up → List Property → Manage Requests

Join thousands of happy users who found their perfect room through RoomRento!`,
    relatedKeywords: ['how', 'works', 'about', 'roomrento', 'platform', 'service', 'process'],
    priority: 10
  }
];

const seedHelpTopics = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing help topics
    await HelpTopic.deleteMany({});
    console.log('Cleared existing help topics');

    // Insert new help topics
    await HelpTopic.insertMany(helpTopicsData);
    console.log(`Inserted ${helpTopicsData.length} help topics`);

    console.log('Help topics seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding help topics:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedHelpTopics();
}

module.exports = { seedHelpTopics, helpTopicsData };
