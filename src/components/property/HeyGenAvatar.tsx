import { AspectRatio } from "@/components/ui/aspect-ratio";

interface HeyGenAvatarProps {
  agentId?: string;
  className?: string;
}

const DEFAULT_AGENT_ID = "2f42c097-5fdf-4e1c-9b3e-263c5652e92e";

export function HeyGenAvatar({ 
  agentId = DEFAULT_AGENT_ID, 
  className 
}: HeyGenAvatarProps) {
  return (
    <div className={className}>
      <AspectRatio ratio={16 / 9}>
        <iframe
          src={`https://embed.liveavatar.com/v1/${agentId}`}
          allow="microphone"
          title="Assistente Virtual Sofia"
          className="w-full h-full rounded-2xl shadow-2xl border-2 border-accent/20"
        />
      </AspectRatio>
    </div>
  );
}
