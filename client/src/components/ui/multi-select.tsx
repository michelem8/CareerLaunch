import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabledOptions?: string[];
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  emptyMessage = "No options found.",
  disabledOptions = [],
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Add debug logging for value changes
  React.useEffect(() => {
    console.log("MultiSelect selected values:", selected);
  }, [selected]);

  const selectedLabels = selected.map(
    (value) => options.find((option) => option.value === value)?.label
  ).filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex flex-wrap gap-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    const value = options.find((option) => option.label === label)?.value;
                    if (value) {
                      onChange(selected.filter((s) => s !== value));
                    }
                  }}
                >
                  {label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  if (disabledOptions.includes(option.value)) return;
                  const isSelected = selected.includes(option.value);
                  const newSelected = isSelected
                    ? selected.filter((s) => s !== option.value)
                    : [...selected, option.value];
                  onChange(newSelected);
                }}
                disabled={disabledOptions.includes(option.value)}
                className={cn(
                  disabledOptions.includes(option.value) && "opacity-50 cursor-not-allowed"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
