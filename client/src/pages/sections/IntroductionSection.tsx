import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";

export const IntroductionSection = (): JSX.Element => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Your Google Apps Script URL
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbxwMVN_WMOlGcsnsuB9WzAODt26HfvCJCl8X1P7GMgGlqAiiHiNOz0q22Es7L5IxyA/exec";

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address",
        confirmButtonColor: "#f79009",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", "");

      const response = await fetch(scriptURL, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Successfully Subscribed!",
          text: "Thank you for subscribing to our AI resources.",
          confirmButtonColor: "#f79009",
          timer: 3000,
          timerProgressBar: true,
        });
        setEmail("");
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("error:", error);
      Swal.fire({
        icon: "error",
        title: "Subscription Failed",
        text: "There was an error subscribing. Please try again.",
        confirmButtonColor: "#f79009",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 p-6 lg:p-10 w-full bg-[#f7f4ee]">
      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12">
        <h2 className="w-full lg:w-[70%] bg-[linear-gradient(90deg,rgba(247,144,9,1)_0%,rgba(74,0,224,1)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Gambetta-Medium',Helvetica] font-medium text-transparent text-xl sm:text-2xl lg:text-3xl xl:text-[44px] tracking-[-0.3px] sm:tracking-[-0.4px] lg:tracking-[-0.44px] leading-[1.2] text-center lg:text-left">
          Get Your Free AI Resource Delivered Straight to Your Inbox
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full lg:w-[40%]">
          <div className="flex-1 w-full">
            <Input
              className="h-[50px] sm:h-[55px] p-3 bg-neutral-50 rounded-lg border border-solid border-[#e5e5e5] [font-family:'Manrope',Helvetica] font-semibold text-[#312d2d] text-sm w-full"
              placeholder="Enter Email..."
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            size="icon"
            variant="outline"
            className="h-[50px] w-[50px] sm:h-[55px] sm:w-[55px] p-3 bg-basewhite rounded-3xl border border-solid border-[#d4d4d4] flex-shrink-0 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
            ) : (
              <img
                className="w-5 h-5 sm:w-6 sm:h-6"
                alt="Chevron"
                src="/figmaAssets/chevron.svg"
              />
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};
