import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BenefitsSection } from "./sections/BenefitsSection";
import { BonusSection } from "./sections/BonusSection";
import { CallToActionSection } from "./sections/CallToActionSection";
import { AdditionalResourcesSection } from "./sections/AdditionalResourcesSection";
// import { ChallengeSection } from "./sections/ChallengeSection";
import { FeaturesSection } from "./sections/FeaturesSection2.tsx";
import { IntroductionSection } from "./sections/IntroductionSection";
import { OfferDetailsSection } from "./sections/OfferDetailsSection";
import { TestimonialsSection } from "./sections/TestimonialsSection2.tsx";
import { JoinCohortModal } from "@/components/JoinCohortModal";
import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityBenefitsSection } from "./sections/CommunityBenefitsSection";
import { WhatYouGetSection } from "./sections/WhatYouGetSection";
import { PlatformPreviewSection } from "./sections/PlatformPreviewSection";
import { WhyChooseUs } from "./sections/WhyChooseUs";
import studentsImage from "/figmaAssets/students.png";

export const Bootcamp = (): JSX.Element => {
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
              {/* <Link to="/" className="text-black text-sm sm:text-base">
                AI Cohort
              </Link> */}
              <Link
                to="/bootcamp"
                className="text-[#E75A55] border-b-2 border-[#E75A55] pb-1 text-sm sm:text-base"
              >
                Bootcamp
              </Link>
              {/* <Link
                to="/agents"
                className="text-black text-sm sm:text-base hover:text-[#E75A55] transition-colors duration-200"
              >
                Explore Agents
              </Link> */}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto flex-1 justify-center">
            {/* Badge */}
            <Badge className="bg-[#DFCCFA2B] mb-4 sm:mb-6 py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm">
              <span className="bg-gradient-to-r from-[#E75A55] to-[#9747FF] bg-clip-text text-transparent">
              #1 Bootcamp building next wave of AI PMs
              </span>
            </Badge>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              AI PM Interview Prep{" "}
              <span className="bg-[linear-gradient(90deg,#F79009_-41.06%,#4A00E0_114.08%)] bg-clip-text text-transparent block sm:inline">
                Bootcamp
              </span>
            </h1>

            <p className="text-lg sm:text-xl mb-6 sm:mb-8 px-2 sm:px-0">
            <br>2 Week Bootcamp Starting 10th December</br>
            </p>

            {/* CTA Button */}
            <Button
              className="bg-gradient-to-r from-[#E75A55] to-[#9747FF] text-white px-4 sm:px-6 py-4 sm:py-6 rounded-md mb-8 sm:mb-12 text-sm sm:text-base"
              onClick={() => window.open('https://maven.com/mahesh-yadav/genaipm/8/join', '_blank')}
            >
              Apply Now <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>

            {/* Subtitle */}
            {/* <p className="text-gray-600 mb-4 sm:mb-6 text-xl sm:text-2xl px-4">
              Batch Capped at{" "}
              <span className="font-semibold text-black">60 students only</span>
            </p> */}

            {/* Testimonials */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-4">
              <div className="flex -space-x-3">
                <img
                  className="w-full"
                  alt="Container"
                  src={studentsImage}
                />
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex text-yellow-400 mb-1 text-lg sm:text-base">
                  ★★★★<span className="text-yellow-200">★</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Trusted by 3500+ students
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal component */}
      {/* <JoinCohortModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      /> */}
      <PlatformPreviewSection />
      {/* <FeaturesSection /> */}
      <OfferDetailsSection />
      <WhyChooseUs />
      <BonusSection />
      
      {/* <BenefitsSection /> */}
      {/* <OfferDetailsSection /> */}
      
      <CommunityBenefitsSection />
      {/* <WhyChooseUs /> */}
      <WhatYouGetSection />
      {/* <TestimonialsSection /> */}
     
      <AdditionalResourcesSection />
      <CallToActionSection />
      {/* <IntroductionSection /> */}
    </div>
  );
};