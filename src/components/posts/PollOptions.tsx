import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
}

interface PollOptionsProps {
  options: PollOption[];
  onChange: (options: PollOption[]) => void;
}

export const PollOptions = ({ options, onChange }: PollOptionsProps) => {
  const addOption = () => {
    if (options.length < 4) {
      onChange([...options, { id: crypto.randomUUID(), text: "" }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      onChange(options.filter(option => option.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    onChange(options.map(option => 
      option.id === id ? { ...option, text } : option
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Poll Options <span className="text-red-500">*</span>
        </label>
        {options.length < 4 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Option
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={option.id} className="flex gap-2">
            <Input
              placeholder={`Option ${index + 1}`}
              value={option.text}
              onChange={(e) => updateOption(option.id, e.target.value)}
              className="flex-1"
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeOption(option.id)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};