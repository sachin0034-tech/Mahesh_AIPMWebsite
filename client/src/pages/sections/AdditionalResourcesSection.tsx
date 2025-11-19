import { StarIcon } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const AdditionalResourcesSection = (): JSX.Element => {
  // Testimonial data for mapping
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
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto flex flex-col items-center gap-8 sm:gap-12 lg:gap-[52px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-12 sm:gap-16 lg:gap-[72px] w-full">
          <div className="flex flex-col items-center gap-4 w-full relative">
            <div className="absolute w-[150px] sm:w-[180px] lg:w-[200px] h-[45px] sm:h-[52px] lg:h-[59px] top-8 sm:top-10 lg:top-12 left-1/2 -translate-x-1/2 " />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 z-10">
              <div className="flex items-start gap-1 sm:gap-2">
                {[...Array(5)].map((_, index) => (
                  <StarIcon
                    key={`star-top-${index}`}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>

              <div className="font-['Manrope',Helvetica] text-xs sm:text-sm">
                <span className="text-[#454545]">5.0</span>{" "}
                <span className="font-semibold text-[#000000cc]">
                  (116 ratings)
                </span>
              </div>
            </div>

            <h2 className="font-['Gambetta-Medium',Helvetica] font-medium text-black text-2xl sm:text-3xl lg:text-4xl xl:text-[56px] text-center tracking-[-1.2px] sm:tracking-[-1.8px] lg:tracking-[-2.24px] leading-[1.2] z-10 px-4">
              What students are saying
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {testimonials.map((testimonial, index) => (
              <Card
                key={`testimonial-${index}`}
                className="border-none shadow-none"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="flex items-start gap-1 sm:gap-2">
                      {[...Array(5)].map((_, starIndex) => (
                        <StarIcon
                          key={`star-${index}-${starIndex}`}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </div>

                    <div className="flex flex-col gap-4 sm:gap-6">
                      <p className="font-['Gambetta-Medium',Helvetica] font-medium text-[#171c21] text-sm sm:text-base tracking-[-0.2px] sm:tracking-[-0.32px] leading-[1.6]">
                        {testimonial.text}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1 w-full">
                        <span className="font-['Manrope',Helvetica] font-medium text-[#171c21] text-sm sm:text-base tracking-[-0.2px] sm:tracking-[-0.32px] leading-[1.6]">
                          {testimonial.name}
                        </span>
                        <span className="flex-1 font-['Manrope',Helvetica] font-normal text-[#454545cc] text-xs sm:text-sm tracking-[-0.14px] leading-6">
                          {testimonial.position}
                        </span>
                        <Badge className="bg-purple-light text-purple rounded flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 self-start sm:self-auto">
                          <div className="w-[4px] h-[4px] sm:w-[5px] sm:h-[5px] bg-purple rounded-[2.5px]" />
                          <span className="font-['Manrope',Helvetica] font-medium text-xs sm:text-sm tracking-[-0.28px] leading-[1.6]">
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

        <Button className="w-full sm:w-auto bg-black text-white rounded-lg shadow-[1px_1px_4px_#0000001f,2px_6px_6px_#0000001a,5px_13px_9px_#0000000f,9px_24px_10px_#00000005,14px_37px_11px_transparent] h-[44px] sm:h-[50px] px-6 py-3"
            onClick={() => window.open('https://maven.com/mahesh-yadav/genaipm#course-reviews', '_blank')}
        >
          <span className="font-paragraph-l-medium text-base sm:text-[18px] tracking-[-0.18px] leading-[27px]">
            View all reviews
          </span>
          <img
            className="w-[12px] h-[10px] sm:w-[14.42px] sm:h-[11.72px] ml-2"
            alt="Vector"
            src="/figmaAssets/vector.svg"
          />
        </Button>
      </div>
    </section>
  );
};
