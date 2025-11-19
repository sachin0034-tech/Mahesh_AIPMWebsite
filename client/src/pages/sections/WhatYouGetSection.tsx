import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const WhatYouGetSection = (): JSX.Element => {
  const mentorInfo = {
    name: "Mahesh",
    experience: "20+ years",
    companies: ["Google", "Meta", "Microsoft", "AWS AI teams"],
    description: [
      "Mahesh has 20+ years of experience in building products at Google, Meta, Microsoft, and AWS AI teams.",
      "Mahesh has worked in all layers of the AI stack, from AI chips to LLM and has a deep understanding of how using AI agents companies ship value to customers.",
      "His work on AI has been featured at the Nvidia GTC conference, Microsoft Build, and Meta blogs. His mentorship has helped various students build real-time products & careers in the Agentic AI PM space.",
    ],
    image: "/figmaAssets/image-3.png",
  };

  return (
    <section className="w-full bg-[#f7f4ee] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-[22px]">
          <div className="flex flex-col w-full lg:w-1/2 items-start gap-8 lg:gap-[67px] order-2 lg:order-1">
            <div className="flex items-start gap-5 lg:gap-20 w-full">
              <div className="flex flex-col items-start justify-center gap-6 lg:gap-8 w-full">
                <div className="relative w-full">
                  <div className="absolute w-[150px] sm:w-[180px] lg:w-[193px] h-[50px] sm:h-[60px] lg:h-[70px] top-0 right-0 lg:right-auto lg:left-[242px] bg-[#f7dad0]" />
                  <h2 className="relative font-['Gambetta-Medium',Helvetica] font-medium text-black text-2xl sm:text-3xl lg:text-4xl xl:text-[56px] text-center lg:text-left tracking-[-1.5px] sm:tracking-[-2px] lg:tracking-[-2.24px] leading-[1.2] z-10">
                    Meet your Mentor
                  </h2>
                </div>

                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="p-0">
                    <div className="font-['Manrope',Helvetica] font-normal text-mainblack-70 text-base sm:text-lg lg:text-xl xl:text-[32px] tracking-[-0.2px] sm:tracking-[-0.3px] lg:tracking-[-0.32px] leading-[1.4] lg:leading-[1.28] space-y-4 lg:space-y-6">
                      {mentorInfo.description.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div
            className="w-full lg:w-1/2 h-[300px] sm:h-[400px] lg:h-[730px] bg-cover bg-center rounded-lg order-1 lg:order-2"
            style={{ backgroundImage: `url(${mentorInfo.image})` }}
            aria-label={`Photo of ${mentorInfo.name}, mentor with ${mentorInfo.experience} of experience`}
          />
        </div>
      </div>
    </section>
  );
};
