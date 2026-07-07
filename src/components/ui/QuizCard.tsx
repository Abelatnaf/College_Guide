"use client";

import { Tilt3D } from "@/components/motion/Tilt3D";

export interface QuizOption {
  value: string;
  label: string;
  sub?: string;
}

interface SingleSelectProps {
  mode?: "single";
  question: string;
  options: QuizOption[];
  selected: string | undefined;
  onSelect: (value: string) => void;
  helperText?: string;
}

interface MultiSelectProps {
  mode: "multi";
  question: string;
  options: QuizOption[];
  selected: string[];
  onSelect: (value: string) => void;
  maxSelections: number;
  helperText?: string;
}

type QuizCardProps = SingleSelectProps | MultiSelectProps;

function Choice({
  option,
  isSelected,
  isDisabled,
  shape,
  onClick,
}: {
  option: QuizOption;
  isSelected: boolean;
  isDisabled: boolean;
  shape: "round" | "square";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isSelected}
      className={
        "flex items-center rounded-xl border-2 p-md text-left transition-all duration-200 " +
        (isSelected
          ? "border-primary bg-primary-container/10 shadow-glow-sm"
          : isDisabled
            ? "cursor-not-allowed border-transparent bg-surface opacity-40"
            : "border-outline-variant/30 bg-surface-container-low/40 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-glow-sm")
      }
    >
      <div
        className={
          "flex h-6 w-6 shrink-0 items-center justify-center border-2 transition-colors " +
          (shape === "round" ? "rounded-full" : "rounded-md") +
          " " +
          (isSelected ? "border-primary bg-primary" : "border-outline")
        }
      >
        {shape === "round" ? (
          <div
            className={
              "h-2.5 w-2.5 rounded-full bg-white transition-opacity " +
              (isSelected ? "opacity-100" : "opacity-0")
            }
          />
        ) : (
          <span
            className={
              "material-symbols-outlined text-[16px] text-white transition-opacity " +
              (isSelected ? "opacity-100" : "opacity-0")
            }
          >
            check
          </span>
        )}
      </div>
      <span className="ml-md font-body-lg text-body-lg text-on-surface">
        {option.label}
        {option.sub && (
          <span className="block font-caption text-caption text-on-surface-variant">
            {option.sub}
          </span>
        )}
      </span>
    </button>
  );
}

export function QuizCard(props: QuizCardProps) {
  const { question, options, helperText } = props;

  return (
    <Tilt3D maxTilt={5} glare={false} className="animate-slide-in rounded-xl">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm md:p-lg">
        <h1 className="mb-xs font-headline-lg text-headline-lg text-on-surface">
          {question}
        </h1>
        {helperText && (
          <p className="mb-lg font-body-md text-body-md text-on-surface-variant">
            {helperText}
          </p>
        )}
        {!helperText && <div className="mb-xl" />}

        <div className="grid grid-cols-1 gap-md">
          {options.map((opt) => {
            if (props.mode === "multi") {
              const isSelected = props.selected.includes(opt.value);
              const atMax = props.selected.length >= props.maxSelections;
              return (
                <Choice
                  key={opt.value}
                  option={opt}
                  isSelected={isSelected}
                  isDisabled={!isSelected && atMax}
                  shape="square"
                  onClick={() => props.onSelect(opt.value)}
                />
              );
            }
            const isSelected = props.selected === opt.value;
            return (
              <Choice
                key={opt.value}
                option={opt}
                isSelected={isSelected}
                isDisabled={false}
                shape="round"
                onClick={() => props.onSelect(opt.value)}
              />
            );
          })}
        </div>
      </div>
    </Tilt3D>
  );
}
