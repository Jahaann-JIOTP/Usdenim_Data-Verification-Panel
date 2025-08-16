"use client";
import React, { useState, useEffect, Suspense } from "react";
import Navbar from "./components/navbar";
import DataVerificationPanel from "./components/MainPage";
import MeterParameterList from "./components/MeterParameterList";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Listbox, Transition } from "@headlessui/react";
import SearchBar from "./components/Search";
import { useRouter, useSearchParams } from "next/navigation";
import { RotatingLines } from "react-loader-spinner";
import { Fragment } from "react";

interface Meter {
  id: string;
  name: string;
  location: string;
  unique_key: string;
}

const PageContent = () => {
  const [selectedMeter, setSelectedMeter] = useState<string>("");
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dropdownSearch, setDropdownSearch] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchMeters = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/meters/", {
        method: "GET",
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Fetched meters", data);

        const meterNames = data.map((m: any) => m.meter_name);
        const uniqueKeys = data.map((m: any) => m.unique_key);
        const duplicateMeterNames = meterNames.filter(
          (name: string, index: number) => meterNames.indexOf(name) !== index
        );
        const duplicateUniqueKeys = uniqueKeys.filter(
          (key: string, index: number) => uniqueKeys.indexOf(key) !== index
        );
        if (duplicateMeterNames.length > 0) {
        }

        const uniqueMeters = new Map();
        data.forEach((m: any) => {
          uniqueMeters.set(m.unique_key, {
            id: m.unique_key,
            name: m.meter_name,
            location: m.location,
            unique_key: m.unique_key,
          });
        });
        const deduplicatedMeters: Meter[] = Array.from(uniqueMeters.values());
        setMeters(deduplicatedMeters);
      } else {
        console.error("API request failed, status:", res.status);
        setMeters([]);
      }
    } catch (err) {
      console.error("Error fetching meters:", err);
      setMeters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsPageLoading(true);
      await fetchMeters();
      setIsPageLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading && meters.length > 0) {
      const meterFromUrl = searchParams.get("meter") || "";
      const searchFromUrl = searchParams.get("search") || "";
      const statusFromUrl = searchParams.get("status") || "";
      const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

      if (meterFromUrl && meters.some((m) => m.id === meterFromUrl)) {
        setSelectedMeter(meterFromUrl);
        setSearchQuery(searchFromUrl);
        setStatusFilter(statusFromUrl);
        setCurrentPage(isNaN(pageFromUrl) ? 1 : pageFromUrl);
      } else {
        setSelectedMeter("");
        setSearchQuery("");
        setStatusFilter("");
        setCurrentPage(1);
        router.push("/");
      }
    }
  }, [loading, meters, searchParams, router]);

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (selectedMeter) params.set("meter", selectedMeter);
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", currentPage.toString());
    router.push(`/?${params.toString()}`);
  };

  useEffect(() => {
    if (selectedMeter) updateUrl();
  }, [selectedMeter, searchQuery, statusFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleMeterChange = (value: string) => {
    setSelectedMeter(value);
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
    setDropdownSearch("");
  };

  const filteredMeters = meters.filter(
    (meter) =>
      meter.name.toLowerCase().includes(dropdownSearch.toLowerCase().trim()) ||
      meter.location.toLowerCase().includes(dropdownSearch.toLowerCase().trim())
  );

  const showLoader =
    isPageLoading ||
    (searchParams.has("meter") && selectedMeter === "" && !loading);

  return (
    <>
      <Navbar />
      <main className="flex items-start justify-center pt-2 sm:pt-4">
        <div className="relative w-[98%] sm:w-[97%] h-[90vh] sm:h-[87vh]">
          <div className="absolute top-[3px] left-0 right-0 bottom-0 bg-white shadow-md border-t-3 border-[#265F95] z-10 overflow-hidden flex flex-col rounded-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 pt-4 sm:pt-8 gap-4">
              <div>
                <h2 className="text-[23px] font-bold text-[#265F95]">
                  Data Verification Panel
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Select a meter from dropdown to verify and update the status
                  of individual data parameters.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label
                    htmlFor="meter"
                    className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap"
                  >
                    Select Meter:
                  </label>
                  <div className="relative w-full sm:w-48">
                    {loading ? (
                      <p className="text-xs text-gray-500">loading...</p>
                    ) : (
                      <Listbox
                        value={selectedMeter}
                        onChange={handleMeterChange}
                      >
                        {({ open }) => (
                          <div className="relative">
                            <Listbox.Button className="appearance-none border border-gray-300 rounded-[10px] px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white text-black w-full flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#1A68B2] transition-all duration-200 hover:border-[#1A68B2]">
                              <span className="truncate">
                                {meters.find((m) => m.id === selectedMeter)
                                  ?.name || "-- Select --"}
                              </span>
                              <RiArrowDropDownLine 
                                className={`ml-2 text-xl flex-shrink-0 transition-transform duration-200 ease-in-out ${
                                  open ? 'rotate-180' : ''
                                }`} 
                              />
                            </Listbox.Button>
                            
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-200"
                              enterFrom="opacity-0 scale-95 translate-y-[-10px]"
                              enterTo="opacity-100 scale-100 translate-y-0"
                              leave="transition ease-in duration-150"
                              leaveFrom="opacity-100 scale-100 translate-y-0"
                              leaveTo="opacity-0 scale-95 translate-y-[-10px]"
                            >
                              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-hidden rounded-md bg-white py-0 text-base shadow-lg ring-1 ring-black/10 focus:outline-none z-20 origin-top">
                                <div className="sticky top-0 bg-white z-30 px-3 py-2 border-b border-gray-200">
                                  <input
                                    type="text"
                                    value={dropdownSearch}
                                    onChange={(e) =>
                                      setDropdownSearch(e.target.value)
                                    }
                                    placeholder="Search meters..."
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-[8px] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#265F95] focus:border-transparent placeholder-gray-400 transition-all duration-200"
                                    autoFocus
                                  />
                                </div>
                                <div className="max-h-48 overflow-auto">
                                  {filteredMeters.length === 0 ? (
                                    <div className="py-3 px-4 text-gray-500 text-sm">
                                      No meters found
                                    </div>
                                  ) : (
                                    filteredMeters.map((meter, index) => (
                                      <Listbox.Option
                                        key={meter.id}
                                        value={meter.id}
                                        className={({ active, selected }) =>
                                          `cursor-pointer select-none relative py-2.5 pl-4 pr-4 truncate text-sm transition-colors duration-150 ease-in-out ${
                                            active
                                              ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900"
                                              : "text-gray-900 hover:bg-gray-50"
                                          } ${
                                            selected 
                                              ? "bg-blue-100 text-blue-900 font-medium" 
                                              : ""
                                          }`
                                        }
                                        style={{
                                          animationDelay: `${index * 20}ms`
                                        }}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="truncate">{meter.name}</span>
                                          {selectedMeter === meter.id && (
                                            <span className="text-blue-600 ml-2">✓</span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate mt-0.5">
                                          {meter.location}
                                        </div>
                                      </Listbox.Option>
                                    ))
                                  )}
                                </div>
                              </Listbox.Options>
                            </Transition>
                          </div>
                        )}
                      </Listbox>
                    )}
                  </div>
                </div>
                {selectedMeter && (
                  <div className="w-full sm:w-48 animate-fadeIn">
                    <SearchBar
                      setSearchQuery={setSearchQuery}
                      setStatusFilter={setStatusFilter}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {showLoader ? (
                <div className="flex justify-center items-center h-full">
                  <RotatingLines
                    strokeColor="#004981"
                    strokeWidth="5"
                    animationDuration="0.75"
                    width="50"
                    visible={true}
                  />
                </div>
              ) : selectedMeter === "" ? (
                <DataVerificationPanel />
              ) : (
                <MeterParameterList
                  selectedMeter={selectedMeter}
                  data={[]}
                  location={
                    meters.find((m) => m.id === selectedMeter)?.location || ""
                  }
                  uniqueKey={
                    meters.find((m) => m.id === selectedMeter)?.unique_key || ""
                  }
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add custom CSS for additional animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Stagger animation for dropdown items */
        .listbox-option-enter {
          animation: slideInStagger 0.2s ease-out forwards;
          opacity: 0;
          transform: translateY(-5px);
        }
        
        @keyframes slideInStagger {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <RotatingLines
            strokeColor="#265F95"
            strokeWidth="5"
            animationDuration="0.75"
            width="50"
            visible={true}
          />
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
};

export default Page;