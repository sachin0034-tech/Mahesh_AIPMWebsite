import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const AdminLoginPage = (): JSX.Element => {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.email, formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error is handled by the AuthContext
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex flex-col w-full items-start">
      <section className="bg-[#f7f4ee] w-full relative min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 flex flex-col h-full">
          {/* Header/Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-16 gap-4">
            <div className="font-bold text-lg sm:text-xl tracking-tight">
              MYAICOMMUNITY
            </div>
            <div className="flex gap-4 sm:gap-6 items-center">
              <Link
                to="/"
                className="text-[#E75A55] border-b-2 border-[#E75A55] pb-1 text-sm sm:text-base"
              >
                AI Cohort
              </Link>
              <Link to="/bootcamp" className="text-black text-sm sm:text-base">
                Bootcamp
              </Link>
              <Link
                to="/agents"
                className="text-black text-sm sm:text-base hover:text-[#E75A55] transition-colors duration-200"
              >
                Explore Agents
              </Link>
            </div>
          </div>

          {/* Login Form Section */}
          <div className="flex items-center justify-center min-h-[70vh] w-full">
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 mx-4">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Admin Sign In
                  </h1>
                  <p className="text-gray-600">
                    Enter your credentials to access the admin panel
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75A55] focus:border-transparent outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="admin@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75A55] focus:border-transparent outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 text-[#E75A55] focus:ring-[#E75A55] border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <a
                        href="#"
                        className="font-medium text-[#E75A55] hover:text-[#c4453a] transition-colors duration-200"
                      >
                        Forgot your password?
                      </a>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#E75A55] to-[#9747FF] text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-[#c4453a] hover:to-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75A55] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Need help?{" "}
                    <a
                      href="#"
                      className="font-medium text-[#E75A55] hover:text-[#c4453a] transition-colors duration-200"
                    >
                      Contact Support
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
