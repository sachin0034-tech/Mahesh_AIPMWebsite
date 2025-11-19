import { ArrowRightIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

export const TestimonialsSection = (): JSX.Element => {
  return (
    <section className="bg-[#f7f4ee] py-12 lg:py-20 w-full">
      <div className="container mx-auto max-w-[1280px] flex flex-col items-center gap-8 lg:gap-16 px-4">
        <div className="flex flex-col w-full gap-8 lg:gap-16">
          <h2 className="font-['Gambetta-Regular',Helvetica] text-3xl sm:text-4xl lg:text-[56px] leading-tight lg:leading-[62.7px] tracking-[-2.24px] text-center lg:text-left">
            <span className="text-[#636363]">
              You don&#39;t need to &#34;fake it till you make it.&#34;
              <br />
            </span>
            <span className="text-black">You just need the right roadmap</span>
            <span className="text-[#636363]">.</span>
          </h2>

          <div className="flex justify-center lg:justify-start items-end w-full">
            <Button className="bg-[linear-gradient(90deg,rgba(247,144,9,1)_0%,rgba(74,0,224,1)_100%)] h-[50px] px-6 py-3 rounded-lg shadow-[1px_1px_4px_#0000001f,2px_6px_6px_#0000001a,5px_13px_9px_#0000000f,9px_24px_10px_#00000005,14px_37px_11px_transparent] hover:opacity-90 transition-opacity"
             onClick={() => window.open('https://maven.com/mahesh-yadav/genaipm', '_blank')}
            >
              <span className="font-paragraph-l-medium text-white whitespace-nowrap">
                Apply Now
              </span>
              <ArrowRightIcon className="ml-2 h-3 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
