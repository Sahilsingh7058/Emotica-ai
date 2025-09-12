import { useEffect, useState } from "react";

export default function AuthPage ({ isOpen, onClose })  {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(false);

  

  useEffect(() => {
    const storedFirstName = localStorage.getItem("userFirstName");
    const storedLastName = localStorage.getItem("userLastName");
    const storedEmail = localStorage.getItem("userEmail");
    const storedPass = localStorage.getItem("userPass");
     
    if (storedEmail) {
      setFirstName(storedFirstName || "");
      setLastName(storedLastName || "");
      setEmail(storedEmail);
      setIsLoggedIn(true);
    }
  }, []);

  const handleAuth = (e) => {
    const storedPass = localStorage.getItem("userPass");
    if (storedPass !== password){
      e.preventDefault();

    }
    if (isSignUp) {
      if (firstName && lastName && email && password) {
        localStorage.setItem("userFirstName", firstName);
        localStorage.setItem("userLastName", lastName);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPass", password);
        setIsLoggedIn(true);
      }
    } else {     const storedPass = localStorage.getItem("userPass");
      if (email && password) {
        if (storedPass !== password) {
          console.log("Invalid credentials");
          setError(true);
          return;
        }
        setError(false);
        const storedFirstName = localStorage.getItem("userFirstName");
        const storedLastName = localStorage.getItem("userLastName");
        const storedEmail = localStorage.getItem("userEmail");

        if (storedEmail === email) {
          setFirstName(storedFirstName || "");
          setLastName(storedLastName || "");
          setIsLoggedIn(true);
        } else {
          console.log("Invalid credentials");
        }
      }
    }
    window.location.reload();
  };

  const handleSignOut = () => {

    
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setIsLoggedIn(false);
    onClose();
    
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {!isLoggedIn ? (
          isSignUp ? (
            <form onSubmit={handleAuth} className="space-y-6">
              <h2 className="text-3xl font-bold text-center text-gray-800">Create Account</h2>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="name"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Create Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Sign Up
                </button>
              </div>
              <div className="text-center text-sm mt-4">
                Already have an account?
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="ml-1 font-medium text-purple-600 hover:text-purple-500 focus:outline-none"
                >
                  Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-6">
              <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back</h2>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (<div className="text-red-600 ">Invalid password</div>)}
              

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Sign In
                </button>
              </div>
              <div className="text-center text-sm mt-4">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="ml-1 font-medium text-purple-600 hover:text-purple-500 focus:outline-none"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Hello, {firstName} {lastName}!</h2>
            <p className="mt-2 text-gray-600">You are now signed in.</p>
            <button
              onClick={handleSignOut}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purple-600 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};