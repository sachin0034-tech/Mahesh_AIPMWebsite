import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Heart,
  Video,
  FileText,
  ExternalLink,
  Sparkles,
  Edit,
  Trash2,
} from "lucide-react";
import ProjectDetail from "./ProjectDetail";
import { Link } from "react-router-dom";

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

const ManageAgent: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async (page: number = 1) => {
    console.log("🔍 Fetching projects - Page:", page);

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      console.log("🔐 Auth token exists:", !!token);
      if (token) {
        console.log("🔐 Token preview:", token.substring(0, 20) + "...");
      }

      const url = `https://maheshaicommunity.onrender.com/api/projects?page=${page}&limit=12`;
      console.log("🌐 Fetching from URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Response status:", response.status);
      console.log(
        "📡 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

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
        console.log("📊 Pagination info:", data.pagination);

        // Debug each project's image data
        data.data.forEach((project: any, index: number) => {
          console.log(`📸 Project ${index + 1} (${project.projectName}):`, {
            hasBackgroundImage: !!project.backgroundImage,
            backgroundImage: project.backgroundImage,
            imageUrl: project.backgroundImage?.url,
            fullImageUrl: project.backgroundImage?.url
              ? `https://maheshaicommunity.onrender.com${project.backgroundImage.url}`
              : null,
          });
        });

        setProjects(data.data);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.current);
      } else {
        console.error("❌ API returned success: false", data);
        throw new Error(data.message || "Failed to fetch projects");
      }
    } catch (error: any) {
      console.error("💥 Error fetching projects:", error);
      console.error("💥 Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      setError(error.message);
    } finally {
      setLoading(false);
      console.log("🏁 Fetch projects completed");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const truncateDescription = (description: string, wordLimit: number = 25) => {
    const words = description.split(" ");
    if (words.length <= wordLimit) return description;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const handleLinkClick = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleViewProject = (projectId: string) => {
    console.log("View project:", projectId);
    setSelectedProjectId(projectId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `https://maheshaicommunity.onrender.com/api/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete project");
      }

      // Remove the project from the local state
      setProjects(projects.filter((project) => project._id !== projectId));
      setDeleteConfirmId(null);

      console.log("✅ Project deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting project:", error);
      alert(`Failed to delete project: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditProject = (projectId: string) => {
    // Navigate to edit page or open edit modal
    window.location.href = `/edit-agent/${projectId}`;
  };

  // Show project detail if a project is selected
  if (selectedProjectId) {
    return (
      <ProjectDetail
        projectId={selectedProjectId}
        onBack={handleBackToProjects}
      />
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-orange-200/50">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-orange-700">Loading projects...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-orange-200/50">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-red-700 mb-2">
              Error Loading Projects
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchProjects()}
              className="px-6 py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[2500px] mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-orange-200/50">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Agents
            </h2>
            <p className="text-gray-600">
              {projects.length} published agent
              {projects.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            onClick={() => fetchProjects(currentPage)}
            className="px-6 py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-colors font-medium flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No Agents Published Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Published agents will appear here. Start by adding your first
              agent!
            </p>
          </div>
        ) : (
          <>
            {/* Newsletter Style Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden relative hover:shadow-3xl transition-all duration-300 border border-amber-100"
                >
                  {/* Featured Badge */}
                  {project.rating >= 4 && (
                    <div className="absolute top-5 right-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 z-10 shadow-lg animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="absolute top-16 right-5 flex flex-col gap-2 z-10">
                    <button
                      onClick={() => handleEditProject(project._id)}
                      className="bg-white border-2 border-blue-200 rounded-xl px-3 py-2 text-sm hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg group"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(project._id)}
                      className="bg-white border-2 border-red-200 rounded-xl px-3 py-2 text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-300 shadow-md hover:shadow-lg group"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Illustration Section */}
                  <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 h-80 overflow-hidden">
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
                              "❌ Image failed to load:",


                            );
                            console.log(
                              "❌ Full image object:",
                              project.backgroundImage
                            );
                            console.log("❌ Project:", project.projectName);
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const fallback = target.parentElement
                              ?.nextElementSibling as HTMLElement;
                            if (fallback) fallback.classList.remove("hidden");
                          }}
                          onLoad={() => {
                            console.log(
                              "✅ Image loaded successfully:",
                              `https://maheshaicommunity.onrender.com${project.backgroundImage.url}`
                            );
                            console.log("✅ Project:", project.projectName);
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
                      onClick={() => handleViewProject(project._id)}
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
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
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
                            ? "bg-orange-500 text-white"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
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
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Delete Project
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this project? This action
                  cannot be undone.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProject(deleteConfirmId)}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAgent;
