import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const NotFound = () => {
  const location = useLocation();

  // Log 404 error for debugging
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="text-center px-4">
            <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
            <p className="text-2xl text-gray-700 mb-6">Oops! Page not found</p>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              The page you are looking for might have been removed, had its name changed,
              or is temporarily unavailable.
            </p>
            <Link
              to="/"
              className="btn-primary inline-block"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;