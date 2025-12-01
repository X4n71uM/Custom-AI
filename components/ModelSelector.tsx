
import React from 'react';
import type { ModelProfile } from '../types';

interface ModelSelectorProps {
  selectedModel: ModelProfile;
  onModelChange: (model: ModelProfile) => void;
}

const ModelButton = ({
  label,
  model,
  selectedModel,
  onModelChange,
  className,
}: {
  label: string;
  model: ModelProfile;
  selectedModel: ModelProfile;
  onModelChange: (model: ModelProfile) => void;
  className?: string;
}) => (
  <button
    onClick={() => onModelChange(model)}
    className={`w-1/2 py-2 px-4 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none ${
      selectedModel === model
        ? 'bg-[#64FFDA] text-[#0A192F]'
        : 'bg-transparent text-[#CCD6F6] hover:bg-[#112240]'
    } ${className}`}
  >
    {label}
  </button>
);

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <div className="flex justify-center p-2">
      <div className="flex w-full max-w-sm rounded-lg border-2 border-[#64FFDA] bg-[#0A192F] overflow-hidden shadow-lg shadow-[#64FFDA]/10">
        <ModelButton
          label="Pro: Weiser Rat"
          model="pro"
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          className="rounded-l-md"
        />
        <ModelButton
          label="Flash: Schneller Impuls"
          model="flash"
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          className="rounded-r-md"
        />
      </div>
    </div>
  );
};
