import { Link } from "react-router-dom";
import { utilities } from "../data/utilities"; // ✅ Import your actual data

const About = () => {
  // ✅ Get ACTUAL categories from your utilities.js data
  const actualCategories = [...new Set(utilities.map((u) => u.category))];
  const totalUtilities = utilities.length; // 31
  const totalCategories = actualCategories.length; // 13

  // ✅ Build categories display from REAL data
  const categoriesDisplay = actualCategories.map((categoryName) => {
    const categoryUtilities = utilities.filter(
      (u) => u.category === categoryName
    );
    return {
      name: categoryName,
      count: categoryUtilities.length,
      tools: categoryUtilities.map((u) => u.title),
    };
  });

  // ✅ Dynamic stats using REAL numbers
  const stats = [
    { label: "Total Utilities", value: totalUtilities.toString(), icon: "🛠️" },
    { label: "Categories", value: totalCategories.toString(), icon: "📁" },
    { label: "Modern React", value: "100%", icon: "⚛️" },
    { label: "Open Source", value: "MIT", icon: "📜" },
  ];

  const features = [
    {
      title: "Complete Developer Toolkit",
      description: `${totalUtilities} comprehensive utilities covering data conversion, security, image processing, encoding, web development, and more.`,
      icon: "🎯",
    },
    {
      title: "Modern Architecture",
      description:
        "Built with React 19, modern hooks, TypeScript-ready components, and following current best practices.",
      icon: "🏗️",
    },
    {
      title: "Privacy-First Design",
      description:
        "All processing happens locally in your browser. No data is sent to external servers or stored remotely.",
      icon: "🔒",
    },
    {
      title: "Professional UI/UX",
      description:
        "Clean, responsive design with dark mode support, mobile-friendly interface, and intuitive navigation.",
      icon: "🎨",
    },
    {
      title: "High Performance",
      description:
        "Optimized for speed with efficient algorithms, lazy loading, and minimal dependencies for fast loading times.",
      icon: "⚡",
    },
    {
      title: "Developer-Friendly",
      description:
        "Built by developers, for developers. Every tool is crafted with real-world development workflows in mind.",
      icon: "👨‍💻",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Developer Utilities Suite
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              The most comprehensive collection of developer tools -{" "}
              {totalUtilities} utilities in one platform
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                🚀 Production Ready
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                🔒 Privacy-First
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                ⚡ Lightning Fast
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                📱 Mobile Friendly
              </span>
            </div>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Explore All Tools
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Modern Developers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Our mission is to provide developers with the most comprehensive,
              fast, and reliable toolkit for everyday development tasks, all
              while maintaining the highest standards of privacy and
              performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Categories Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Tool Categories
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {totalUtilities} carefully crafted utilities organized into{" "}
            {totalCategories} essential categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoriesDisplay.map((category, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                  {category.count} tool{category.count !== 1 ? "s" : ""}
                </span>
              </div>
              <ul className="space-y-2">
                {category.tools.map((tool, toolIndex) => (
                  <li
                    key={toolIndex}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    <span className="line-clamp-2">{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Leveraging the latest web technologies for optimal performance and
              developer experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">⚛️</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                React 19
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Modern hooks & components
              </p>
            </div>
            <div>
              <div className="text-4xl mb-2">🎨</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Tailwind CSS
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Responsive design system
              </p>
            </div>
            {/* <div>
              <div className="text-4xl mb-2">📱</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                PWA Ready
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Progressive web app
              </p>
            </div> */}
            <div>
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Client-Side
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Privacy-first processing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Open Source Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Open Source & Community
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          This project is open source and available under the MIT license. We
          believe in transparency, community contribution, and making developer
          tools accessible to everyone.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/nirdhum/developer-utilities"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            View on GitHub
          </a>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Using Tools
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-100 dark:bg-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Questions or Feedback?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We'd love to hear from you! Whether you have suggestions for new
            tools, found a bug, or just want to say hello.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:contact@nirdhum.in"
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              📧 contact@nirdhum.in
            </a>
            <a
              href="https://nirdhum.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              🌐 nirdhum.in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
