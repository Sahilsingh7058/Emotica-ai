import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, updateProfile } from "firebase/auth"; // Import updateProfile
// FIX: Explicitly specify the .js extension for the utility file to resolve dependency error.
import { auth } from "../firebaseConfig.js"; 

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for editing mode and temporary name/photo input
  const [isEditing, setIsEditing] = useState(false);
  const [tempFullName, setTempFullName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false); // To prevent double clicks/show loading
  const [error, setError] = useState(null); // To show update errors

  // 1. Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      // Initialize the temporary name state when the user is loaded
      if (user) {
        setTempFullName(user.displayName || "");
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Derive User Information (Moved inside the render logic or kept minimal)
  const fullName = currentUser?.displayName || "Guest User";
  const email = currentUser?.email || "N/A";
  const firstName = currentUser?.displayName?.split(' ')[0] || (currentUser ? 'User' : 'Guest');
  const lastNameInitial = currentUser?.displayName?.split(' ').slice(-1)[0]?.charAt(0) || '';
  
  // Use user's photo URL if available, otherwise use a placeholder
  const profilePictureUrl = currentUser?.photoURL || 
    `https://placehold.co/150x150/8a2be2/ffffff?text=${firstName.charAt(0)}${lastNameInitial}`;

  const joinedDate = currentUser?.metadata?.creationTime ? 
    new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 
    "Unknown Date";

  // --- NEW: Handlers for Editing and Saving ---
  
  const handleEditClick = () => {
    // When entering edit mode, ensure the input field reflects the current name
    setTempFullName(currentUser?.displayName || "");
    setIsEditing(true);
    setError(null); // Clear previous errors
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setError(null);
    setTempFullName(currentUser?.displayName || ""); // Reset input to current value
  };

  const handleSaveProfile = async () => {
    if (!currentUser || isUpdating) return;
    
    // Simple validation for name
    if (tempFullName.trim().length < 3) {
        setError("Name must be at least 3 characters long.");
        return;
    }

    setIsUpdating(true);
    setError(null);
    
    try {
        // 1. Update the Firebase user profile
        await updateProfile(currentUser, {
            displayName: tempFullName.trim(),
            // photoURL: newProfilePictureUrl // Placeholder for future photo update logic
        });

        // 2. The onAuthStateChanged listener will automatically update the currentUser state
        //    (and thus, the UI) with the new name.

        // 3. Exit editing mode and clear temp states
        setIsEditing(false);
        alert("Profile updated successfully!"); // Simple success feedback

    } catch (err) {
        console.error("Error updating profile:", err);
        setError("Failed to update profile. Please try again.");
    } finally {
        setIsUpdating(false);
    }
  };


  // --- UI Rendering ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#4F6483]">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#4F6483] py-16 px-4 pt-[100px]">
        <div className="bg-white/85 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center max-w-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please sign in to view your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#4F6483] min-h-screen py-16 px-4 sm:px-6 lg:px-8 pt-[100px]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
            My Profile
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            View and manage your account settings and personal information.
          </p>
        </div>

        {/* Profile Card */}
        <section className="bg-white/85 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-12 flex flex-col items-center text-center">
          <img
            src={profilePictureUrl}
            alt="User profile"
            className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-purple-500 shadow-md"
            onError={(e) => {
              e.target.onerror = null; // prevents looping
              e.target.src = `https://placehold.co/150x150/8a2be2/ffffff?text=${firstName.charAt(0)}${lastNameInitial}`;
            }}
          />
          {/* Note: Profile picture editing is more involved (needs file upload/storage) 
               You would put an <input type="file"> here, tied to isEditing state. */}
          
          {/* Conditional rendering for the main profile name display */}
          <h2 className="text-2xl font-bold text-gray-800">{fullName}</h2>
          <p className="text-gray-600 mt-2">On a journey to prioritize mental and emotional wellness. Finding peace one day at a time.</p>
          <p className="text-sm text-gray-500 mt-1">Member since {joinedDate}</p>
        </section>
        
        {/* Error message display */}
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}
        
        {/* Account Settings Section */}
        <section className="bg-white/85 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
          <div className="space-y-6">
            
            {/* NAME FIELD: Conditional Rendering */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-gray-200">
              <span className="text-gray-700 font-medium w-full sm:w-1/3 mb-2 sm:mb-0">Name</span>
              
              <div className="w-full sm:w-2/3 flex flex-col sm:flex-row items-start sm:items-center justify-end">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={tempFullName}
                      onChange={(e) => setTempFullName(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md text-gray-800 w-full sm:w-auto sm:mr-4 mb-2 sm:mb-0"
                      disabled={isUpdating}
                    />
                    <div className="flex space-x-2">
                        <button 
                            onClick={handleSaveProfile} 
                            className="px-4 py-2 bg-green-500 text-white text-sm rounded-full transition-colors hover:bg-green-600 disabled:bg-green-300"
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                            onClick={handleCancelClick} 
                            className="px-4 py-2 bg-gray-400 text-white text-sm rounded-full transition-colors hover:bg-gray-500"
                            disabled={isUpdating}
                        >
                            Cancel
                        </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500 mb-2 sm:mb-0">{fullName}</span>
                    <button 
                        onClick={handleEditClick} 
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-full transition-colors hover:bg-purple-700 ml-0 sm:ml-4"
                    >
                        Edit Name
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* EMAIL FIELD: Not editable in this simple example */}
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-700">Email</span>
              <span className="text-gray-500">{email}</span>
            </div>
            
            
          </div>
        </section>
      </div>
    </div>
  );
}