import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";


export const TestimonialsSection = (): JSX.Element => {
  return (
    <section className="w-full bg-white py-6 sm:py-8 lg:py-10">
      <Card className="mx-auto max-w-7xl bg-[#f7f4ee] rounded-3xl overflow-hidden border-none">
        <CardContent className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
            <h2 className="max-w-[900px] mx-auto [font-family:'Gambetta-Medium',Helvetica] font-medium text-black text-3xl sm:text-4xl lg:text-5xl xl:text-7xl tracking-[-0.5px] sm:tracking-[-0.6px] lg:tracking-[-0.72px] leading-[1.2] px-4">
              Ready to Build AI Products That Actually Matters?
            </h2>
            <p className="mt-6 sm:mt-8 [font-family:'Manrope',Helvetica] font-medium text-mainblack-80 text-lg sm:text-xl tracking-[-0.20px] leading-8 px-4">
              Limited spots are available. Apply early to secure your seat.
            </p>

            <Button
               onClick={() => window.open('https://maven.com/mahesh-yadav/genaipm', '_blank')}
              className="mt-6 sm:mt-8 w-full sm:w-auto px-6 py-4 sm:py-6 h-auto rounded-lg shadow-[1px_1px_4px_#0000001f,2px_6px_6px_#0000001a,5px_13px_9px_#0000000f,9px_24px_10px_#00000005,14px_37px_11px_transparent] bg-[linear-gradient(90deg,rgba(247,144,9,1)_0%,rgba(74,0,224,1)_100%)] hover:bg-[linear-gradient(90deg,rgba(247,144,9,0.9)_0%,rgba(74,0,224,0.9)_100%)]"
            >
              <span className="font-paragraph-l-medium font-[number:var(--paragraph-l-medium-font-weight)] text-white text-[length:var(--paragraph-l-medium-font-size)] tracking-[var(--paragraph-l-medium-letter-spacing)] leading-[var(--paragraph-l-medium-line-height)]">
                Join the next cohort
              </span>
              <img
                className="ml-2 w-[12px] h-[10px] sm:w-[14.42px] sm:h-[11.72px]"
                alt="Vector"
                src="/figmaAssets/vector.svg"
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
