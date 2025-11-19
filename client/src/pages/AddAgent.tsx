import React, { useState } from "react";
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
  categories: string[];
  tools: string[];

  // Step 3
  rating: number;
}

const AddAgent: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    console.log("🚀 Starting agent submission...");
    setIsSubmitting(true);

    try {
      // Log the current agent data
      console.log("📝 Agent data to submit:", {
        ...agentData,
        backgroundImage: agentData.backgroundImage
          ? {
              name: agentData.backgroundImage.name,
              size: agentData.backgroundImage.size,
              type: agentData.backgroundImage.type,
            }
          : null,
      });

      // Check authentication token
      const token = localStorage.getItem("authToken");
      console.log("🔐 Auth token exists:", !!token);
      if (token) {
        console.log("🔐 Token preview:", token.substring(0, 20) + "...");
      }

      // Create FormData for file upload
      const formData = new FormData();
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

      if (agentData.backgroundImage) {
        formData.append("backgroundImage", agentData.backgroundImage);
        console.log("📸 Image attached:", agentData.backgroundImage.name);
      }

      console.log(
        "🌐 Making API request to: https://maheshaicommunity.onrender.com/api/projects"
      );

      const response = await fetch("https://maheshaicommunity.onrender.com/api/projects", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Response status:", response.status);
      console.log(
        "📡 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const responseData = await response.json();
      console.log("📡 Response data:", responseData);

      if (response.ok) {
        console.log("✅ Agent published successfully!");
        alert("Agent published successfully!");

        // Reset form
        setAgentData({
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
        setCurrentStep(1);
      } else {
        console.error("❌ Server responded with error:", responseData);
        throw new Error(responseData.message || "Failed to publish agent");
      }
    } catch (error) {
      console.error("💥 Error publishing agent:", error);
      console.error("💥 Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      alert(`Failed to publish agent: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      console.log("🏁 Submission process completed");
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-orange-900 mb-6">
        Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-orange-700 mb-2">
            Agent Name *
          </label>
          <input
            type="text"
            value={agentData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="Enter agent name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-orange-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={agentData.projectName}
            onChange={(e) => handleInputChange("projectName", e.target.value)}
            className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="Enter project name"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-orange-700 mb-2">
          Project Description *
        </label>
        <textarea
          value={agentData.projectDescription}
          onChange={(e) =>
            handleInputChange("projectDescription", e.target.value)
          }
          rows={4}
          className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          placeholder="Describe the project in detail"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-orange-700 mb-2">
          Linked Profile URL
        </label>
        <input
          type="url"
          value={agentData.linkedProfile}
          onChange={(e) => handleInputChange("linkedProfile", e.target.value)}
          className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          placeholder="https://linkedin.com/in/username"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-orange-900 mb-6">
        Project Details & Resources
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-orange-700 mb-2">
            Video Link URL
          </label>
          <input
            type="url"
            value={agentData.videoLink}
            onChange={(e) => handleInputChange("videoLink", e.target.value)}
            className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-orange-700 mb-2">
            Flow File Link
          </label>
          <input
            type="url"
            value={agentData.flowFileLink}
            onChange={(e) => handleInputChange("flowFileLink", e.target.value)}
            className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="https://drive.google.com/file/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-orange-700 mb-2">
            Deployed Link
          </label>
          <input
            type="url"
            value={agentData.deployedLink}
            onChange={(e) => handleInputChange("deployedLink", e.target.value)}
            className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="https://your-app.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-orange-700 mb-2">
            Instruction Document Link
          </label>
          <input
            type="url"
            value={agentData.instructionDocumentLink}
            onChange={(e) =>
              handleInputChange("instructionDocumentLink", e.target.value)
            }
            className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="https://docs.google.com/document/..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-orange-700 mb-2">
          Upload Background Image
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-orange-200 border-dashed rounded-2xl hover:border-orange-300 transition-colors">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-orange-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-orange-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-orange-500">PNG, JPG, GIF up to 10MB</p>
            {agentData.backgroundImage && (
              <p className="text-sm text-green-600 font-medium">
                Selected: {agentData.backgroundImage.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-orange-700 mb-3">
          Select Categories
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryToggle(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                agentData.categories.includes(category)
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-orange-700 mb-2">
          Tools Used
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTool}
            onChange={(e) => setNewTool(e.target.value)}
            className="flex-1 px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="Add a tool (e.g., React, Python, OpenAI API)"
            onKeyPress={(e) => e.key === "Enter" && handleAddTool()}
          />
          <button
            type="button"
            onClick={handleAddTool}
            className="px-6 py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-colors font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {agentData.tools.map((tool, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
            >
              {tool}
              <button
                type="button"
                onClick={() => handleRemoveTool(index)}
                className="ml-2 text-orange-600 hover:text-orange-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-orange-900 mb-6">
        Review & Publish
      </h3>

      <div className="bg-orange-50 rounded-2xl p-6 space-y-4">
        <h4 className="text-lg font-semibold text-orange-900">
          Project Summary
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-orange-700">Agent Name:</span>
            <p className="text-orange-900">
              {agentData.name || "Not provided"}
            </p>
          </div>
          <div>
            <span className="font-medium text-orange-700">Project Name:</span>
            <p className="text-orange-900">
              {agentData.projectName || "Not provided"}
            </p>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-orange-700">Description:</span>
            <p className="text-orange-900">
              {agentData.projectDescription || "Not provided"}
            </p>
          </div>
          <div>
            <span className="font-medium text-orange-700">Categories:</span>
            <p className="text-orange-900">
              {agentData.categories.join(", ") || "None selected"}
            </p>
          </div>
          <div>
            <span className="font-medium text-orange-700">Tools:</span>
            <p className="text-orange-900">
              {agentData.tools.join(", ") || "None added"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-orange-700 mb-3">
          Set Rating (1-5 stars)
        </label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleInputChange("rating", star)}
              className={`text-3xl transition-colors ${
                star <= agentData.rating
                  ? "text-orange-500"
                  : "text-orange-200 hover:text-orange-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-sm text-orange-600 mt-2">
          Current rating: {agentData.rating} star
          {agentData.rating !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-orange-200/50">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-orange-900">
              Add New Agent
            </h2>
            <span className="text-orange-600 font-medium">
              Step {currentStep} of 3
            </span>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="min-h-[500px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-orange-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-2xl font-medium transition-colors ${
              currentStep === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-4">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-colors font-medium"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-2xl font-medium transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {isSubmitting ? "Publishing..." : "Publish Agent"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAgent;
