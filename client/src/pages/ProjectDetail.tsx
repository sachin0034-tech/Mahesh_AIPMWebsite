import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Tag,
  FileText,
  Globe,
  Layers,
  Video,
  Linkedin,
  User,
  Heart,
  Sparkles,
  Star,
  Calendar,
  Award,
  Code,
  Zap,
} from "lucide-react";

interface Project {
  _id: string;
  name: string;
  projectName: string;
  projectDescription: string;
  linkedProfile?: string;
  videoLink?: string;
  deployedLink?: string;
  instructionDocumentLink?: string;
  flowFileLink?: string;
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

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  const fetchProject = async () => {
    console.log("🔍 Fetching project details for ID:", projectId);

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      console.log("🔐 Auth token exists:", !!token);

      const response = await fetch(
        `https://maheshaicommunity.onrender.com/api/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response not OK:", errorText);
        throw new Error(
          `Failed to fetch project: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("📡 Project data:", data);

      if (data.success) {
        console.log("✅ Project fetched successfully:", data.data);
        setProject(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch project");
      }
    } catch (error: any) {
      console.error("💥 Error fetching project:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-200 border-t-orange-500 mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg mt-6 font-medium">
            Loading amazing project...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-6">We couldn't find this project</p>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:shadow-lg transition-all font-semibold hover:scale-105"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      {/* Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Projects</span>
          </button>

          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              liked
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span className="font-semibold">{liked ? "Liked" : "Like"}</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge and Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              {project.projectName}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-600 flex-wrap">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>
                  by {project.name || project.createdBy.email.split("@")[0]}
                </span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(project.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="text-gray-400">•</span>
              {/* <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < project.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-1">({project.rating}/5)</span>
              </div> */}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 group">
            {project.backgroundImage?.url ? (
              <div className="aspect-video">
                <img
                  src={`https://maheshaicommunity.onrender.com${project.backgroundImage.url}`}
                  alt={project.projectName}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.log(
                      "❌ Hero image failed to load:",
                      `https://maheshaicommunity.onrender.com${project.backgroundImage.url}`
                    );
                    console.log("❌ Image object:", project.backgroundImage);
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.classList.remove("hidden");
                  }}
                  onLoad={() => {
                    console.log(
                      "✅ Hero image loaded successfully:",
                      `https://maheshaicommunity.onrender.com${project.backgroundImage.url}`
                    );
                  }}
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Sparkles className="w-20 h-20 mx-auto mb-4 animate-pulse" />
                  <p className="text-2xl font-bold">Project Preview</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {project.deployedLink && (
              <button
                onClick={() => handleLinkClick(project.deployedLink!)}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-orange-500"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-gray-900">Live Demo</span>
              </button>
            )}
            {project.videoLink && (
              <button
                onClick={() => handleLinkClick(project.videoLink!)}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-gray-900">Watch Demo</span>
              </button>
            )}
            {project.instructionDocumentLink && (
              <button
                onClick={() =>
                  handleLinkClick(project.instructionDocumentLink!)
                }
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-gray-900">Documentation</span>
              </button>
            )}
            {project.flowFileLink && (
              <button
                onClick={() => handleLinkClick(project.flowFileLink!)}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-8 h-8"
                    fill="white"
                    stroke="white"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-gray-900">Flow File</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                About This Project
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {project.projectDescription}
              </p>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Technologies */}
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-orange-500" />
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 rounded-full text-sm font-semibold hover:scale-105 transition-transform cursor-default"
                  >
                    {tool}
                  </span>
                ))}
              </div>

              {/* Categories */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-500" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {project.categories.map((category, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 rounded-xl text-sm font-semibold"
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </div>

              {/* Creator */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Created By
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {project.name || project.createdBy.email.split("@")[0]}
                    </p>
                    <p className="text-sm text-gray-500">Project Creator</p>
                  </div>
                </div>
                {project.linkedProfile && (
                  <button
                    onClick={() => handleLinkClick(project.linkedProfile!)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 font-semibold"
                  >
                    <Linkedin className="w-5 h-5" />
                    Connect on LinkedIn
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Inspired by this project?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Explore more amazing projects and discover what's possible with AI
            and automation
          </p>
          <button
            onClick={() => (window.location.href = "/agents")}
            className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            Explore More Projects
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
