import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface Props {
  value?: string;
  placeholder?: string;
  options: Option[];
  onChange: (v?: string) => void;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative w-40" ref={ref}>
      {/* Input */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-left text-sm flex justify-between items-center hover:border-blue-400 transition"
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg z-20 text-sm">
          {/* <div
            className="px-3 py-2 text-gray-400 cursor-pointer hover:bg-gray-50"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
          >
            {placeholder}
          </div> */}

          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                value === opt.value ? "bg-blue-100 font-medium" : ""
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
