import React, { useState, useEffect } from "react";
import { Heart, Video, FileText, ExternalLink, Sparkles } from "lucide-react";

interface Project {
  _id: string;
  name: string;
  projectName: string;
  projectDescription: string;
  linkedProfile?: string;
  videoLink?: string;
  deployedLink?: string;
  instructionDocumentLink?: string;
  backgroundImage?: {
    url: string;
    filename: string;
  };
  categories: string[];
  tools: string[];
  rating: number;
  createdBy: {
    _id: string;
    email: string;
    name?: string;
  };
  status: string;
  publishedAt: string;
}

interface ShowProjectsProps {
  onViewProject: (projectId: string) => void;
}

const ShowProjects: React.FC<ShowProjectsProps> = ({ onViewProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProjects = async (page: number = 1) => {
    console.log("🔍 Fetching public projects - Page:", page);

    try {
      setLoading(true);
      setError(null);

      const url = `https://maheshaicommunity.onrender.com/api/projects?page=${page}&limit=16&status=published`;
      console.log("🌐 Fetching from URL:", url);

      const response = await fetch(url);

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response not OK:", errorText);
        throw new Error(
          `Failed to fetch projects: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("📡 Response data:", data);

      if (data.success) {
        console.log(
          "✅ Projects fetched successfully:",
          data.data.length,
          "projects"
        );
        setProjects(data.data);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.current);
      } else {
        throw new Error(data.message || "Failed to fetch projects");
      }
    } catch (error: any) {
      console.error("💥 Error fetching projects:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const truncateDescription = (description: string, wordLimit: number = 20) => {
    const words = description.split(" ");
    if (words.length <= wordLimit) return description;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const handleLinkClick = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="py-16 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore AI Agents
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing AI agents and automation projects created by our
            community. Find inspiration and explore cutting-edge solutions.
          </p>
        </div>

        {/* Agents Grid Section */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E75A55] mx-auto mb-4"></div>
              <p className="text-gray-700">Loading amazing agents...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">
              Error Loading Agents
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchProjects()}
              className="px-6 py-3 bg-[#E75A55] text-white rounded-2xl hover:bg-red-600 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-300 text-8xl mb-4">🤖</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No Agents Available
            </h3>
            <p className="text-gray-600">
              Check back soon for amazing AI agents and automation projects!
            </p>
          </div>
        ) : (
          <>
            {/* Newsletter Style Cards Grid - Same as Admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 mb-12 px-8 sm:px-12 lg:px-16 xl:px-20">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-none overflow-hidden relative hover:shadow-3xl transition-all duration-300 border border-amber-100"
                >
                  {/* Illustration Section */}
                  <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 h-72 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-orange-200/20"></div>

                    {/* Show uploaded image if available - covers complete banner */}
                    {project.backgroundImage?.url ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img
                          src={`https://maheshaicommunity.onrender.com${project.backgroundImage.url}`}
                          alt={project.projectName}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.log(
                              "❌ Public image failed to load:",
                              `https://maheshaicommunity.onrender.com${project.backgroundImage.url}`
                            );
                            console.log(
                              "❌ Image object:",
                              project.backgroundImage
                            );
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const fallback = target.parentElement
                              ?.nextElementSibling as HTMLElement;
                            if (fallback) fallback.classList.remove("hidden");
                          }}
                          onLoad={() => {
                            console.log(
                              "✅ Public image loaded successfully:",
                              `https://maheshaicommunity.onrender.com${project.backgroundImage.url}`
                            );
                          }}
                        />
                        {/* Overlay for better text readability on uploaded images */}
                        <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                    ) : null}

                    {/* Newsletter Illustration (fallback) */}
                    <div
                      className={`relative w-full h-full flex items-center justify-center p-8 ${
                        project.backgroundImage?.url ? "hidden" : ""
                      }`}
                    >
                      {/* Decorative Circle - Yellow with glow */}
                      <div className="absolute top-6 left-1/2 w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-4 border-dashed border-gray-800 shadow-lg"></div>

                      {/* Decorative Circle - White with shadow */}
                      <div className="absolute top-8 left-8 w-10 h-10 bg-white rounded-full border-4 border-dashed border-gray-800 shadow-md"></div>

                      {/* Particles with animation */}
                      <div className="absolute top-16 left-12 w-2 h-2 bg-gradient-to-br from-orange-400 to-red-400 transform rotate-45 animate-bounce"></div>
                      <div className="absolute top-20 right-16 w-2 h-2 bg-gradient-to-br from-orange-400 to-red-400 transform rotate-45 animate-bounce delay-100"></div>
                      <div className="absolute bottom-24 left-20 w-2 h-2 bg-gradient-to-br from-orange-400 to-red-400 transform rotate-45 animate-bounce delay-200"></div>

                      {/* Left Hand with Newspaper */}
                      <div className="absolute left-8 top-12 transform -rotate-6 hover:scale-105 transition-transform duration-300">
                        <div className="relative w-24 h-36 bg-white border-4 border-dashed border-gray-800 rounded-lg shadow-xl">
                          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-xs font-bold border-2 border-gray-800 bg-white px-2 py-1 shadow-sm">
                            NEWS
                          </div>
                          <div className="absolute top-10 left-3 right-3 space-y-2">
                            <div className="h-1 bg-gray-800 rounded"></div>
                            <div className="h-1 bg-gray-800 w-3/5 rounded"></div>
                            <div className="h-1 bg-gray-800 rounded"></div>
                            <div className="h-1 bg-gray-800 w-4/5 rounded"></div>
                          </div>
                          <div className="absolute top-12 left-3 w-8 h-5 bg-gradient-to-br from-yellow-300 to-yellow-500"></div>
                          <div className="absolute -bottom-1 -left-2 -right-2 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-t-full shadow-lg"></div>
                        </div>
                      </div>

                      {/* Right Hand with Newspaper */}
                      <div className="absolute right-8 top-12 transform rotate-6 hover:scale-105 transition-transform duration-300">
                        <div className="relative w-24 h-36 bg-white border-4 border-dashed border-gray-800 rounded-lg shadow-xl">
                          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-xs font-bold border-2 border-gray-800 bg-white px-2 py-1 shadow-sm">
                            NEWS
                          </div>
                          <div className="absolute top-10 left-3 right-3 space-y-2">
                            <div className="h-1 bg-gray-800 rounded"></div>
                            <div className="h-1 bg-gray-800 w-3/5 rounded"></div>
                            <div className="h-1 bg-gray-800 rounded"></div>
                            <div className="h-1 bg-gray-800 w-4/5 rounded"></div>
                          </div>
                          <div className="absolute top-12 left-3 w-8 h-5 bg-gradient-to-br from-yellow-300 to-yellow-500"></div>
                          <div className="absolute -bottom-1 -left-2 -right-2 h-10 bg-gradient-to-r from-gray-600 to-gray-800 rounded-t-full shadow-lg"></div>
                        </div>
                      </div>

                      {/* Megaphone with gradient */}
                      <div className="absolute top-4 right-8 hover:scale-110 transition-transform duration-300">
                        <div className="relative w-12 h-10">
                          <div className="absolute w-8 h-8 bg-gradient-to-br from-red-400 to-rose-500 rounded-full transform rotate-45 -translate-x-2 shadow-lg"></div>
                          <div className="absolute right-0 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full top-2 shadow-md"></div>
                        </div>
                      </div>

                      {/* Envelope with shadow */}
                      <div className="absolute bottom-8 right-12 transform rotate-12 hover:rotate-6 transition-transform duration-300">
                        <div className="relative w-10 h-7 bg-white border-2 border-dashed border-gray-800 shadow-lg">
                          <div className="absolute -top-0.5 -left-0.5 -right-0.5 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[14px] border-t-yellow-400"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8">
                    <p className="text-amber-600 text-sm mb-3 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      by{" "}
                      {project.linkedProfile ? (
                        <button
                          onClick={() => handleLinkClick(project.linkedProfile)}
                          className="hover:underline text-blue-600 font-medium transition-colors"
                        >
                          {project.name ||
                            project.createdBy.email.split("@")[0]}
                        </button>
                      ) : (
                        <span className="font-medium">
                          {project.name ||
                            project.createdBy.email.split("@")[0]}
                        </span>
                      )}
                    </p>

                    <h2 className="text-3xl font-black text-gray-900 mb-4 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                      {project.projectName}
                    </h2>

                    <p className="text-gray-600 text-base leading-relaxed mb-5">
                      {truncateDescription(project.projectDescription, 30)}
                    </p>

                    {/* Tags with gradient */}
                    <div className="flex gap-3 mb-6 flex-wrap">
                      {project.tools.slice(0, 2).map((tool, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-4 py-2 rounded-lg text-sm font-semibold text-blue-700 hover:shadow-md transition-all duration-300 cursor-default"
                        >
                          {tool}
                        </span>
                      ))}
                      {project.categories.slice(0, 1).map((category, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 px-4 py-2 rounded-lg text-sm font-semibold text-purple-700 hover:shadow-md transition-all duration-300 cursor-default"
                        >
                          {category}
                        </span>
                      ))}
                      {(project.tools.length > 2 ||
                        project.categories.length > 1) && (
                        <span className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:shadow-md transition-all duration-300 cursor-default">
                          +
                          {project.tools.length -
                            2 +
                            (project.categories.length - 1)}{" "}
                          more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer with improved styling */}
                  <div className="px-8 pb-8 flex justify-between items-center">
                    <div className="flex gap-3">
                      {project.videoLink && (
                        <button
                          onClick={() => handleLinkClick(project.videoLink)}
                          className="w-11 h-11 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
                          title="Video"
                        >
                          <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                      )}

                      {project.instructionDocumentLink && (
                        <button
                          onClick={() =>
                            handleLinkClick(project.instructionDocumentLink)
                          }
                          className="w-11 h-11 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
                          title="Documentation"
                        >
                          <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                      )}

                      {project.deployedLink && (
                        <button
                          onClick={() => handleLinkClick(project.deployedLink)}
                          className="w-11 h-11 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
                          title="Deployed Link"
                        >
                          <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onViewProject(project._id)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 group text-sm"
                    >
                      <span>View Project</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => fetchProjects(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#E75A55] text-white hover:bg-red-600"
                  }`}
                >
                  Previous
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchProjects(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-[#E75A55] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => fetchProjects(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#E75A55] text-white hover:bg-red-600"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShowProjects;
