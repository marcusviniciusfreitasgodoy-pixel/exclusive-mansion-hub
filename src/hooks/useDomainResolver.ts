import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PLATFORM_DOMAINS = [
  "localhost",
  "lovable.app",
  "lovableproject.com",
  "whitelabel.godoyprime.com.br",
];

function isPlatformDomain(hostname: string): boolean {
  return PLATFORM_DOMAINS.some(
    (d) => hostname === d || hostname.endsWith(`.${d}`)
  );
}

export interface DomainResolution {
  entityType: "construtora" | "imobiliaria";
  entityId: string;
}

interface UseDomainResolverReturn {
  isCustomDomain: boolean;
  resolution: DomainResolution | null;
  isLoading: boolean;
}

let cachedResolution: { hostname: string; result: DomainResolution | null } | null = null;

export function useDomainResolver(): UseDomainResolverReturn {
  const hostname = window.location.hostname;
  const isCustom = !isPlatformDomain(hostname);

  const [resolution, setResolution] = useState<DomainResolution | null>(
    cachedResolution?.hostname === hostname ? cachedResolution.result : null
  );
  const [isLoading, setIsLoading] = useState(
    isCustom && cachedResolution?.hostname !== hostname
  );

  useEffect(() => {
    if (!isCustom) return;
    if (cachedResolution?.hostname === hostname) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase
          .from("custom_domains")
          .select("entity_type, entity_id")
          .eq("domain", hostname)
          .in("status", ["verified", "active"])
          .limit(1)
          .single();

        if (!cancelled && data) {
          const result: DomainResolution = {
            entityType: data.entity_type as "construtora" | "imobiliaria",
            entityId: data.entity_id,
          };
          cachedResolution = { hostname, result };
          setResolution(result);
        }
      } catch {
        // domain not found — fall through to normal routing
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [hostname, isCustom]);

  return { isCustomDomain: isCustom, resolution, isLoading };
}
