# Firebase Authentication & Firestore Setup Guide

## Firebase Console Configuration

### 1. Authentication Setup
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable **Email/Password** authentication
3. Optionally enable **Google** or other providers

### 2. Firestore Database Setup
1. Go to Firebase Console > Firestore Database
2. Create database in **production mode**
3. Set up the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /favorites/{userId}/routes/{routeId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /searchHistory/{userId}/queries/{queryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /alerts/{userId}/routes/{alertId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Required Environment Variables
Add these to your Replit Secrets or environment:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Features Implemented

### Authentication Features
- ✅ Email/password registration with display name
- ✅ Email/password sign-in
- ✅ Form validation and error handling
- ✅ Protected routes with automatic redirect
- ✅ Authentication state management
- ✅ Sign out functionality

### User Profile Features
- ✅ **Favorite Routes**: Save and manage favorite flight routes
- ✅ **Search History**: Automatic tracking of flight searches
- ✅ **Price Alerts**: Set up price monitoring with enable/disable toggles
- ✅ Real-time Firestore synchronization
- ✅ CRUD operations for all user data

### UI/UX Features
- ✅ Responsive design with Tailwind CSS
- ✅ Framer Motion animations
- ✅ Loading states and error handling
- ✅ Toast notifications for user feedback
- ✅ Clean, modern interface design

## Integration with Travel Tools

### Adding Routes to Favorites
```typescript
// Example: Add route to favorites from any flight search component
const { addFavorite } = useUserData();

const handleAddToFavorites = async (flightData) => {
  try {
    await addFavorite({
      origin: flightData.origin,
      destination: flightData.destination,
      departureDate: flightData.departureDate,
      returnDate: flightData.returnDate,
      price: parseFloat(flightData.price.total),
      currency: flightData.price.currency,
      airline: flightData.validatingAirlineCodes[0]
    });
    toast({ title: "Added to favorites!" });
  } catch (error) {
    toast({ title: "Failed to add favorite", variant: "destructive" });
  }
};
```

### Adding to Search History
```typescript
// Example: Track search in flight search components
const { addHistory } = useUserData();

const handleSearch = async (searchParams) => {
  // Perform flight search
  const results = await searchFlights(searchParams);
  
  // Add to search history
  try {
    await addHistory({
      origin: searchParams.origin,
      destination: searchParams.destination,
      departureDate: searchParams.departureDate,
      returnDate: searchParams.returnDate,
      resultsCount: results.length,
      lowestPrice: Math.min(...results.map(r => parseFloat(r.price.total)))
    });
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
};
```

### Setting Price Alerts
```typescript
// Example: Create price alert from flight results
const { addAlert } = useUserData();

const handleCreateAlert = async (route, targetPrice) => {
  try {
    await addAlert({
      origin: route.origin,
      destination: route.destination,
      departureDate: route.departureDate,
      returnDate: route.returnDate,
      targetPrice: targetPrice,
      currency: 'USD'
    });
    toast({ title: "Price alert created!" });
  } catch (error) {
    toast({ title: "Failed to create alert", variant: "destructive" });
  }
};
```

## Available Routes

- `/` - Landing page (public)
- `/signup` - User registration
- `/signin` - User login
- `/profile` - User profile and data management (protected)
- `/app` - Travel tools (public, but enhanced for authenticated users)

## Next Steps

1. Verify Firebase API key is correct in your project settings
2. Test user registration and login flows
3. Integrate favorite/history/alert functions into existing travel tools
4. Set up Firestore indexes for better query performance
5. Configure Firebase hosting for production deployment

The authentication system is fully functional and ready for integration with your existing TripWhiz travel tools.