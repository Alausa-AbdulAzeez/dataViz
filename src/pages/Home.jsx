// Home.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  LineChart,
  PieChart,
  Map,
  Network,
  ExternalLink,
  Linkedin,
  Twitter,
  Github,
} from "lucide-react";
import { Navbar } from "../components";

const Home = () => {
  const [hoveredProject, setHoveredProject] = useState(null);

  // Sample featured visualizations
  const featuredProjects = [
    {
      id: 1,
      title: "Global Temperature Trends",
      category: "Time Series",
      thumbnail: "/api/placeholder/600/400",
      icon: <LineChart className="w-8 h-8 mb-2 text-blue-500" />,
      description:
        "Interactive visualization of global temperature changes over the last century.",
    },
    {
      id: 2,
      title: "Population Distribution",
      category: "Maps",
      thumbnail: "/api/placeholder/600/400",
      icon: <Map className="w-8 h-8 mb-2 text-green-500" />,
      description:
        "Choropleth map showing population density across different regions.",
    },
    {
      id: 3,
      title: "Budget Breakdown",
      category: "Charts",
      thumbnail: "/api/placeholder/600/400",
      icon: <PieChart className="w-8 h-8 mb-2 text-purple-500" />,
      description:
        "Interactive pie and treemap charts visualizing budget allocations.",
    },
    {
      id: 4,
      title: "Social Network Analysis",
      category: "Networks",
      thumbnail: "/api/placeholder/600/400",
      icon: <Network className="w-8 h-8 mb-2 text-red-500" />,
      description:
        "Force-directed graph showing connections in a social network.",
    },
  ];

  // Visualization categories
  const categories = [
    {
      name: "Charts & Graphs",
      icon: <BarChart className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Maps & Geospatial",
      icon: <Map className="w-6 h-6" />,
      color: "bg-green-100 text-green-800",
    },
    {
      name: "Networks & Trees",
      icon: <Network className="w-6 h-6" />,
      color: "bg-red-100 text-red-800",
    },
    {
      name: "Interactive Stories",
      icon: <PieChart className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-800",
    },
    {
      name: "Experimental",
      icon: <LineChart className="w-6 h-6" />,
      color: "bg-yellow-100 text-yellow-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Data Stories Through Visualization
              </h1>
              <p className="mt-6 text-xl">
                Transforming complex data into insightful, interactive
                visualizations using D3.js and React.
              </p>
              <div className="mt-10 flex space-x-4">
                <Link
                  to="/visualizations"
                  className="px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  Browse Portfolio
                </Link>
                <Link
                  to="/about"
                  className="px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  About Me
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  {/* Placeholder for a featured visualization preview */}
                  <img
                    src="/api/placeholder/600/400"
                    alt="Data Visualization Preview"
                    className="w-full rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Featured Visualizations
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/visualization/${project.id}`}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <div className="h-48 bg-gray-200">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-start">
                  {project.icon}
                  <div className="ml-2">
                    <span className="text-xs font-medium text-indigo-600">
                      {project.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.title}
                    </h3>
                  </div>
                </div>
                <p
                  className={`mt-2 text-sm text-gray-500 ${
                    hoveredProject === project.id ? "block" : "hidden"
                  }`}
                >
                  {project.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/category/${category.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
              >
                <div className={`p-3 rounded-full ${category.color} mb-3`}>
                  {category.icon}
                </div>
                <span className="text-center font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* About Me Preview */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">About Me</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    I'm a data visualization enthusiast passionate about
                    transforming complex datasets into intuitive visual stories.
                    With a background in [your background], I love exploring the
                    intersection of data science, design, and web development.
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
                <Link
                  to="/about"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="mt-8 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
          <p className="mt-8 text-center text-base text-gray-500">
            &copy; {new Date().getFullYear()} Your Name. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
