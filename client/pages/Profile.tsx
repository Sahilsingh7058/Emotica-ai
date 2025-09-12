import React from 'react';

// Placeholder data for the user profile
const userProfile = {
  name: localStorage.getItem("userFirstName") +" "+ localStorage.getItem("userLastName"),
  bio: "On a journey to prioritize mental and emotional wellness. Finding peace one day at a time.",
  joinedDate: "October 2024",
  profilePictureUrl: `https://placehold.co/150x150/8a2be2/ffffff?text=${localStorage.getItem("userFirstName")?.charAt(0) || 'U'}${localStorage.getItem("userLastName")?.charAt(0) || 'N'}`,
};

export default function Profile() {
  const FirstName = localStorage.getItem("userFirstName");
  const LastName = localStorage.getItem("userLastName");
  const Email = localStorage.getItem("userEmail");

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
            src={userProfile.profilePictureUrl}
            alt="User profile"
            className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-purple-500 shadow-md"
          />
          <h2 className="text-2xl font-bold text-gray-800">{userProfile.name}</h2>
          <p className="text-gray-600 mt-2">{userProfile.bio}</p>
          <p className="text-sm text-gray-500 mt-1">Member since {userProfile.joinedDate}</p>
        </section>

        {/* Account Settings Section */}
        <section className="bg-white/85 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-700">Name</span>
              <span className="text-gray-500">{userProfile.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-700">Email</span>
              <span className="text-gray-500">{Email}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-700">Password</span>
              <span className="text-gray-500">********</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Notification Preferences</span>
              <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-full transition-colors hover:bg-purple-700">Edit</button>
            </div>
          </div>
        </section>

        {/* App Data & Usage Section */}
        <section className="bg-white/85 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Data</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-700">Journal Entries</span>
              <span className="text-gray-500">12 entries</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-700">Moods Logged</span>
              <span className="text-gray-500">35 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Usage Analytics</span>
              <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-full transition-colors hover:bg-purple-700">View</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
