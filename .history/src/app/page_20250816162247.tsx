"use client"
import React, { useState, useEffect, Suspense } from "react";
import Navbar from "./components/navbar";
import DataVerificationPanel from "./components/MainPage";
import MeterParameterList from "./components/MeterParameterList";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Listbox } from "@headlessui/react";
import SearchBar from "./components/Search";
import { useRouter, useSearchParams } from "next/navigation";
import { RotatingLines } from "react-loader-spinner";

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
        console.log("Fetched meters (raw API response):", data);

        const meterNames = data.map((m: any) => m.meter_name);
        const uniqueKeys = data.map((m: any) => m.unique_key);
        const duplicateMeterNames = meterNames.filter(
          (name: string, index: number) => meterNames.indexOf(name) !== index
        );
        const duplicateUniqueKeys = uniqueKeys.filter(
          (key: string, index: number) => uniqueKeys.indexOf(key) !== index
        );
        if (duplicateMeterNames.length > 0) {
          console.warn("Duplicate meter names detected:", duplicateMeterNames);
        }
        if (duplicateUniqueKeys.length > 0) {
          console.error("Duplicate unique_keys detected:", duplicateUniqueKeys);
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
        console.log("Deduplicated meters:", deduplicatedMeters);
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
      meter.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
      meter.location.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  const showLoader = isPageLoading || (searchParams.has("meter") && selectedMeter === "" && !loading);

  return (
    <>
      <Navbar />
      <main className="flex items-start justify-center pt-2 sm:pt-4">
        <div className="relative w-[98%] sm:w-[97%] h-[90vh] sm:h-[87vh]">
          <div className="absolute top-[3px] left-0 right-0 bottom-0 bg-white shadow-md border-t-3 border-[#265F95] z-10 overflow-hidden flex flex-col rounded-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 pt-4 sm:pt-8 gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#265F95]">
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
                        <div className="relative">
                          <Listbox.Button className="appearance-none border border-gray-300 rounded-[10px] px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white text-black w-full flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#1A68B2]">
                            <span className="truncate">
                              {meters.find((m) => m.id === selectedMeter)
                                ?.name || "-- Select --"}
                            </span>
                            <RiArrowDropDownLine className="ml-2 text-xl flex-shrink-0" />
                          </Listbox.Button>
                          <Listbox.Options className="absolute mt-1 max-h-480 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/10 focus:outline-none z-20">
                            <div className="sticky top-0 bg-white z-30 px-3 py-2 border-b border-gray-200">
                              <input
                                type="text"
                                value={dropdownSearch}
                                onChange={(e) => setDropdownSearch(e.target.value)}
                                placeholder="Search meters..."
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-[8px] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#265F95] focus:border-transparent placeholder-gray-400"
                                autoFocus
                              />
                            </div>
                            {filteredMeters.length === 0 ? (
                              <div className="py-2 px-4 text-gray-500 text-sm">
                                No meters found
                              </div>
                            ) : (
                              filteredMeters.map((meter) => (
                                <Listbox.Option
                                  key={meter.id}
                                  value={meter.id}
                                  className={({ active }) =>
                                    `cursor-pointer select-none relative py-2 pl-4 pr-4 truncate text-sm ${
                                      active
                                        ? "bg-blue-100 text-blue-900"
                                        : "text-gray-900"
                                    }`
                                  }
                                >
                                  {meter.name}
                                </Listbox.Option>
                              ))
                            )}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    )}
                  </div>
                </div>
                {selectedMeter && (
                  <div className="w-full sm:w-48">
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
                    strokeColor="#265F95"
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