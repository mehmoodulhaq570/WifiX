import { useState, useEffect } from "react";

const OnboardingTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    {
      id: "welcome",
      title: "Welcome to WifiX Transfer! 👋",
      description:
        "Let's take a quick tour to get you started. This will only take 30 seconds.",
      targetSelector: null, // No specific target, just centered
      position: "center",
    },
    {
      id: "become-host",
      title: "Become Host",
      description:
        "Click here to start hosting files. Your device will become the server that others can connect to.",
      targetSelector: '[data-tour="become-host"]',
      position: "bottom",
    },
    {
      id: "share-link",
      title: "Share Your Link",
      description:
        "Copy this link or show the QR code to share with other devices on the same Wi-Fi network.",
      targetSelector: '[data-tour="share-link"]',
      position: "bottom",
    },
    {
      id: "upload-zone",
      title: "Upload Files",
      description:
        "Drag & drop files here or click to browse. Files will be instantly available to connected devices.",
      targetSelector: '[data-tour="upload-zone"]',
      position: "top",
    },
    {
      id: "complete",
      title: "You're All Set! 🎉",
      description:
        "You can now host files and share them across devices on your local network. Have fun!",
      targetSelector: null,
      position: "center",
    },
  ];

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(
      "wifix-onboarding-completed"
    );
    if (!hasCompletedOnboarding) {
      // Small delay before showing tour
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("wifix-onboarding-completed", "true");
    if (onComplete) onComplete();
  };

  const getTargetPosition = () => {
    const step = steps[currentStep];
    if (!step.targetSelector) return null;

    const element = document.querySelector(step.targetSelector);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const targetPos = getTargetPosition();
  const isCentered = step.position === "center";

  // Calculate tooltip position
  let tooltipStyle = {};
  if (!isCentered && targetPos) {
    if (step.position === "bottom") {
      tooltipStyle = {
        top: `${targetPos.top + targetPos.height + 20}px`,
        left: `${targetPos.left + targetPos.width / 2}px`,
        transform: "translateX(-50%)",
      };
    } else if (step.position === "top") {
      tooltipStyle = {
        top: `${targetPos.top - 20}px`,
        left: `${targetPos.left + targetPos.width / 2}px`,
        transform: "translate(-50%, -100%)",
      };
    }
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[9998]" />

      {/* Spotlight effect on target element */}
      {targetPos && (
        <div
          className="fixed z-[9999] border-4 border-blue-500 rounded-lg pointer-events-none animate-pulse"
          style={{
            top: `${targetPos.top - 4}px`,
            left: `${targetPos.left - 4}px`,
            width: `${targetPos.width + 8}px`,
            height: `${targetPos.height + 8}px`,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
          }}
        />
      )}

      {/* Tooltip/Modal */}
      <div
        className={`fixed z-[10000] ${
          isCentered ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""
        }`}
        style={!isCentered ? tooltipStyle : {}}
      >
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl p-6 max-w-md w-[90vw] sm:w-96">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep
                      ? "w-8 bg-blue-600"
                      : idx < currentStep
                      ? "w-1.5 bg-blue-400"
                      : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Skip
            </button>
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-200 text-sm mb-6">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition"
            >
              {currentStep === steps.length - 1 ? "Get Started!" : "Next"}
            </button>
          </div>

          {/* Step counter */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
