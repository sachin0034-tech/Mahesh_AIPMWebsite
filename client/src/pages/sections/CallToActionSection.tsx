import { ArrowRightIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const CallToActionSection = (): JSX.Element => {
  return (
    <section className="w-full py-8 lg:py-12 bg-white px-4">
      <Card className="mx-auto max-w-7xl bg-[#f7f4ee] border-none rounded-3xl overflow-hidden">
        <CardContent className="p-6 lg:p-10 flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-7xl font-medium tracking-[-0.72px] leading-tight lg:leading-[86.4px] mb-6 lg:mb-8 max-w-4xl mx-auto font-['Gambetta-Medium',Helvetica]">
            Ready to Make the Leap into an AI PMs Role?
          </h2>

          <p className="text-lg lg:text-xl font-medium text-mainblack-80 tracking-[-0.20px] leading-7 lg:leading-8 mb-8 lg:mb-10 font-['Manrope',Helvetica] px-4">
            Limited spots are available. Apply early to secure your seat.
          </p>

          <Button className="bg-[linear-gradient(90deg,rgba(247,144,9,1)_0%,rgba(74,0,224,1)_100%)] text-white px-6 py-3 h-[50px] rounded-lg shadow-[1px_1px_4px_#0000001f,2px_6px_6px_#0000001a,5px_13px_9px_#0000000f,9px_24px_10px_#00000005,14px_37px_11px_transparent] hover:opacity-90 transition-opacity"
           onClick={() => window.open('https://maven.com/mahesh-yadav/genaipm/8/join', '_blank')}
          >
            <span className="font-paragraph-l-medium text-[18px] tracking-[-0.18px] leading-[27px]">
              Join the next bootcamp
            </span>
            <ArrowRightIcon className="ml-2 h-3 w-4" />
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};
