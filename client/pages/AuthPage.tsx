import { useEffect, useState } from "react";
import { auth, googleProvider } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";

export default function AuthPage({ isOpen, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  // Track Firebase user session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        const displayName = user.displayName || "";
        const [fName, lName] = displayName.split(" ");
        setFirstName(fName || "");
        setLastName(lName || "");
        setEmail(user.email || "");
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle email/password Sign Up or Sign In
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`,
        });
        setIsLoggedIn(true);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setIsLoggedIn(true);
      }
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") setError("Email already in use");
      else if (err.code === "auth/invalid-email") setError("Invalid email");
      else if (err.code === "auth/wrong-password") setError("Wrong password");
      else if (err.code === "auth/user-not-found") setError("User not found");
      else setError("Authentication failed");
    }
  };

  // ✅ Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsLoggedIn(true);
      onClose();
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError("Google sign-in failed");
    }
  };

  // Handle Sign-Out
  const handleSignOut = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
  className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 p-4"
  onClick={onClose}
>
  <div
    className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-xl border border-gray-200 relative"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Close button */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
    >
      ✕
    </button>

    {!isLoggedIn ? (
      <div className="space-y-6">
        {/* Simplified Header for Sign Up or Sign In */}
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {isSignUp
            ? "Use your Google account to create your profile."
            : "Sign in using your Google account."}
        </p>

        {error && <p className="text-red-600 text-center">{error}</p>}

        {/* Google Sign In/Up Button (Unified) */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-md hover:bg-gray-50 transition font-medium text-lg"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-6 h-6"
            />
            Continue with Google
          </button>
        </div>

        {/* Sign In / Sign Up Toggle */}
        <p className="text-center text-sm mt-4">
          {isSignUp ? "Already have an account?" : "Don’t have an account?"}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 text-purple-600 hover:underline font-medium"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    ) : (
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Hello, {firstName} {lastName}!
        </h2>
        <p className="mt-2 text-gray-600">You are now signed in.</p>
        <button
          onClick={handleSignOut}
          className="mt-6 w-full py-2 px-4 text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-md transition"
        >
          Sign Out
        </button>
      </div>
    )}
  </div>
</div>
  );
}
