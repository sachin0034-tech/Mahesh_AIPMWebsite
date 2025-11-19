import { ArrowRightIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const ProgramHighlightsSection = (): JSX.Element => {
  // Data for the highlight cards
  const highlightCards = [
    {
      number: "1",
      title: "You're building the future with AI",
      description:
        "You're a developer, product manager, or technical leader working on AI-powered applications that go beyond simple chat interfaces.",
      bgColor: "bg-[#f9f7f3]",
    },
    {
      number: "2",
      title: "You're ready to go deeper",
      description:
        "You want to create sophisticated AI systems that integrate with real-world tools, databases, and workflows not just another basic chatbot.",
      bgColor: "bg-[#f3f9f7]",
    },
    {
      number: "3",
      title: "You value collaboration",
      description:
        "You thrive in technical communities where you can share challenges, learn from peers, and push the boundaries of what's possible with AI.",
      bgColor: "bg-[#f3f3f9]",
    },
    {
      number: "4",
      title: "You're hands-on and driven",
      description:
        "You're actively building, experimenting, and implementing AI solutions. You learn by doing and want to connect with others who share that approach.",
      bgColor: "bg-[#edf8f6]",
    },
  ];

  return (
    <section className="w-full bg-[#ededed] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title section with decorative element */}
        <div className="relative flex flex-col items-center mb-12 lg:mb-16">
          <div className="absolute w-[200px] sm:w-[300px] lg:w-[378px] h-[50px] sm:h-[60px] lg:h-[70px] top-0 right-0 sm:right-10 lg:right-20 " />
          <h2 className="relative [font-family:'Gambetta-Medium',Helvetica] font-medium text-black text-3xl sm:text-4xl lg:text-5xl xl:text-[64px] text-center tracking-[-1.5px] sm:tracking-[-2px] lg:tracking-[-2.56px] leading-[1.2] px-4">
            Is This Community Right for You?
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-12 lg:mb-16">
          {highlightCards.map((card, index) => (
            <Card
              key={`highlight-card-${index}`}
              className={`${card.bgColor} border-none rounded-2xl shadow-none`}
            >
              <CardContent className="flex flex-col items-center justify-center gap-6 sm:gap-8 lg:gap-12 px-6 sm:px-8 lg:px-10 py-8 sm:py-10 min-h-[280px] sm:min-h-[300px] lg:h-[315px]">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] bg-white rounded-full">
                    <span className="[font-family:'Onest',Helvetica] font-semibold text-black text-3xl sm:text-4xl lg:text-5xl tracking-[-0.48px] leading-[27px]">
                      {card.number}
                    </span>
                  </div>
                  <h3 className="[font-family:'Gambetta-Medium',Helvetica] font-medium text-black text-xl sm:text-2xl lg:text-[32px] text-center tracking-[-0.8px] sm:tracking-[-1px] lg:tracking-[-1.28px] leading-tight">
                    {card.title}
                  </h3>
                </div>
                <p className="[font-family:'Manrope',Helvetica] font-normal text-[#454545cc] text-sm sm:text-base text-center tracking-[-0.14px] leading-6">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-8 sm:gap-12 lg:gap-16">
          <h2 className="[font-family:'Gambetta-Bold',Helvetica] font-bold text-black text-2xl sm:text-3xl lg:text-4xl xl:text-[56px] tracking-[-1.5px] sm:tracking-[-2px] lg:tracking-[-2.24px] leading-[1.2] text-center lg:text-left">
            If this sounds like you, you've found your community
          </h2>

          <div className="flex flex-col lg:flex-row lg:items-end gap-8 sm:gap-10 lg:gap-[70px]">
            <div className="flex-1 lg:max-w-[600px] [font-family:'Manrope',Helvetica] font-normal text-mainblack-80 text-lg sm:text-xl lg:text-2xl xl:text-4xl tracking-[-0.2px] sm:tracking-[-0.3px] lg:tracking-[-0.36px] leading-normal">
              <span className="tracking-[-0.13px]">
                Ready to build AI products that solve real
                problems&nbsp;&nbsp;and have the potential to become
                multimillion-dollar businesses?
                <br />
                <br />
              </span>
              <span className="font-bold tracking-[-0.13px]">
                Join developers and PMs{" "}
              </span>
              <span className="tracking-[-0.13px]">
                who are creating the next generation of intelligent software.
              </span>
            </div>

            <Button 
               onClick={() => window.open('https://maven.com/mahesh-yadav/genaipm', '_blank')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 h-auto rounded-[10.22px] bg-[linear-gradient(90deg,rgba(247,144,9,1)_0%,rgba(74,0,224,1)_100%)] shadow-[1.28px_1.28px_5.11px_#0000001f,2.55px_7.66px_7.66px_#0000001a,6.38px_16.6px_11.49px_#0000000f,11.49px_30.65px_12.77px_#00000005,17.88px_47.25px_14.05px_transparent]"
            >
              <span className="[font-family:'Onest',Helvetica] font-medium text-white text-lg sm:text-xl lg:text-2xl tracking-[-0.24px] leading-[1.4]">
                Join the community
              </span>
              <ArrowRightIcon className="ml-2 h-[12px] w-[15px] sm:h-[14.97px] sm:w-[18.42px]" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
