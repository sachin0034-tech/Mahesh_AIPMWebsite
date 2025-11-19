import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface AgentData {
  // Step 1
  name: string;
  projectName: string;
  projectDescription: string;
  linkedProfile: string;

  // Step 2
  videoLink: string;
  flowFileLink: string;
  deployedLink: string;
  instructionDocumentLink: string;
  backgroundImage: File | null;
  existingImageUrl?: string;
  categories: string[];
  tools: string[];

  // Step 3
  rating: number;
}

const EditAgent: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [agentData, setAgentData] = useState<AgentData>({
    name: "",
    projectName: "",
    projectDescription: "",
    linkedProfile: "",
    videoLink: "",
    flowFileLink: "",
    deployedLink: "",
    instructionDocumentLink: "",
    backgroundImage: null,
    categories: [],
    tools: [],
    rating: 0,
  });

  const [newTool, setNewTool] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "AI Assistant",
    "Data Analysis",
    "Content Generation",
    "Automation",
    "Customer Service",
    "Marketing",
    "Development",
    "Design",
    "Research",
    "Other",
  ];

  // Fetch existing project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        const response = await fetch(
          `https://maheshaicommunity.onrender.com/api/projects/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }

        const data = await response.json();
        if (data.success) {
          const project = data.data;
          setAgentData({
            name: project.name || "",
            projectName: project.projectName || "",
            projectDescription: project.projectDescription || "",
            linkedProfile: project.linkedProfile || "",
            videoLink: project.videoLink || "",
            flowFileLink: project.flowFileLink || "",
            deployedLink: project.deployedLink || "",
            instructionDocumentLink: project.instructionDocumentLink || "",
            backgroundImage: null,
            existingImageUrl: project.backgroundImage?.url,
            categories: project.categories || [],
            tools: project.tools || [],
            rating: project.rating || 0,
          });
        }
      } catch (error: any) {
        console.error("Error fetching project:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleInputChange = (field: keyof AgentData, value: any) => {
    setAgentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setAgentData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleAddTool = () => {
    if (newTool.trim()) {
      setAgentData((prev) => ({
        ...prev,
        tools: [...prev.tools, newTool.trim()],
      }));
      setNewTool("");
    }
  };

  const handleRemoveTool = (index: number) => {
    setAgentData((prev) => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAgentData((prev) => ({
        ...prev,
        backgroundImage: file,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      // Add all form data
      formData.append("name", agentData.name);
      formData.append("projectName", agentData.projectName);
      formData.append("projectDescription", agentData.projectDescription);
      formData.append("linkedProfile", agentData.linkedProfile);
      formData.append("videoLink", agentData.videoLink);
      formData.append("flowFileLink", agentData.flowFileLink);
      formData.append("deployedLink", agentData.deployedLink);
      formData.append(
        "instructionDocumentLink",
        agentData.instructionDocumentLink
      );
      formData.append("categories", JSON.stringify(agentData.categories));
      formData.append("tools", JSON.stringify(agentData.tools));
      formData.append("rating", agentData.rating.toString());

      // Add image if new one is uploaded
      if (agentData.backgroundImage) {
        formData.append("backgroundImage", agentData.backgroundImage);
      }

      const response = await fetch(
        `https://maheshaicommunity.onrender.com/api/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update project");
      }

      const data = await response.json();
      if (data.success) {
        console.log("✅ Project updated successfully");
        navigate("/admin/dashboard");
      } else {
        throw new Error(data.message || "Failed to update project");
      }
    } catch (error: any) {
      console.error("❌ Error updating project:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
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
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Project
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Agent</h1>
          <p className="text-gray-600">Update your AI agent details</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={agentData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={agentData.projectName}
                  onChange={(e) =>
                    handleInputChange("projectName", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  value={agentData.projectDescription}
                  onChange={(e) =>
                    handleInputChange("projectDescription", e.target.value)
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describe your project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Linked Profile (Optional)
                </label>
                <input
                  type="url"
                  value={agentData.linkedProfile}
                  onChange={(e) =>
                    handleInputChange("linkedProfile", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://your-profile.com"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Links & Media
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Link (Optional)
                </label>
                <input
                  type="url"
                  value={agentData.videoLink}
                  onChange={(e) =>
                    handleInputChange("videoLink", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flow File Link (Optional)
                </label>
                <input
                  type="url"
                  value={agentData.flowFileLink}
                  onChange={(e) =>
                    handleInputChange("flowFileLink", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://flow-file.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deployed Link (Optional)
                </label>
                <input
                  type="url"
                  value={agentData.deployedLink}
                  onChange={(e) =>
                    handleInputChange("deployedLink", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://your-app.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruction Document Link (Optional)
                </label>
                <input
                  type="url"
                  value={agentData.instructionDocumentLink}
                  onChange={(e) =>
                    handleInputChange("instructionDocumentLink", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://docs.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image
                </label>
                {agentData.existingImageUrl && !agentData.backgroundImage && (
                  <div className="mb-4">
                    <img
                      src={`https://maheshaicommunity.onrender.com${agentData.existingImageUrl}`}
                      alt="Current background"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <p className="text-sm text-gray-500 mt-2">Current image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload a new image to replace the current one
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Categories & Tools
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        agentData.categories.includes(category)
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tools
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTool()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Add a tool"
                  />
                  <button
                    type="button"
                    onClick={handleAddTool}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agentData.tools.map((tool, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {tool}
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(index)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleInputChange("rating", star)}
                      className={`text-2xl ${
                        star <= agentData.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  "Update Agent"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAgent;

