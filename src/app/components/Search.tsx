"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";

interface SearchBarProps {
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
}

type ParameterStatus = "Verified" | "Not Verified" | "Not Sure" | "Not Used";
type StatusFilter = ParameterStatus | "";

export default function SearchBar({ setSearchQuery, setStatusFilter }: SearchBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [searchInput, setSearchInput] = useState<string>("");
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<StatusFilter>("");

  const statusOptions: ParameterStatus[] = [
    "Verified",
    "Not Verified",
    "Not Sure",
    "Not Used",
  ];

  const toggleFilterDropdown = () => {
    if (filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setIsFilterOpen(!isFilterOpen);
  };

  const handleOptionClick = (newStatus: StatusFilter) => {
    setStatus(newStatus);
    setStatusFilter(newStatus);
    setIsFilterOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setSearchQuery(e.target.value);
  };

  const getStatusColor = (status: ParameterStatus) => {
    const colors = {
      "Verified": "text-green-600",
      "Not Verified": "text-red-500",
      "Not Sure": "text-blue-500",
      "Not Used": "text-yellow-600",
    };
    return colors[status];
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  return (
    <div className="flex items-center gap-2 w-full max-w-sm relative">
      {/* Search Input Box */}
      <div className="flex items-center flex-1 border border-gray-300 rounded-md px-3 py-2">
        <Search className="text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search"
          value={searchInput}
          onChange={handleSearchChange}
          className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>
      {/* Filter Button Box */}
      <button
        ref={filterButtonRef}
        onClick={toggleFilterDropdown}
        className="flex items-center justify-center border border-gray-300 rounded-md p-2 hover:bg-gray-100"
      >
        <SlidersHorizontal className="w-4 h-4 text-[#1A68B2]" />
      </button>
      {/* Filter Dropdown */}
      {isFilterOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 bg-white shadow-lg rounded-md border border-gray-200 w-48 max-h-48 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            transform: 'translateX(-100%)'
          }}
        >
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Filter by Status</h3>
          </div>
          <div
            onClick={() => handleOptionClick("")}
            className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center ${
              status === "" ? "font-medium" : ""
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${
                status === "" ? "border-blue-500 bg-blue-500" : "border-gray-300"
              }`}
            >
              {status === "" && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={status === "" ? "text-blue-600" : "text-gray-700"}>
              All
            </span>
          </div>
          {statusOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center ${
                status === option ? "font-medium" : ""
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${
                  status === option
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {status === option && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={status === option ? getStatusColor(option) : "text-gray-700"}>
                {option}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}