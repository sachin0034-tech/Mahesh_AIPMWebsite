import { StarIcon } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const ChallengeSection = (): JSX.Element => {
  // StarIcon rating component for reuse
  const StarRating = () => (
    <div className="flex items-start gap-2">
      {[...Array(5)].map((_, index) => (
        <StarIcon
          key={index}
          className="w-5 h-5 fill-current text-yellow-400"
        />
      ))}
    </div>
  );

  // Testimonial data
  const testimonials = [
    {
      text: "With so much happening in the AI space, I was overwhelmed and unsure where to begin. This course not only gave me a clear starting point but also reignited my motivation to pursue the ideas I've long wanted to build—but had been too afraid to try. It made the leap into AI feel accessible and empowering.",
      name: "Piyush",
      position: "Lead Product Manager BMO",
      cohort: "Cohort 5",
    },
    {
      text: "Mahesh is far more than just a trainer — he is a mentor, an energizer, and a knowledge powerhouse. His genuine dedication to answering every question, breaking down complex concepts, and ensuring each one of us walks away enlightened after these five weeks has been nothing short of inspiring.",
      name: "Swati",
      position: "Head of Products Spire Technologies",
      cohort: "Cohort 5",
    },
    {
      text: "Mahesh is an amazing teacher and an excellent pedagogy. He has a very structured way of explaining things, absolutely loved learning with him. He has an amazing team, especially Keyuri, Josie, Habiba, Karan - super helpful and responsive, always on their toes to help you. The team is doing a great job. Thank you Guys!!!",
      name: "Mohan",
      position: "Senior Product Manager Weatherford",
      cohort: "Cohort 5",
    },
    {
      text: "Excellent! Must do if you want to be a real AI PM. The course material goes over everything you'd need to know as an AI PM and is continuously evolving and updating to match the market. They do a great job of not only teaching concepts but giving opportunities to actively apply them to real world scenarios and technically build out solutions. It's also a fun and safe environment to grow and learn.",
      name: "Ramya",
      position:
        "Senior AI/ML Product Manager Currently Freelance, previously JPMorgan",
      cohort: "Cohort 5",
    },
    {
      text: "Excellent course by Mahesh. Kept us hands-on and focused in reinforcing our learnings. Great support from his team on PRD reviews, labs and pitching ideas. Highly recommend!",
      name: "Laavanya",
      position: "Senior Product Manager - Consultant\nSummit Data Systems",
      cohort: "Cohort 5",
    },
    {
      text: "The only Agentic AI class you need to take. 11/10! Thanks Team Mahesh!",
      name: "Payal",
      position: "Director of Product",
      cohort: "Cohort 5",
    },
  ];

  return (
    <section className="w-full bg-white py-12 lg:py-20">
      <div className="container mx-auto flex flex-col items-center gap-8 lg:gap-[52px] px-4">
        <div className="flex flex-col items-start gap-12 lg:gap-[72px] w-full">
          {/* Header section */}
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <StarRating />
              <div className="text-sm">
                <span className="text-[#454545]">5.0</span>{" "}
                <span className="font-semibold text-[#000000cc]">
                  (116 ratings)
                </span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[56px] leading-tight lg:leading-[67.2px] tracking-[-2.24px] text-center font-medium [font-family:'Gambetta-Medium',Helvetica]">
              <span className="tracking-[-1.25px]">What </span>
              <span className="[font-family:'Gambetta-Bold',Helvetica] font-bold tracking-[-1.25px]">
                students
              </span>
              <span className="tracking-[-1.25px]"> are saying</span>
            </h2>
          </div>

          {/* Testimonials grid */}
          <div className="flex flex-col gap-12 lg:gap-[72px] w-full">
            {/* First row of testimonials */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <Card key={index} className="border-none shadow-none">
                  <CardContent className="p-0">
                    <div className="flex flex-col gap-6">
                      <StarRating />
                      <div className="flex flex-col gap-6">
                        <p className="[font-family:'Gambetta-Medium',Helvetica] font-medium text-[#171c21] text-base tracking-[-0.32px] leading-[25.6px]">
                          {testimonial.text}
                        </p>
                        <div className="flex items-center gap-1 w-full">
                          <span className="[font-family:'Manrope',Helvetica] font-medium text-[#171c21] text-base tracking-[-0.32px] leading-[25.6px] whitespace-nowrap">
                            {testimonial.name}
                          </span>
                          <span className="flex-1 [font-family:'Manrope',Helvetica] font-normal text-[#454545cc] text-sm tracking-[-0.14px] leading-6">
                            {testimonial.position}
                          </span>
                          <Badge className="bg-purple-light text-purple rounded flex items-center gap-2 px-3 py-1">
                            <div className="w-[5px] h-[5px] bg-purple rounded-[2.5px]" />
                            <span className="[font-family:'Manrope',Helvetica] font-medium text-sm tracking-[-0.28px] leading-[22.4px]">
                              {testimonial.cohort}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Second row of testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {testimonials.slice(3, 6).map((testimonial, index) => (
                <Card key={index} className="border-none shadow-none">
                  <CardContent className="p-0">
                    <div className="flex flex-col gap-6">
                      <StarRating />
                      <div className="flex flex-col gap-6">
                        <p className="[font-family:'Gambetta-Medium',Helvetica] font-medium text-[#171c21] text-base tracking-[-0.32px] leading-[25.6px]">
                          {testimonial.text}
                        </p>
                        <div className="flex items-center gap-1 w-full">
                          <span className="[font-family:'Manrope',Helvetica] font-medium text-[#171c21] text-base tracking-[-0.32px] leading-[25.6px] whitespace-nowrap">
                            {testimonial.name}
                          </span>
                          <span className="flex-1 [font-family:'Manrope',Helvetica] font-normal text-[#454545cc] text-sm tracking-[-0.14px] leading-6 whitespace-pre-line">
                            {testimonial.position}
                          </span>
                          <Badge className="bg-purple-light text-purple rounded flex items-center gap-2 px-3 py-1">
                            <div className="w-[5px] h-[5px] bg-purple rounded-[2.5px]" />
                            <span className="[font-family:'Manrope',Helvetica] font-medium text-sm tracking-[-0.28px] leading-[22.4px]">
                              {testimonial.cohort}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* View all reviews button */}
        <Button
          variant="default"
          className="bg-black text-white h-[50px] px-6 py-3 rounded-lg shadow-[1px_1px_4px_#0000001f,2px_6px_6px_#0000001a,5px_13px_9px_#0000000f,9px_24px_10px_#00000005,14px_37px_11px_transparent]"
        >
          <span className="font-paragraph-l-medium text-[length:var(--paragraph-l-medium-font-size)] tracking-[var(--paragraph-l-medium-letter-spacing)] leading-[var(--paragraph-l-medium-line-height)]">
            View all reviews
          </span>
          <img
            className="w-[14.42px] h-[11.72px] ml-2.5"
            alt="Vector"
            src="/figmaAssets/vector.svg"
          />
        </Button>
      </div>
    </section>
  );
};
