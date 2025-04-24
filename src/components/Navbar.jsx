// Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Twitter } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">
                DataViz Portfolio
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="border-b-2 border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/visualizations"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Visualizations
              </Link>
              <Link
                to="/about"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {/* <a href="#" className="text-gray-400 hover:text-gray-500">
                <Github className="w-5 h-5" />
              </a> */}
            {/* <a href="#" className="text-gray-400 hover:text-gray-500">
                <Linkedin className="w-5 h-5" />
              </a> */}
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
