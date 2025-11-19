import React from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const OfferDetailsSection = (): JSX.Element => {
  // Define the benefits data to map over
  const benefits = [
    {
      title:
        "Clarity on where you have the highest chance of success in the AI PM landscape and which roles to target.",
    },
    {
      title:
        "A CV and LinkedIn strategy that actually gets interviews, even with limited AI experience.",
    },
    {
      title:
        "A production-grade GenAI/Agentic AI project you can confidently showcase in interviews.",
    },
    {
      title:
        "Systems to reframe and position your past experience for today's AI-first hiring filters.",
    },
    {
      title:
        "Mock interviews and live case breakdowns directly with Mahesh to pressure-test your thinking.",
    },
    {
      title:
        "A day-by-day game plan to structure your AI PM interview prep (before, during, and after the Bootcamp).",
    },
    {
      title:
        "Access to real case studies, prompts, and agent flows used in top AI PM interviews.",
    },
    {
      title:
        "The exact prep systems Mahesh used to crack AI PM roles at Meta, Google, and AWS.",
    },
  ];

  return (
    <section className="w-full bg-[#ededed] py-12 lg:py-20">
      <div className="container mx-auto flex flex-col items-center gap-6 lg:gap-8 px-4">
        <div className="flex flex-col items-center gap-4 w-full">
          <Badge className="px-3.5 py-3 bg-[#deefdf] hover:bg-[#deefdf] text-[#017c1d] rounded-2xl">
            <span className="[font-family:'Onest',Helvetica] font-medium text-lg lg:text-2xl tracking-[-0.48px] leading-[21px]">
              Key Outcomes
            </span>
          </Badge>

          <h2 className="[font-family:'Gambetta-Medium',Helvetica] text-3xl sm:text-4xl lg:text-[56px] text-center tracking-[-2.24px] leading-tight lg:leading-[67.2px] text-black">
            <span className="font-medium tracking-[-1.25px]">What You'll </span>
            <span className="[font-family:'Gambetta-Bold',Helvetica] font-bold tracking-[-1.25px]">
              Learn
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-5 w-full mt-8">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="bg-white rounded-2xl border-b border-[#dfdfdf] shadow-shadow-2xl"
            >
              <CardContent className="flex items-start gap-3 p-3 pt-[23px] pb-6 h-[124px]">
                <Check className="w-6 h-6 text-[#017c1d] flex-shrink-0 mt-1" />
                <p className="[font-family:'Manrope',Helvetica] font-bold text-[#0c0c0c] text-xl text-left tracking-[0] leading-[30px]">
                  {benefit.title}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
