import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FloatingWhatsApp = () => {
  const whatsappNumber = "5521964075124";
  const message = "Olá! Gostaria de mais informações sobre o imóvel.";
  
  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      size="icon"
      className="fixed bottom-8 right-8 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-gold transition-elegant hover:scale-110 hover:bg-[#20BA5A]"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </Button>
  );
};
