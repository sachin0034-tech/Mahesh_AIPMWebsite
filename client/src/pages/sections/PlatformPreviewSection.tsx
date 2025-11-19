import React from "react";
import { Target, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const PlatformPreviewSection = (): JSX.Element => {

  return (
    <section className="w-full bg-[#ededed] py-12 lg:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-fr">
          {/* Card 1: Why This Bootcamp Exists - Large (spans 2 columns) */}
          <Card className="md:col-span-2 lg:col-span-2 bg-[#DEDED1] border-[#DEDED1] rounded-3xl p-6 lg:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0 flex flex-col gap-6 h-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E75A55] to-[#9747FF] flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black [font-family:'Gambetta-Bold',Helvetica] tracking-[-1.5px]">
                  Why This Bootcamp Exists
                </h2>
              </div>
              
              <div className="flex flex-col gap-4 [font-family:'Manrope',Helvetica] flex-1">
                <p className="text-base lg:text-lg text-black/90 leading-relaxed">
                  The AI PM hiring bar has shifted. It's no longer enough to "know" GenAI – you're expected to show impact, tell sharp stories, and navigate new interview formats that test both product sense and agentic thinking.
                </p>
                <p className="text-base lg:text-lg text-black/90 leading-relaxed">
                  This 3-week Bootcamp is built for professionals who are hitting a wall in their AI PM journey—whether that's getting interviews, cracking them, or confidently positioning themselves in the GenAI and Agentic AI era.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: How It Works - Medium (spans 2 columns) */}
          <Card className="md:col-span-2 lg:col-span-2 bg-[#DEDED1] border-[#DEDED1] rounded-3xl p-6 lg:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0 flex flex-col gap-6 h-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E75A55] to-[#9747FF] flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black [font-family:'Gambetta-Bold',Helvetica] tracking-[-1.5px]">
                  How It Works
                </h2>
              </div>
              
              <div className="flex flex-col gap-4 [font-family:'Manrope',Helvetica] flex-1">
                <p className="text-base lg:text-lg text-black/90 leading-relaxed">
                  Over 3 intensive weeks, you'll follow a structured, outcome-driven prep system designed by AI product leaders who've been on both sides of the interview loop.
                </p>
                <p className="text-base lg:text-lg text-black/90 leading-relaxed">
                  You'll work through a mix of live sessions, mock interviews, case breakdowns, and a guided project so that by the end, you're not just more "informed"—you have a clear narrative, a real build, and a repeatable daily routine for interview readiness.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Platform Preview - Large (spans 4 columns, 2 rows) */}
          <Card className="md:col-span-2 lg:col-span-4 lg:row-span-2 bg-transparent border-0 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0 h-full">
              <div className="w-full h-full min-h-[500px] lg:min-h-[600px] rounded-3xl overflow-hidden">
                <img
                  src="/figmaAssets/image-2.png"
                  alt="Platform Preview"
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

