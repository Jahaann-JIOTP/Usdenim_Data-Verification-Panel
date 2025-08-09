"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import DataVerificationPanel from "./components/MainPage";
import MeterParameterList from "./components/MeterParameterList";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Listbox } from "@headlessui/react";
import SearchBar from "./components/Search";
import { parameters } from "./components/data";
import { fetchMeters } from "./components/actions/fetchmeters"; // Adjust the import path as necessary
interface Meter {
  id: string;  // from unique_key
  name: string; // from meter_name
  location: string;
}

const Page = () => {
  const [selectedMeter, setSelectedMeter] = useState<string>("");
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Async function to fetch data
  const fetchMeters = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/meters/", {
        method: "GET",
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Fetched meters:", data);

        // Map API data to our Meter type
        setMeters(
          data.map((m: any) => ({
            id: m.meter_name,
            name: m.meter_name,   
            location: m.location, 
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching meters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);
  // const meter = fetchMeters();

  // console.log(meter);

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

                  {/* Dropdown */}
                  <div className="relative w-full sm:w-48">
                    {loading ? (
                      <p className="text-xs text-gray-500">Loading...</p>
                    ) : (
                      <Listbox value={selectedMeter} onChange={setSelectedMeter}>
                        <div className="relative">
                          <Listbox.Button className="appearance-none border border-gray-300 rounded-[10px] px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white text-black w-full flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {meters.find((m) => m.id === selectedMeter)?.name || "-- Select --"}
                            <RiArrowDropDownLine className="ml-2 text-xl" />
                          </Listbox.Button>
                          <Listbox.Options className="absolute mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/10 focus:outline-none z-20">
                            {meters.map((meter) => (
                              <Listbox.Option
                                key={meter.id}
                                value={meter.id}
                                className={({ active }) =>
                                  `cursor-pointer select-none relative py-2 pl-4 pr-4 ${
                                    active
                                      ? "bg-blue-100 text-blue-900"
                                      : "text-gray-900"
                                  }`
                                }
                              >
                                {meter.name}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    )}
                  </div>
                </div>

                {selectedMeter && (
                  <div className="w-full sm:w-48">
                    <SearchBar />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {selectedMeter === "" ? (
                <DataVerificationPanel />
              ) : (
                <MeterParameterList selectedMeter={selectedMeter} data={parameters}  location={meters.find(m => m.id === selectedMeter)?.location || ""} />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;
