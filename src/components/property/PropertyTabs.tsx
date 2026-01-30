import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: "overview", label: "Visão Geral" },
  { id: "location", label: "Localização" },
  { id: "details", label: "Detalhes" },
  { id: "contact", label: "Contato" },
];

export function PropertyTabs() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const tabsElement = document.getElementById("property-tabs");
      if (tabsElement) {
        const rect = tabsElement.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }

      // Update active tab based on scroll position
      const sections = tabs.map(tab => ({
        id: tab.id,
        element: document.getElementById(`section-${tab.id}`),
      }));

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveTab(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      const offset = 80; // Height of sticky header
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      id="property-tabs"
      className={cn(
        "bg-white border-b transition-all z-40",
        isSticky && "sticky top-0 shadow-md"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={cn(
                "px-4 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2",
                activeTab === tab.id
                  ? "border-accent text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary hover:border-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
