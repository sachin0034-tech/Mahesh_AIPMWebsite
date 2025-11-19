import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const MentorSection = (): JSX.Element => {
  // Learning outcomes data for mapping
  const learningOutcomes = [
    {
      id: 1,
      content: "You learn to scope-AI native Use cases",
    },
    {
      id: 2,
      content: "You learn Frameworks to assess feasibility & Impact",
    },
    {
      id: 3,
      content: "You learn to create & evaluate AI Agents",
    },
    {
      id: 4,
      content: "You get ready with your own PRD/Prototype of AI Product",
    },
  ];

  return (
    <section className="w-full bg-[#f7f4ee] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto flex flex-col items-center gap-12 sm:gap-16 lg:gap-[72px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-[72px] w-full">
          <div className="flex flex-col items-center lg:items-start gap-6 sm:gap-8 flex-1 order-2 lg:order-1">
            <div className="relative">
              <div className="absolute w-24 sm:w-32 lg:w-40 h-[40px] sm:h-[50px] lg:h-[65px] top-[60px] sm:top-[70px] lg:top-[86px] left-0 " />
              <h2 className="relative [font-family:'Gambetta-Medium',Helvetica] font-medium text-black text-3xl sm:text-4xl lg:text-5xl xl:text-[64px] tracking-[-1.5px] sm:tracking-[-2px] lg:tracking-[-2.56px] leading-[1.2] text-center lg:text-left">
                What You&#39;ll Learn
              </h2>
            </div>
          </div>

          <img
            className="w-full max-w-[500px] lg:max-w-[807px] h-auto object-contain order-1 lg:order-2"
            alt="Learning illustration"
            src="/figmaAssets/image-2.png"
          />
        </div>

        <Card className="w-full bg-white rounded-2xl p-3 sm:p-4 lg:p-5">
          <CardContent className="p-1 sm:p-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {learningOutcomes.map((outcome) => (
                <Card
                  key={outcome.id}
                  className="min-h-[280px] sm:min-h-[320px] lg:h-[401px] bg-[#f3f4fa] rounded-2xl"
                >
                  <CardContent className="flex items-center justify-center h-full p-6 sm:p-8 lg:p-10">
                    <div className="text-center">
                      <h3 className="[font-family:'Gambetta-Medium',Helvetica] font-medium text-black text-xl sm:text-2xl lg:text-3xl xl:text-[40px] tracking-[-0.8px] sm:tracking-[-1.2px] lg:tracking-[-1.60px] leading-[1.2]">
                        {outcome.content}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
