import React from "react";
import { Video, Infinity, Users, Award, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const CommunityBenefitsSection = (): JSX.Element => {
  // Define benefits data for mapping
  const benefits = [
    {
      icon: Video,
      title: "Live sessions",
      description:
        "Learn directly from Mahesh Yadav & Keyuri Anand in a real-time, interactive format.",
    },
    {
      icon: Infinity,
      title: "Lifetime access",
      description:
        "Go back to course content and recordings whenever you need to.",
    },
    {
      icon: Users,
      title: "Community of peers",
      description:
        "Stay accountable and share insights with like-minded professionals.",
    },
    {
      icon: Award,
      title: "Certificate of completion",
      description:
        "Share your new skills with your employer or on LinkedIn.",
    },
    {
      icon: ShieldCheck,
      title: "Maven Guarantee",
      description:
        "This course is backed by the Maven Guarantee. Students are eligible for a full refund up until the halfway point of the course.",
    },
  ];

  return (
    <section className="w-full bg-[#ededed] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title section with decorative element */}
        <div className="relative flex flex-col items-center mb-12 lg:mb-16">
          <div className="absolute w-[200px] sm:w-[250px] lg:w-[301px] h-[50px] sm:h-[60px] lg:h-[70px] top-[-7px] right-0 sm:right-[calc(50%-125px)] lg:right-[calc(50%-150px)] " />
          <h2 className="relative [font-family:'Gambetta-Medium',Helvetica] font-medium text-black text-2xl sm:text-3xl lg:text-4xl xl:text-[56px] text-center tracking-[-1.2px] sm:tracking-[-1.8px] lg:tracking-[-2.24px] leading-[1.2] px-4">
            What You Get With the Community
          </h2>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={index} className="rounded-2xl bg-white">
                <CardContent className="flex flex-col gap-4 sm:gap-6 p-6 sm:p-8 lg:p-10">
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                    {IconComponent && (
                      <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] flex-shrink-0 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-[#017c1d]" />
                      </div>
                    )}
                  <h3
                    className={`flex-1 [font-family:'Gambetta-Semibold',Helvetica] font-normal text-mainblack-100 text-lg sm:text-xl lg:text-2xl tracking-[-0.8px] sm:tracking-[-0.96px] leading-6`}
                  >
                    {benefit.title}
                  </h3>
                </div>
                  <p className="[font-family:'Manrope',Helvetica] font-normal text-[#454545cc] text-sm sm:text-base tracking-[-0.14px] leading-6">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
