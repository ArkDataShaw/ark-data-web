import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const STEPS = [
  {
    id: 'welcome',
    title: '👋 Welcome to the Pricing Calculator',
    description: "This interactive calculator helps you estimate your exact monthly cost with Ark Data. We'll walk you through every section so you can make confident decisions. The whole thing takes about 2 minutes.",
    target: null,
    position: 'center',
    tip: null,
  },
  {
    id: 'visits-input',
    title: '1. Enter Your Monthly Website Visits',
    description: "Start by entering your total monthly website traffic. This is the raw number of visits your site receives each month - not unique visitors. Don't worry about being exact; a rough estimate works perfectly.",
    target: '[data-tour="visits-input"]',
    position: 'bottom',
    tip: '💡 Try entering 20,000 to see a typical mid-market estimate.',
  },
  {
    id: 'enrichment-rate',
    title: '2. Set Your Enrichment Rate',
    description: "The enrichment rate (35%–70%) determines what percentage of your visits become billable Enriched Visits. The default is 55%, which reflects the average across Ark Data clients. B2B-heavy sites often see 60%+.",
    target: '[data-tour="enrichment-rate"]',
    position: 'bottom',
    tip: '💡 Most clients fall between 50–60%. Rates below 45% or above 65% are uncommon.',
  },
  {
    id: 'total-cost',
    title: '3. Your Estimated Monthly Cost',
    description: "This is your bottom line - the estimated monthly cost after your free trial ends. It updates in real time as you adjust your inputs. The average cost per enriched visit also shows you your effective rate.",
    target: '[data-tour="cost-row"]',
    position: 'top',
    tip: '💡 The cost drops significantly as your volume increases due to stacked tier pricing.',
  },
  {
    id: 'cpe-chart',
    title: '4. Cost Per Enriched Visit Chart',
    description: "This chart shows how your effective cost per enriched visit decreases as your monthly volume grows. The red vertical line marks your current position on the curve - the further right, the better your rate.",
    target: '[data-tour="cpe-chart"]',
    position: 'top',
    tip: '💡 Volume discounts kick in at 5k, 15k, 30k, 50k, 100k, and 250k enriched visits.',
  },
  {
    id: 'roi-chart',
    title: '5. ROI Growth Over Time',
    description: "This chart illustrates how your return compounds month over month. Your cost per visit stays flat, but as you refine campaigns and close more pipeline, each enriched visit generates more revenue. By month 4+, the spread widens significantly.",
    target: '[data-tour="roi-chart"]',
    position: 'top',
    tip: '💡 Based on real performance data from existing Ark Data customers.',
  },
  {
    id: 'tier-breakdown',
    title: '6. Stacked Tier Breakdown',
    description: "This table shows exactly how pricing is calculated. It\'s stacked - just like income tax brackets. You only pay the higher tier rate for visits within that tier, not on your entire volume. Active tiers are highlighted.",
    target: '[data-tour="tier-breakdown"]',
    position: 'top',
    tip: '💡 Example: at 20,000 enriched visits you pay $0.17 on the first 5k, $0.15 on the next 10k, and $0.13 on the remaining 5k.',
  },
  {
    id: 'example-box',
    title: '7. Your Numbers at a Glance',
    description: "This summary box reflects your current inputs - visits, enrichment rate, enriched visits, average cost per visit, and total monthly cost. It updates live as you type.",
    target: '[data-tour="example-box"]',
    position: 'top',
    tip: '💡 Screenshot or bookmark this page after entering your numbers for easy reference.',
  },
  {
    id: 'trial-cta',
    title: '8. Start Free - No Credit Card',
    description: "Ready to see the data in action? Click the button below the calculator to start your free 30-day trial. You\'ll be asked for basic contact info and then redirected to the Ark Data platform.",
    target: '[data-tour="trial-cta"]',
    position: 'top',
    tip: '✅ No credit card required. Cancel anytime. Setup takes under 10 minutes.',
  },
  {
    id: 'done',
    title: '🎉 You\'re All Set!',
    description: "You now know everything you need to estimate your pricing, understand your ROI, and get started with Ark Data. Enter your real numbers in the calculator and hit the free trial button when you\'re ready.",
    target: null,
    position: 'center',
    tip: null,
  },
];

