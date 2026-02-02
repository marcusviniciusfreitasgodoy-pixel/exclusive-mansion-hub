import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Integracao } from '@/types/integrations';

interface AnalyticsScriptsProps {
  integracoes: Integracao[];
  // For tracking events
  onTrackEvent?: (eventName: string, eventData?: Record<string, any>) => void;
}

export function AnalyticsScripts({ integracoes }: AnalyticsScriptsProps) {
  const activeIntegrations = integracoes.filter(i => i.ativa);
  
  const gaIntegration = activeIntegrations.find(i => i.tipo_integracao === 'google_analytics');
  const metaPixelIntegration = activeIntegrations.find(i => i.tipo_integracao === 'meta_pixel');
  const gtmIntegration = activeIntegrations.find(i => i.tipo_integracao === 'google_tag_manager');

  // Initialize tracking functions on window
  useEffect(() => {
    // GA4 tracking function
    if (gaIntegration) {
      (window as any).trackGA4Event = (eventName: string, params?: Record<string, any>) => {
        if (typeof (window as any).gtag === 'function') {
          (window as any).gtag('event', eventName, params);
        }
      };
    }

    // Meta Pixel tracking function
    if (metaPixelIntegration) {
      (window as any).trackMetaPixelEvent = (eventName: string, params?: Record<string, any>) => {
        if (typeof (window as any).fbq === 'function') {
          (window as any).fbq('track', eventName, params);
        }
      };
    }

    // Combined tracking function
    (window as any).trackAnalyticsEvent = (eventName: string, params?: Record<string, any>) => {
      // GA4
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', eventName, params);
      }
      
      // Meta Pixel
      if (typeof (window as any).fbq === 'function') {
        // Map common events to Meta Pixel standard events
        const metaEventMap: Record<string, string> = {
          'lead': 'Lead',
          'generate_lead': 'Lead',
          'agendamento': 'Schedule',
          'schedule_visit': 'Schedule',
          'whatsapp_click': 'Contact',
          'pageview': 'PageView',
          'formulario_iniciado': 'InitiateCheckout',
        };
        const metaEvent = metaEventMap[eventName] || eventName;
        (window as any).fbq('track', metaEvent, params);
      }

      // GTM dataLayer push
      if (typeof (window as any).dataLayer !== 'undefined') {
        (window as any).dataLayer.push({
          event: eventName,
          ...params
        });
      }
    };

    return () => {
      delete (window as any).trackGA4Event;
      delete (window as any).trackMetaPixelEvent;
      delete (window as any).trackAnalyticsEvent;
    };
  }, [gaIntegration, metaPixelIntegration]);

  return (
    <Helmet>
      {/* Google Tag Manager */}
      {gtmIntegration && (
        <>
          <script>
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmIntegration.credenciais?.container_id}');
            `}
          </script>
        </>
      )}

      {/* Google Analytics 4 */}
      {gaIntegration && !gtmIntegration && (
        <>
          <script 
            async 
            src={`https://www.googletagmanager.com/gtag/js?id=${gaIntegration.credenciais?.measurement_id}`} 
          />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaIntegration.credenciais?.measurement_id}', {
                send_page_view: true
              });
            `}
          </script>
        </>
      )}

      {/* Meta Pixel */}
      {metaPixelIntegration && (
        <script>
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelIntegration.credenciais?.pixel_id}');
            fbq('track', 'PageView');
          `}
        </script>
      )}
    </Helmet>
  );
}

// Hook for tracking events in components
export function useAnalyticsTracking() {
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof (window as any).trackAnalyticsEvent === 'function') {
      (window as any).trackAnalyticsEvent(eventName, params);
    }
  };

  return { trackEvent };
}
