import Link from "next/link";
import { utilities, categories } from "../../data/utilities";
import {
  ToolsIcon,
  FolderIcon,
  BoltIcon,
  DocumentIcon,
  TargetIcon,
  CodeBracketIcon,
  LockClosedIcon,
  CSSIcon,
  UserIcon,
  RocketIcon,
  ShieldCheckIcon,
  MobileIcon,
  ReactIcon,
  NextjsIcon,
  TailwindIcon,
  ClientSideIcon,
} from "../../components/common/Icons";

export const metadata = {
  title: "About - Developer Utilities Suite",
  description:
    "Learn about DevutiliX, a comprehensive 71-tool developer utility suite built with Next.js and React 19.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const actualCategories = categories;
  const totalUtilities = utilities.length;
  const totalCategories = actualCategories.length;

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

  const stats = [
    {
      label: "Total Utilities",
      value: totalUtilities.toString(),
      icon: <ToolsIcon className="w-8 h-8 mx-auto text-blue-500" />,
    },
    {
      label: "Categories",
      value: totalCategories.toString(),
      icon: <FolderIcon className="w-8 h-8 mx-auto text-purple-500" />,
    },
    {
      label: "Modern Next.js",
      value: "100%",
      icon: <BoltIcon className="w-8 h-8 mx-auto text-amber-500" />,
    },
    {
      label: "Open Source",
      value: "MIT",
      icon: <DocumentIcon className="w-8 h-8 mx-auto text-emerald-500" />,
    },
  ];

  const features = [
    {
      title: "Complete Developer Toolkit",
      description: `${totalUtilities} comprehensive utilities covering data conversion, security, image processing, encoding, web development, and more.`,
      icon: <TargetIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    },
    {
      title: "Modern Architecture",
      description:
        "Built with Next.js App Router, React 19, modern hooks, and following current web best practices.",
      icon: <CodeBracketIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      title: "Privacy-First Design",
      description:
        "All processing happens locally in your browser. No data is sent to external servers or stored remotely.",
      icon: <LockClosedIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      title: "Professional UI/UX",
      description:
        "Clean, responsive design with dark mode support, mobile-friendly interface, and intuitive navigation.",
      icon: <CSSIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
    },
    {
      title: "High Performance",
      description:
        "Optimized for speed with efficient algorithms, automatic code splitting, and zero unnecessary network requests.",
      icon: <BoltIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: "Developer-Friendly",
      description:
        "Built by developers, for developers. Every tool is crafted with real-world development workflows in mind.",
      icon: <UserIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
    },
  ];

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 tracking-tight">
              Developer Utilities Suite
            </h1>
            <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 text-blue-100 max-w-2xl mx-auto leading-relaxed">
              The most comprehensive collection of developer tools —{" "}
              {totalUtilities} utilities in one platform
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                <RocketIcon className="w-4 h-4 text-amber-300" />
                Production Ready
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-300" />
                Privacy-First
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                <BoltIcon className="w-4 h-4 text-yellow-300" />
                Lightning Fast
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                <MobileIcon className="w-4 h-4 text-cyan-300" />
                Mobile Friendly
              </span>
            </div>
            <Link
              href="/"
              className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-blue-600 font-bold text-sm sm:text-base rounded-xl hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
            >
              Explore All Tools
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs"
            >
              <div className="mb-2">{stat.icon}</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white dark:bg-gray-800 py-10 sm:py-16 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
              Built for Modern Developers
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Our mission is to provide developers with the most comprehensive,
              fast, and reliable toolkit for everyday development tasks, all
              while maintaining the highest standards of privacy and
              performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Categories Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            Complete Tool Categories
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
            {totalUtilities} carefully crafted utilities organized into{" "}
            {totalCategories} essential categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
          {categoriesDisplay.map((category, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
                  {category.count} tool{category.count !== 1 ? "s" : ""}
                </span>
              </div>
              <ul className="space-y-1.5 sm:space-y-2">
                {category.tools.map((tool, toolIndex) => (
                  <li
                    key={toolIndex}
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    <span className="line-clamp-2">{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Section */}
      <div className="bg-white dark:bg-gray-800 py-10 sm:py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
              Leveraging the latest web technologies for optimal performance and
              developer experience
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:-translate-y-1">
              <div className="mb-2 flex justify-center">
                <NextjsIcon className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                Next.js
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                App Router & SSG
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:-translate-y-1">
              <div className="mb-2 flex justify-center">
                <ReactIcon className="w-8 h-8 text-[#087ea4] dark:text-[#58c4dc]" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                React 19
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Modern hooks & state
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:-translate-y-1">
              <div className="mb-2 flex justify-center">
                <TailwindIcon className="w-8 h-8 text-[#38bdf8]" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                Tailwind CSS
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Responsive design
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 transition-transform hover:-translate-y-1">
              <div className="mb-2 flex justify-center">
                <ClientSideIcon className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                Client-Side
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Privacy-first engine
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Open Source Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Open Source & Community
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
          DevutiliX is free, open source, and built to empower software engineers worldwide.
          Contributions and suggestions are always welcome.
        </p>
        <a
          href="https://github.com/nirdhum/devutilix"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs sm:text-sm rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
        >
          <CodeBracketIcon className="w-4 h-4" />
          <span>View on GitHub</span>
        </a>
      </div>
    </div>
  );
}
