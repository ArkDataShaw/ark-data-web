import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export default function PricingCalculatorTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to the Pricing Calculator',
      description: 'Let\'s take a quick tour to help you understand how our enrichment pricing works.',
      target: null,
      position: 'center',
    },
    {
      id: 'input',
      title: 'Enter Your Monthly Visits',
      description: 'Start by telling us how many website visits you get per month. Drag the slider or type a number to see pricing instantly.',
      target: '[data-tour="visits-input"]',
      position: 'bottom',
    },
    {
      id: 'enrichment',
      title: 'Enrichment Rate',
      description: 'This shows what percentage of your visits can be enriched with our high-intent data. Higher quality sites = higher enrichment rates.',
      target: '[data-tour="enrichment-rate"]',
      position: 'bottom',
    },
    {
      id: 'contacts',
      title: 'Estimated Contacts',
      description: 'See how many enriched contacts you\'ll get monthly at your current visit volume. This drives your ROI.',
      target: '[data-tour="contacts-row"]',
      position: 'top',
    },
    {
      id: 'cost',
      title: 'Monthly Pricing',
      description: 'Your estimated monthly cost based on enriched contacts. Transparent pricing, no surprises.',
      target: '[data-tour="cost-row"]',
      position: 'top',
    },
    {
      id: 'trial',
      title: 'Start Your Free Trial',
      description: 'Try it free for 30 days with no credit card required. Perfect way to test the value before committing.',
      target: '[data-tour="trial-button"]',
      position: 'top',
    },
  ];

  const currentStepData = steps[currentStep];
  const targetElement = currentStepData.target ? document.querySelector(currentStepData.target) : null;

  const [highlightRect, setHighlightRect] = useState(null);

  useEffect(() => {
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setHighlightRect({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    }
  }, [targetElement, currentStep]);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!highlightRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const padding = 20;

    let top, left;

    if (currentStepData.position === 'center') {
      top = window.innerHeight / 2 - tooltipHeight / 2;
      left = window.innerWidth / 2 - tooltipWidth / 2;
    } else if (currentStepData.position === 'bottom') {
      top = highlightRect.top + highlightRect.height + padding;
      left = highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2;
    } else {
      top = highlightRect.top - tooltipHeight - padding;
      left = highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2;
    }

    return { top: `${top}px`, left: `${left}px` };
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
      />

      {/* Highlight */}
      {highlightRect && (
        <div
          style={{
            position: 'fixed',
            top: `${highlightRect.top}px`,
            left: `${highlightRect.left}px`,
            width: `${highlightRect.width}px`,
            height: `${highlightRect.height}px`,
            border: '2px solid #22c55e',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.2)',
            pointerEvents: 'none',
            zIndex: 1001,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          ...getTooltipPosition(),
          background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)',
          border: '1px solid rgba(34,197,94,0.5)',
          borderRadius: '12px',
          padding: '24px',
          width: '320px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 1002,
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>{currentStepData.title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#D9ECFF',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#D9ECFF', lineHeight: 1.6 }}>{currentStepData.description}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#4a6a9a' }}>
            {currentStep + 1} of {steps.length}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              style={{
                background: currentStep === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.3)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#22c55e',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: currentStep === 0 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              onClick={nextStep}
              style={{
                background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 100%)',
                border: '1px solid rgba(34,197,94,0.5)',
                color: '#fff',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {currentStep === steps.length - 1 ? 'Done' : 'Next'} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}