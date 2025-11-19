import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdditionalResourcesSection } from "./sections/AdditionalResourcesSection";
import { CommunityBenefitsSection } from "./sections/CommunityBenefitsSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { MentorSection } from "./sections/MentorSection";
import { ProgramHighlightsSection } from "./sections/ProgramHighlightsSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { WhatYouGetSection } from "./sections/WhatYouGetSection";
import { IntroductionSection } from "./sections/IntroductionSection";
import { JoinCohortModal } from "../components/JoinCohortModal";
import { ArrowRightIcon } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

export const AiCommunity = (): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasModalBeenClosed, setHasModalBeenClosed] = useState(false);

  useEffect(() => {
    // Show modal immediately when component mounts, but only if it hasn't been manually closed
    if (!hasModalBeenClosed) {
      setIsModalOpen(true);
    }
  }, [hasModalBeenClosed]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setHasModalBeenClosed(true); // Remember that user has manually closed the modal
  };

  return (
    <div className="flex flex-col w-full items-start">
      <section className="bg-[#f7f4ee] w-full relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 flex flex-col h-full">
          {/* Header/Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-16 gap-4">
            <div className="font-bold text-lg sm:text-xl tracking-tight">
              MYAICOMMUNITY
            </div>
            <div className="flex gap-4 sm:gap-6">
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

          {/* Main Content */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto flex-1 justify-center">
            {/* Badge */}
            <Badge className="bg-[#DFCCFA2B] mb-4 sm:mb-6 py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm">
              <span className="mr-2">🚀</span>
              <span className="bg-gradient-to-r from-[#E75A55] to-[#9747FF] bg-clip-text text-transparent">
                Building the Future of AI Products
              </span>
            </Badge>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-4">
              Be a part of next wave of
              <div className="bg-gradient-to-r from-[#E75A55] to-[#9747FF] bg-clip-text text-transparent">
                AI Product Builders
              </div>
            </h1>

            {/* CTA Button */}
            <Button
              className="bg-gradient-to-r from-[#E75A55] to-[#9747FF] text-white px-4 sm:px-6 py-4 sm:py-6 rounded-md mb-8 sm:mb-12 text-sm sm:text-base"
              onClick={() => window.open('https://maven.com/mahesh-yadav/genaipm', '_blank')}
            >
              Join the next cohort <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 text-center sm:text-left">
              {/* Subtitle */}
              <p className="text-gray-600 text-base sm:text-lg">
                Start building smarter, connected AI products
              </p>

              {/* Testimonials */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Image */}
                <div className="flex justify-center w-full sm:w-auto">
                  <img
                    className="w-full max-w-[180px] sm:max-w-[200px]"
                    alt="Container"
                    src="/figmaAssets/students.png"
                  />
                </div>

                {/* Star & Text */}
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex text-yellow-400 mb-1 text-lg sm:text-base">
                    ★★★★<span className="text-yellow-200">★</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Trusted by 1000+ students
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <FeaturesSection />
      <ProgramHighlightsSection />
      <MentorSection />
      <CommunityBenefitsSection />
      <WhatYouGetSection />
      <AdditionalResourcesSection />
      <TestimonialsSection />
      <IntroductionSection />
      
      {/* Modal component */}
      <JoinCohortModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};