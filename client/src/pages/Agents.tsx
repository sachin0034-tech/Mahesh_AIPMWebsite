import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProjectDetail from "./ProjectDetail";
import ShowProjects from "./sections/AgentPage/showProjects";
import { CallToActionSection } from "./sections/CallToActionSection";

// Combined Header and Hero Section Component
const HeaderHeroSection = () => {
  return (
    <div className="overflow-x-hidden bg-[#f7f4ee]">
      {/* Header */}
      <header className="relative py-4 md:py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between">
            <div className="flex-shrink-0">
              <div className="font-bold text-lg sm:text-xl tracking-tight">
                MYAICOMMUNITY
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6 items-center">
              <Link to="/" className="text-black text-sm sm:text-base">
                AI Cohort
              </Link>
              <Link to="/bootcamp" className="text-black text-sm sm:text-base">
                Bootcamp
              </Link>
              <Link
                to="/agents"
                className="text-[#E75A55] border-b-2 border-[#E75A55] pb-1 text-sm sm:text-base"
              >
                Explore Agents
              </Link>
              <div className="relative group">
                <Link
                  to="/admin-login"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                  aria-label="Admin Login"
                >
                  {/* You'll need to import 'User' from 'lucide-react' at the top of the file:
                  import { User } from "lucide-react";
                  */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 text-gray-700"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </Link>
                <div className="absolute right-1/2 translate-x-1/2 top-full mt-2 w-auto p-2 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                  Admin Login
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:pt-20 xl:pb-0">
        <div className="relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-flex px-4 py-2 text-base text-gray-900 border border-gray-200 rounded-full font-pj">
              Built for the AI community
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight font-pj">
              I'm building an AI agent place for the community
            </h1>
            <p className="max-w-md mx-auto mt-6 text-base leading-7 text-gray-600 font-inter">
              Where people can share their AI projects and others can discover,
              use, and learn from innovative AI agents and automation solutions.
            </p>

            <div className="relative inline-flex mt-10 group">
              <div className="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>

              <a
                href="https://forms.gle/LxNBUSgRuN9mgsUr7"
                title=""
                className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                role="button"
              >
                Share Your AI Project
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-20">
          <img
            className="object-cover object-top w-full h-auto mx-auto scale-150 2xl:max-w-screen-2xl xl:scale-100"
            src="https://d33wubrfki0l68.cloudfront.net/54780decfb9574945bc873b582cdc6156144a2ba/d9fa1/images/hero/4/illustration.png"
            alt=""
          />
        </div>
      </section>
    </div>
  );
};

// Projects Section Component
const ProjectsSection = ({
  onViewProject,
}: {
  onViewProject: (projectId: string) => void;
}) => {
  return (
    <div className="mt-16">
      <ShowProjects onViewProject={onViewProject} />
    </div>
  );
};

// Main Agents Component
export const Agents = (): JSX.Element => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const handleViewProject = (projectId: string) => {
    console.log("View project:", projectId);
    setSelectedProjectId(projectId);
  };

  const handleBackToAgents = () => {
    setSelectedProjectId(null);
  };

  // Show project detail if a project is selected
  if (selectedProjectId) {
    return (
      <ProjectDetail
        projectId={selectedProjectId}
        onBack={handleBackToAgents}
      />
    );
  }

  return (
    <div className="flex flex-col w-full items-start">
      <section className="bg-white w-full relative">
        {/* Combined Header and Hero Section */}
        <HeaderHeroSection />

        {/* Projects Section */}
        <ProjectsSection onViewProject={handleViewProject} />

        <CallToActionSection />
      </section>
    </div>
  );
};
