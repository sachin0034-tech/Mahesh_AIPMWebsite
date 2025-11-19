import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

interface JoinCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinCohortModal = ({
  isOpen,
  onClose,
}: JoinCohortModalProps): JSX.Element => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Your Google Apps Script URL
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbxwMVN_WMOlGcsnsuB9WzAODt26HfvCJCl8X1P7GMgGlqAiiHiNOz0q22Es7L5IxyA/exec";

  const handleSubmit = async (e: React.FormEvent) => {
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
      formData.append("name", fullName);

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
        setFullName("")
        onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-2xl border-none shadow-2xl">
        <div className="relative p-8 sm:p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-left text-xl sm:text-2xl lg:text-3xl">
              <span className="bg-[linear-gradient(90deg,rgba(247,144,9,1)_0%,rgba(74,0,224,1)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] font-['Gambetta-Medium',Helvetica] font-medium leading-tight">
                Get Your Free AI Resource Delivered Straight to Your Inbox
              </span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="fullName"
                className="text-base sm:text-lg font-medium text-black [font-family:'Manrope',Helvetica]"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Lennon"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 px-4 text-base border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-0 placeholder:text-gray-400 [font-family:'Manrope',Helvetica]"
                required
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-base sm:text-lg font-medium text-black [font-family:'Manrope',Helvetica]"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="JohnLennon@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 px-4 text-base border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-0 placeholder:text-gray-400 [font-family:'Manrope',Helvetica]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 mt-8 bg-[linear-gradient(90deg,rgba(247,144,9,1)_0%,rgba(74,0,224,1)_100%)] hover:bg-[linear-gradient(90deg,rgba(247,144,9,0.9)_0%,rgba(74,0,224,0.9)_100%)] text-white font-medium text-lg rounded-lg shadow-lg transition-all duration-200 [font-family:'Manrope',Helvetica] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
              {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
