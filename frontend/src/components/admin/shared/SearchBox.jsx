import { Search } from "lucide-react";

export function SearchBox({ value, placeholder, onChange }) {
  return (
    <div className="flex bg-card border border-border p-2 max-w-md focus-within:border-foreground transition-colors">
      <Search className="w-5 h-5 text-muted-foreground ml-2 my-auto box-content" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none w-full px-4 py-2 font-serif text-sm"
      />
    </div>
  );
}
