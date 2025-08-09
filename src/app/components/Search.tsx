import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex items-center gap-2 w-full max-w-sm">
      {/* Search Input Box */}
      <div className="flex items-center flex-1 border border-gray-300 rounded-md px-3 py-2">
        <Search className="text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search"
          className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Filter Button Box */}
      <button className="flex items-center justify-center border border-gray-300 rounded-md p-2 hover:bg-gray-100">
        <SlidersHorizontal className="w-4 h-4 text-blue-600" />
      </button>
    </div>
  );
}


