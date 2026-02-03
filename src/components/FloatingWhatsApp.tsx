import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
}

export const FloatingWhatsApp = ({
  phoneNumber = "5521964075124",
  message = "Olá! Gostaria de mais informações sobre o imóvel.",
}: FloatingWhatsAppProps) => {
  const handleClick = () => {
    const formattedNumber = phoneNumber.startsWith("55") 
      ? phoneNumber 
      : `55${phoneNumber}`;
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      size="icon"
      className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#20BA5A] hover:shadow-xl"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </Button>
  );
};
