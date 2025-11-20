import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const BonusSection = (): JSX.Element => {
  // Data for bonus perks cards
  const bonusPerks = [
    {
      title: "AI PM Interview Fundamentals: What top companies really look for",
      description:
        "Give students an idea of how they can expect to grow throughout your course. Include specificity and precise results so students can benchmark exactly what they'll learn.",
    },
    {
      title: "Case Study Mastery: Nail product, execution, and AI strategy rounds",
      description:
        "Give students an idea of how they can expect to grow throughout your course. Include specificity and precise results so students can benchmark exactly what they'll learn.",
    },
    {
      title: "Build + Talk Projects: How to showcase AI product work in interviews",
      description:
        "Give students an idea of how they can expect to grow throughout your course. Include specificity and precise results so students can benchmark exactly what they'll learn.",
    },
    {
      title: "Prompting & Agentic Thinking: Demonstrate technical AI fluency confidently",
      description:
        "Give students an idea of how they can expect to grow throughout your course. Include specificity and precise results so students can benchmark exactly what they'll learn.",
    },
  ];

  return (
    <section className="w-full bg-[#f7f4ee] py-12 lg:py-20">
      <div className="container mx-auto max-w-[1284px] px-4">
        <div className="flex flex-col items-center gap-6 lg:gap-8 mb-6">
          <h2 className="text-3xl sm:text-4xl lg:text-[56px] leading-tight lg:leading-[67.2px] tracking-[-2.24px] text-center text-black">
            <span className="[font-family:'Gambetta-Bold',Helvetica] font-bold tracking-[-1.25px]">
              Course Curriculum
            </span>
          </h2>
          <p className="[font-family:'Manrope',Helvetica] text-lg lg:text-xl text-mainblack-80 tracking-[-0.20px] leading-[27px] text-center px-4">
            Additional value included with your enrollment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bonusPerks.map((perk, index) => (
            <Card key={index} className="bg-white rounded-2xl">
              <CardContent className="flex flex-col gap-6 p-10">
                <h3 className="[font-family:'Gambetta-Semibold',Helvetica] text-2xl text-mainblack-100 tracking-[-0.96px] leading-6">
                  {perk.title}
                </h3>
                <p className="[font-family:'Manrope',Helvetica] text-sm text-[#454545cc] tracking-[-0.14px] leading-6">
                  {perk.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
