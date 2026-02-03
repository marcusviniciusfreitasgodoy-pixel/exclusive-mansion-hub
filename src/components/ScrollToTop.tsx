import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-24 right-4 md:bottom-28 md:right-8 z-40 h-11 w-11 rounded-full bg-accent text-primary shadow-lg transition-all duration-300 hover:scale-110 hover:bg-accent/90 hover:shadow-xl"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};
