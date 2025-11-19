import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const WhyChooseUs = (): JSX.Element => {
  const points = [
    {
      number: "01",
      text: "You're a traditional PM trying to break into AI PM and keep getting stuck at the screening or onsite stage.",
    },
    {
      number: "02",
      text: "You have ML, data, or analytics experience but aren't sure how to reposition it for GenAI and Agentic AI roles.",
    },
    {
      number: "03",
      text: "You've built or shipped AI features, but struggle to articulate that work clearly in interviews.",
    },
    {
      number: "04",
      text: "You're tired of the \"spray and pray\" job hunt—endless applications, networking, and posts with no real traction.",
    },
    {
      number: "05",
      text: "You've taken AI / AI PM courses before, but still feel underprepared when it comes to actual interviews.",
    },
  ];

  return (
    <section className="w-full bg-white py-12 lg:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Section - Image */}
          <div className="w-full">
            <Card className="bg-transparent border-0 rounded-3xl overflow-hidden shadow-none">
              <CardContent className="p-0">
                <div className="w-full h-full min-h-[350px] lg:min-h-[500px] rounded-3xl overflow-hidden">
                  <img
                    src="/figmaAssets/image-6.jpg"
                    alt="Why Choose Us"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Title and Points */}
          <div className="flex flex-col gap-8 lg:gap-10">
            <h2 className="text-3xl sm:text-4xl lg:text-[56px] font-bold text-black [font-family:'Gambetta-Bold',Helvetica] tracking-[-2.24px] leading-tight lg:leading-[67.2px]">
              Who This Bootcamp Is For
            </h2>

            <div className="flex flex-col gap-6">
              {points.map((point, index) => (
                <div
                  key={index}
                  className={`flex gap-6 pb-6 ${
                    index < points.length - 1 ? "border-b border-gray-200" : ""
                  }`}
                >
                  <span className="text-gray-400 text-2xl font-bold [font-family:'Gambetta-Bold',Helvetica] flex-shrink-0">
                    {point.number}.
                  </span>
                  <p className="text-lg lg:text-xl text-black/90 leading-relaxed [font-family:'Manrope',Helvetica]">
                    {point.text.split("**").map((part, i) => {
                      // Handle bold text if needed
                      if (i % 2 === 1) {
                        return (
                          <strong key={i} className="font-bold text-black">
                            {part}
                          </strong>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

