import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const BenefitsSection = (): JSX.Element => {
  // Data for challenge cards to enable mapping
  const challengeCards = [
    {
      text: "You're unclear about what it takes to land an AI PM role without years of GenAI/Agentic AI experience",
    },
    {
      text: "You're failing to articulate your AI work during interviews, even if you've built something",
    },
    {
      text: 'You\'re stuck in "apply, network, post" loops without getting a single callback',
    },
    {
      text: "You lack a clear, structured game plan to prep, pitch, and stand out",
    },
    {
      text: "You have experience in traditional ML/analytics, but don't know how to position yourself in today's Agentic-first AI hiring wave",
    },
    {
      text: "You feel trapped in the AI chicken-and-egg problem — you need experience to get the job, but you need the job to get experience",
    },
  ];

  return (
    <section className="w-full py-12 lg:py-20 bg-[#f7f4ee]">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-6 lg:gap-9">
          {/* Heading */}
          <div className="flex justify-center w-full">
            <div className="max-w-4xl">
              <h2 className="[font-family:'Gambetta-Medium',Helvetica] font-normal text-black text-3xl sm:text-4xl lg:text-[56px] text-center tracking-[-2.24px] leading-tight lg:leading-[67.2px]">
                <span className="font-medium tracking-[-1.25px]">
                  Are you facing any of these{" "}
                </span>
                <span className="[font-family:'Gambetta-Bold',Helvetica] font-bold tracking-[-1.25px]">
                  challenges
                </span>
                <span className="font-medium tracking-[-1.25px]">?</span>
              </h2>
            </div>
          </div>

          {/* Challenge Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-9">
            {/* Left Column */}
            <div className="flex flex-col gap-6 lg:gap-9">
              {challengeCards.slice(0, 3).map((card, index) => (
                <Card
                  key={`challenge-left-${index}`}
                  className="bg-white rounded-2xl border-b border-[#dfdfdf] shadow-shadow-2xl"
                >
                  <CardContent className="pt-[23px] pb-6 px-3">
                    <p className="[font-family:'Manrope',Helvetica] font-bold text-[#0c0c0c] text-lg lg:text-xl text-center tracking-[0] leading-[28px] lg:leading-[30px]">
                      {card.text}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 lg:gap-9">
              {challengeCards.slice(3).map((card, index) => (
                <Card
                  key={`challenge-right-${index}`}
                  className="bg-white rounded-2xl border-b border-[#dfdfdf] shadow-shadow-2xl"
                >
                  <CardContent className="pt-[23px] pb-6 px-3">
                    <p className="[font-family:'Manrope',Helvetica] font-bold text-[#0c0c0c] text-lg lg:text-xl text-center tracking-[0] leading-[28px] lg:leading-[30px]">
                      {card.text}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
