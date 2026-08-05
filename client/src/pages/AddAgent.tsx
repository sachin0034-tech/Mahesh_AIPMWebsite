import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../lib/api";

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
  agentInstructions: string;
  backgroundImage: File | null;
  categories: string[];
  tools: string[];

  // Step 3
  rating: number;
}

// ─── Predefined instruction templates ────────────────────────────────────────

interface InstructionTemplate {
  id: string;
  name: string;
  industry: string;
  emoji: string;
  description: string;
  instructions: string;
}

const INSTRUCTION_TEMPLATES: InstructionTemplate[] = [
  {
    id: "haynes-mechanical",
    name: "Haynes Mechanical",
    industry: "HVAC & Plumbing",
    emoji: "🔧",
    description: "Customer service agent for a mechanical contracting company",
    instructions: `You are a helpful customer service assistant for Haynes Mechanical, a professional HVAC and plumbing contracting company. Your role is to assist customers with:

- Scheduling service appointments for heating, cooling, and plumbing issues
- Answering questions about HVAC systems (furnaces, air conditioners, heat pumps)
- Providing basic troubleshooting guidance before a technician arrives
- Explaining the services offered: installation, maintenance, and repair
- Providing information about maintenance plans and warranties
- Collecting contact details and describing the issue to prepare a service request

Tone: Friendly, professional, and reassuring. Customers may be stressed due to a broken system, so be empathetic and solution-focused.

Always ask for:
1. The customer's name and contact number
2. The property address
3. A brief description of the issue (e.g., no heat, AC not cooling, leaking pipe)
4. Preferred appointment time

If the issue sounds like an emergency (gas leak, flooding, no heat in winter), escalate immediately and provide the emergency contact number.`,
  },
  {
    id: "ecommerce-store",
    name: "E-Commerce Store",
    industry: "Retail & Shopping",
    emoji: "🛒",
    description: "Order support and product discovery agent for online stores",
    instructions: `You are a smart shopping assistant for an e-commerce store. Your goal is to help customers have the best shopping experience possible.

You can help customers with:
- Finding products that match their needs, budget, and preferences
- Checking order status and tracking shipments
- Explaining return, refund, and exchange policies
- Answering questions about product specifications and compatibility
- Applying promo codes and explaining current discounts
- Resolving payment and checkout issues

Tone: Upbeat, helpful, and efficient. Customers value speed — get to the point quickly and offer clear next steps.

Key guidelines:
- Always confirm the order number before discussing order details
- If a product is out of stock, proactively suggest alternatives
- For returns, collect the order number, item name, and reason for return
- Never share another customer's order or personal information
- Escalate billing disputes or fraud concerns to the human support team`,
  },
  {
    id: "healthcare-clinic",
    name: "Healthcare Clinic",
    industry: "Medical & Health",
    emoji: "🏥",
    description: "Appointment booking and FAQ agent for medical clinics",
    instructions: `You are a patient support assistant for a healthcare clinic. You help patients navigate their care in a respectful and HIPAA-conscious manner.

You can assist with:
- Scheduling, rescheduling, and cancelling appointments
- Answering general questions about services offered (primary care, specialists, etc.)
- Explaining what to bring to an appointment (insurance card, ID, referral)
- Providing clinic hours, location, and parking information
- Sending prescription refill requests to the appropriate department
- Answering insurance and billing FAQs

Tone: Calm, compassionate, and clear. Patients may be anxious — be patient and avoid medical jargon.

Important rules:
- Never provide medical diagnoses or specific medical advice
- Do not share any patient health information with third parties
- For urgent or emergency symptoms, immediately direct the patient to call 911 or go to the nearest ER
- Always verify identity (name + date of birth) before accessing appointment details
- All medication questions beyond refill requests should be directed to the clinical team`,
  },
  {
    id: "real-estate",
    name: "Real Estate Agency",
    industry: "Property & Real Estate",
    emoji: "🏠",
    description: "Property search and lead qualification agent for realtors",
    instructions: `You are a real estate assistant helping buyers, sellers, and renters navigate the property market. Your goal is to match people with the right properties and connect them with an agent.

You can help with:
- Searching for properties based on budget, location, bedrooms, and preferences
- Explaining the home buying and selling process step by step
- Scheduling property viewings and open house visits
- Answering questions about mortgage pre-approval and financing options
- Providing neighborhood information (schools, transit, amenities)
- Collecting lead information to connect prospects with a licensed agent

Tone: Knowledgeable, warm, and trustworthy. Real estate is a major financial decision — be thorough and never rush the customer.

Lead qualification questions to ask:
1. Are you looking to buy, sell, or rent?
2. What is your target location or neighborhood?
3. What is your budget or price range?
4. What is your timeline? (e.g., moving in 30 days vs. 6 months)
5. Have you been pre-approved for a mortgage?

Always end conversations by offering to connect the customer with one of our licensed agents for a free consultation.`,
  },
];

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
    agentInstructions: "",
    backgroundImage: null,
    categories: [],
    tools: [],
    rating: 0,
  });

  const [newTool, setNewTool] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

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
      formData.append("agentInstructions", agentData.agentInstructions);
      formData.append("categories", JSON.stringify(agentData.categories));
      formData.append("tools", JSON.stringify(agentData.tools));
      formData.append("rating", agentData.rating.toString());

      if (agentData.backgroundImage) {
        formData.append("backgroundImage", agentData.backgroundImage);
        console.log("📸 Image attached:", agentData.backgroundImage.name);
      }

      console.log(
        "🌐 Making API request to:", `${API_BASE_URL}/projects`
      );

      const response = await fetch(`${API_BASE_URL}/projects`, {
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
          agentInstructions: "",
          backgroundImage: null,
          categories: [],
          tools: [],
          rating: 0,
        });
        setSelectedTemplateId(null);
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

      {/* ── Agent Instructions with Template Picker ── */}
      <div>
        <label className="block text-sm font-medium text-orange-700 mb-1">
          Agent Instructions
        </label>
        <p className="text-xs text-orange-500 mb-3">
          Define how your agent should behave. Pick a template below to get started, then customize it.
        </p>

        {/* Template Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {INSTRUCTION_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setSelectedTemplateId(tpl.id);
                handleInputChange("agentInstructions", tpl.instructions);
              }}
              className={`text-left px-4 py-3 rounded-2xl border-2 transition-all duration-150 ${
                selectedTemplateId === tpl.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{tpl.emoji}</span>
                <span className="font-semibold text-orange-900 text-sm">{tpl.name}</span>
                {selectedTemplateId === tpl.id && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-orange-600 font-medium uppercase tracking-wide">{tpl.industry}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tpl.description}</p>
            </button>
          ))}
        </div>

        {/* Instructions Textarea */}
        <textarea
          value={agentData.agentInstructions}
          onChange={(e) => {
            setSelectedTemplateId(null);
            handleInputChange("agentInstructions", e.target.value);
          }}
          rows={10}
          className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-mono text-sm"
          placeholder="Describe how your agent should behave, what it can help with, its tone, and any rules it must follow..."
        />
        {agentData.agentInstructions && (
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={() => {
                handleInputChange("agentInstructions", "");
                setSelectedTemplateId(null);
              }}
              className="text-xs text-orange-400 hover:text-orange-600 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
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
          {agentData.agentInstructions && (
            <div className="md:col-span-2">
              <span className="font-medium text-orange-700">Agent Instructions:</span>
              <p className="text-orange-900 whitespace-pre-wrap text-xs mt-1 bg-white rounded-xl p-3 border border-orange-100 max-h-40 overflow-y-auto">
                {agentData.agentInstructions}
              </p>
            </div>
          )}
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
