import { ArrowRightIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

export const FeaturesSection = (): JSX.Element => {
  return (
    <section className="py-12 lg:py-20 bg-[#ededed] w-full">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-8 lg:gap-16">
          <div className="flex flex-col items-center gap-6 lg:gap-8 text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-[64px] leading-tight lg:leading-[64px] tracking-[-2.56px] [font-family:'Gambetta-Medium',Helvetica]">
              <span className="font-medium tracking-[-1.64px]">
                Struggling to break into{" "}
              </span>
              <span className="[font-family:'Gambetta-Bold',Helvetica] font-bold tracking-[-1.64px]">
                AI Product roles
              </span>
              <span className="font-medium tracking-[-1.64px]">?</span>
            </h2>
            <p className="text-lg lg:text-xl tracking-[-0.20px] leading-[27px] text-mainblack-80 [font-family:'Manrope',Helvetica] px-4">
              You're not alone. If you're doing "all the right things" but still
              stuck, it's time to reset with a system that works.
            </p>
          </div>

          <div className="flex flex-col gap-12 lg:gap-20 w-full">
            <p className="text-2xl sm:text-3xl lg:text-[56px] leading-tight lg:leading-[62.7px] tracking-[-2.24px] [font-family:'Gambetta-Medium',Helvetica] text-center px-4">
              <span className="font-medium text-[#636363] tracking-[-1.25px]">
                This 3-week Bootcamp is built specifically for those hitting a
                wall in their AI PM journey —{" "}
              </span>
              <span className="font-medium text-[#0e0b0b] tracking-[-1.25px]">
                whether it's getting interviews, cracking them, or positioning
                yourself confidently in the GenAI and Agentic AI era.
              </span>
            </p>

            <div className="flex justify-center">
              <Button className="h-[50px] px-6 py-3 rounded-lg font-paragraph-l-medium text-white bg-[linear-gradient(90deg,rgba(247,144,9,1)_0%,rgba(74,0,224,1)_100%)] shadow-[1px_1px_4px_#0000001f,2px_6px_6px_#0000001a,5px_13px_9px_#0000000f,9px_24px_10px_#00000005,14px_37px_11px_transparent]"
               onClick={() => window.open('https://maven.com/mahesh-yadav/genaipm', '_blank')}
              >
                Apply Now
                <ArrowRightIcon className="ml-2 h-3 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