export default function PricingCalculatorTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState(null);

  const stepData = STEPS[currentStep];

  const updateHighlight = useCallback(() => {
    if (!stepData.target) {
      setHighlightRect(null);
      return;
    }
    const el = document.querySelector(stepData.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setHighlightRect({
          top: rect.top - 10,
          left: rect.left - 10,
          width: rect.width + 20,
          height: rect.height + 20,
        });
      }, 350);
    } else {
      setHighlightRect(null);
    }
  }, [stepData.target]);

  useEffect(() => {
    if (isOpen) updateHighlight();
  }, [isOpen, currentStep, updateHighlight]);

  useEffect(() => {
    if (!isOpen) setCurrentStep(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
    else onClose();
  };
  const prev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };

  const getTooltipStyle = () => {
    const w = 420;
    const h = 260;
    const pad = 24;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!highlightRect || stepData.position === 'center') {
      return {
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    let top, left;
    if (stepData.position === 'bottom') {
      top = highlightRect.top + highlightRect.height + pad;
      left = highlightRect.left + highlightRect.width / 2 - w / 2;
    } else {
      top = highlightRect.top - h - pad;
      left = highlightRect.left + highlightRect.width / 2 - w / 2;
    }

    // Clamp to viewport
    left = Math.max(12, Math.min(left, vw - w - 12));
    top = Math.max(80, Math.min(top, vh - h - 12));

    return { top: `${top}px`, left: `${left}px` };
  };

  const progress = ((currentStep) / (STEPS.length - 1)) * 100;

  return (
    <>
      {/* Dark overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.72)',
          zIndex: 9000,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Highlight spotlight */}
      {highlightRect && (
        <div
          style={{
            position: 'fixed',
            top: `${highlightRect.top}px`,
            left: `${highlightRect.left}px`,
            width: `${highlightRect.width}px`,
            height: `${highlightRect.height}px`,
            border: '2px solid #22c55e',
            borderRadius: '10px',
            boxShadow: '0 0 0 4px rgba(34,197,94,0.25), 0 0 40px rgba(34,197,94,0.15)',
            pointerEvents: 'none',
            zIndex: 9001,
            animation: 'tourPulse 2s ease-in-out infinite',
          }}
        />
      )}

      <style>{`
        @keyframes tourPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(34,197,94,0.25), 0 0 40px rgba(34,197,94,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(34,197,94,0.15), 0 0 60px rgba(34,197,94,0.2); }
        }
        @keyframes tourFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          ...getTooltipStyle(),
          width: '420px',
          maxWidth: 'calc(100vw - 24px)',
          background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)',
          border: '1px solid rgba(34,197,94,0.45)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,197,94,0.1)',
          zIndex: 9002,
          color: '#fff',
          animation: 'tourFadeIn 0.25s ease-out',
          key: currentStep,
        }}
      >
        {/* Progress bar */}
        <div style={{ height: '3px', background: 'rgba(34,197,94,0.15)', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#22c55e', lineHeight: 1.3, paddingRight: '12px' }}>
            {stepData.title}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#D9ECFF', cursor: 'pointer', padding: '5px', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Description */}
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#D9ECFF', lineHeight: 1.65 }}>
          {stepData.description}
        </p>

        {/* Tip */}
        {stepData.tip && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#86efac', lineHeight: 1.55 }}>{stepData.tip}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: stepData.tip ? '0' : '20px' }}>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                style={{
                  width: i === currentStep ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === currentStep ? '#22c55e' : i < currentStep ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.25s',
                }}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={prev}
              disabled={currentStep === 0}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#D9ECFF',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: currentStep === 0 ? 0.35 : 1,
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={15} /> Back
            </button>
            <button
              onClick={next}
              style={{
                background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                border: '1px solid rgba(34,197,94,0.5)',
                color: '#fff',
                borderRadius: '8px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 12px rgba(34,197,94,0.25)',
                transition: 'all 0.2s',
              }}
            >
              {currentStep === STEPS.length - 1 ? (
                <><Sparkles size={14} /> Finish</>
              ) : (
                <>Next <ChevronRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}