import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";


export const FeaturesSection = (): JSX.Element => {
  // Feature benefits data
  const benefits = [
    { text: "Save $1500 instantly" },
    { text: "Includes all features from both programs" },
    {
      text: "Get Free 1:1 with Mahesh ",
      highlight: "(Worth $1000)",
      isHighlighted: true,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 px-4 sm:px-8 lg:px-20 py-6 relative self-stretch w-full bg-white">
      <div className="flex flex-col w-full lg:w-[565px] items-start gap-6 lg:gap-10 relative">
        <div className="flex flex-col items-start justify-center gap-4 relative self-stretch w-full">
          <Badge className="bg-[#fde1e1d9] text-[#e22d30] hover:bg-[#fde1e1d9] px-3 py-1 rounded-[99px] font-paragraph-m-regular text-[length:var(--paragraph-m-regular-font-size)] tracking-[var(--paragraph-m-regular-letter-spacing)] leading-[var(--paragraph-m-regular-line-height)]">
            Seats Filling Fast
          </Badge>
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold  leading-tight px-4">
            Get Bundle for just
            <span className="block">
              <span className="relative bg-gradient-to-r from-[#E75A55] to-[#9747FF] bg-clip-text text-transparent before:absolute before:top-1/2 before:left-0 before:w-full before:h-0.5 before:bg-gradient-to-r before:from-[#E75A55] before:to-[#9747FF] before:-translate-y-1/2">
                $4500
              </span>
              <span className="bg-gradient-to-r from-[#E75A55] to-[#9747FF] bg-clip-text text-transparent">
                {" "}
                $1999
              </span>
            </span>
          </p>
        </div>

        <div className="flex flex-col items-start gap-6 relative">
          <div className="inline-flex flex-col items-start gap-4 lg:gap-6 relative">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 relative">
                <img
                  className="relative w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] flex-shrink-0 mt-1"
                  alt="Check circle"
                  src="/figmaAssets/check-circle-1--streamline-ultimate-1.svg"
                />
                <div className="[font-family:'Manrope',Helvetica] font-normal text-sm sm:text-base tracking-[-0.16px] leading-5 sm:leading-6">
                  {benefit.isHighlighted ? (
                    <>
                      <span className="text-[#454545cc] tracking-[-0.03px]">
                        {benefit.text}
                      </span>
                      <span className="font-semibold text-[#000000cc] tracking-[-0.03px]">
                        {benefit.highlight}
                      </span>
                    </>
                  ) : (
                    <span className="text-[#454545cc]">{benefit.text}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
           onClick={() => window.open('https://maven.com/mahesh-yadav/genaipm', '_blank')}
          className="h-[44px] sm:h-[50px] w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg shadow-[1px_1px_4px_#0000001f,2px_6px_6px_#0000001a,5px_13px_9px_#0000000f,9px_24px_10px_#00000005,14px_37px_11px_transparent] bg-[linear-gradient(90deg,rgba(247,144,9,1)_0%,rgba(74,0,224,1)_100%)] hover:bg-[linear-gradient(90deg,rgba(247,144,9,1)_0%,rgba(74,0,224,1)_100%)]"
        >
          <span className="font-paragraph-l-medium font-[number:var(--paragraph-l-medium-font-weight)] text-white text-[length:var(--paragraph-l-medium-font-size)] tracking-[var(--paragraph-l-medium-letter-spacing)] leading-[var(--paragraph-l-medium-line-height)] whitespace-nowrap">
            Enroll Now
          </span>
          <img
            className="relative w-[12px] h-[10px] sm:w-[14.42px] sm:h-[11.72px] ml-2.5"
            alt="Vector"
            src="/figmaAssets/vector.svg"
          />
        </Button>
      </div>

      <Card className="relative w-full lg:flex-1 h-[400px] sm:h-[500px] lg:h-[702px] bg-mainblack-10 border-none">
        <div className="flex flex-col w-full max-w-[513px] items-center lg:items-start gap-8 lg:gap-[159px] relative top-[21px] left-1/2 lg:left-[61px] transform -translate-x-1/2 lg:translate-x-0 px-4 lg:px-0">
          <img
            className="relative w-full max-w-[400px] lg:max-w-none h-auto lg:h-[226px] object-contain"
            alt="Image"
            src="/figmaAssets/image.png"
          />

          <img
            className="relative w-full max-w-[400px] lg:max-w-none h-auto lg:h-[246px] object-contain"
            alt="Image"
            src="/figmaAssets/image-1.png"
          />

          <img
            className="absolute w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[137px] lg:h-[137px] top-[180px] sm:top-[220px] lg:top-[237px] left-1/2 lg:left-[188px] transform -translate-x-1/2 lg:translate-x-0"
            alt="Add streamline"
            src="/figmaAssets/add--streamline-ultimate-1.svg"
          />
        </div>
      </Card>
    </div>
  );
};
