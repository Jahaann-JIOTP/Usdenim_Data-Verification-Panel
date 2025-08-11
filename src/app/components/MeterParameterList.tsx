"use client";
import React, { useState, useEffect } from "react";
import { FaEdit as Edit, FaSave as Save } from "react-icons/fa";
import { RotatingLines } from "react-loader-spinner";

type ParameterStatus = "Verified" | "Not Verified" | "Not Sure" | "Not Used";

interface Parameter {
  param: string;
  status: ParameterStatus;
}

interface MeterParameterListProps {
  selectedMeter: string;
  data: Parameter[];
  location: string;
  uniqueKey: string;
}

const statusOptions: ParameterStatus[] = [
  "Verified",
  "Not Verified",
  "Not Sure",
  "Not Used",
];

const PAGE_SIZE = 10;

const MeterParameterList: React.FC<MeterParameterListProps> = ({
  selectedMeter,
  data,
  location,
  uniqueKey,
}) => {
  const [parameters, setParameters] = useState<Parameter[]>(data);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [comment, setComment] = useState<string>("");
  const [isEditingComment, setIsEditingComment] = useState<boolean>(false);
  const [realTimeValues, setRealTimeValues] = useState<Record<string, number>>(
    {}
  );
  const [lastFetchedTime, setLastFetchedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true); // New loading state
  const [isRealTimeLoading, setIsRealTimeLoading] = useState<boolean>(true); // Loading state for real-time data

  const fetchRealTimeValues = async () => {
    setIsRealTimeLoading(true);
    try {
      const response = await fetch("http://13.234.241.103:1880/surajcotton");
      if (!response.ok) throw new Error("Failed to fetch real-time data");
      const data = await response.json();
      setRealTimeValues(data);
      setLastFetchedTime(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching real-time data:", error);
    } finally {
      setIsRealTimeLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeValues();
    const interval = setInterval(fetchRealTimeValues, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSpecificMeterListing = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/meters/${uniqueKey}`);
        const apiData = await res.json();
        if (res.ok && apiData?.parameters) {
          const dynamicParams: Parameter[] = apiData.parameters.map(
            (p: any) => ({
              param: p.paramName,
              status: (p.status || "Not Verified") as ParameterStatus,
            })
          );
          setParameters(dynamicParams);
        }
      } catch (err) {
        console.error("Error fetching meters:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (uniqueKey) fetchSpecificMeterListing();
  }, [uniqueKey]);

  // Update comment state when page changes
  useEffect(() => {
    setComment(comments[currentPage] || "");
    setIsEditingComment(false);
  }, [currentPage]);

  const pageCount = Math.ceil(parameters.length / PAGE_SIZE);
  const pagedParameters = parameters.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleStatusChange = (index: number, newStatus: ParameterStatus) => {
    const newParameters = [...parameters];
    const absoluteIndex = (currentPage - 1) * PAGE_SIZE + index;
    newParameters[absoluteIndex].status = newStatus;
    setParameters(newParameters);
    setLastUpdated(getCurrentTime());
  };

  const getStatusColor = (status: ParameterStatus, isSelected: boolean) => {
    if (!isSelected) return "text-gray-500";
    switch (status) {
      case "Verified":
        return "text-green-600";
      case "Not Verified":
        return "text-red-600";
      case "Not Sure":
        return "text-blue-600";
      case "Not Used":
        return "text-yellow-600";
      default:
        return "text-gray-500";
    }
  };

  const getDotColor = (status: ParameterStatus, isSelected: boolean) => {
    if (!isSelected) return "bg-gray-300";
    switch (status) {
      case "Verified":
        return "bg-green-500";
      case "Not Verified":
        return "bg-red-500";
      case "Not Sure":
        return "bg-blue-500";
      case "Not Used":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const getRealTimeValue = (paramName: string) => {
    if (isRealTimeLoading) return "Loading...";
    const key = `${uniqueKey}_${paramName}`.replace(/\s+/g, "_");
    return realTimeValues[key] !== undefined
      ? realTimeValues[key].toFixed(2)
      : "N/A";
  };

  return (
    <div className="bg-white px-2 sm:px-4 md:px-7 py-4 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-700 mb-4">
        <span>
          <span className="font-medium">Meter:</span>{" "}
          <span className="text-[#265F95] cursor-pointer">{selectedMeter}</span>
        </span>
        <span>
          <span className="font-medium">Location:</span>{" "}
          <span className="text-[#265F95] cursor-pointer">{location}</span>
        </span>
        <span>
          <span className="font-medium">Unique ID:</span>{" "}
          <span className="text-[#265F95] cursor-pointer">{uniqueKey}</span>
        </span>
        <span>
          <span className="font-medium">CT Ratio:</span>{" "}
          <span className="text-[#265F95]">Not Available</span>
        </span>
        <span>
          <span className="font-medium">PT Ratio:</span>{" "}
          <span className="text-[#265F95]">Not Available</span>
        </span>
        <span>
          <span className="font-medium">Modbus ID:</span>{" "}
          <span className="text-[#265F95]">Not Available</span>
        </span>
        <span>
          <span className="font-medium">Last Updated:</span>{" "}
          <span className="text-[#265F95]">{lastUpdated || "N/A"}</span>
        </span>
        <span>
          <span className="font-medium">Last Fetched:</span>{" "}
          <span className="text-[#265F95]">{lastFetchedTime || "N/A"}</span>
        </span>
      </div>

      {/* Title */}
      <h1 className="text-base sm:text-lg font-medium text-[#7B849A] mb-2 text-left">
        Parameter list for meter ({selectedMeter})
      </h1>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full sm:min-w-[500px] w-full border border-gray-200 text-center text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr className="bg-[#02569738]">
              <th className="p-2 text-[#004981] border whitespace-nowrap">
                Serial No.
              </th>
              <th className="p-2 sm:pl-[25px] sm:pr-10 border text-[#004981] whitespace-nowrap">
                Parameter
              </th>
              <th className="p-2 sm:pl-[26px] sm:pr-10 border text-[#004981] whitespace-nowrap">
                Value
              </th>
              <th className="p-2 border text-[#004981] whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr className="height-[200px]">
                <td colSpan={4} className="p-8">
                  <div className="flex justify-center items-center h-[50vh]">
                    <RotatingLines
                      strokeColor="#265F95"
                      strokeWidth="5"
                      animationDuration="0.75"
                      width="50"
                      visible={true}
                    />
                  </div>
                </td>
              </tr>
            ) : (
              pagedParameters.map((param, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2 border whitespace-nowrap">
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="p-2 sm:p-3 border whitespace-nowrap">
                    {param.param}
                  </td>
                  <td className="p-2 border whitespace-nowrap">
                    {getRealTimeValue(param.param)}
                  </td>
                  <td className="p-2 border">
                    <div className="flex flex-nowrap justify-around gap-1 sm:gap-4">
                      {statusOptions.map((option) => {
                        const isSelected = param.status === option;
                        return (
                          <label
                            key={option}
                            className={`flex items-center gap-1 cursor-pointer ${getStatusColor(
                              option,
                              isSelected
                            )}`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full ${getDotColor(
                                option,
                                isSelected
                              )}`}
                            ></span>
                            <input
                              type="radio"
                              name={`status-${i}`}
                              checked={isSelected}
                              onChange={() => handleStatusChange(i, option)}
                              className="hidden"
                            />
                            <span className="text-xs sm:text-sm font-medium">
                              {option}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && pageCount > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2 border rounded text-gray-600 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          {Array.from({ length: pageCount }).map((_, idx) => {
            if (
              idx === 0 ||
              idx === pageCount - 1 ||
              Math.abs(currentPage - (idx + 1)) <= 1
            ) {
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-2 border rounded ${
                    currentPage === idx + 1
                      ? "font-bold text-black border-gray-400"
                      : "text-gray-600 border-transparent"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            }
            if (
              (idx === 1 && currentPage > 3) ||
              (idx === pageCount - 2 && currentPage < pageCount - 2)
            ) {
              return (
                <span key={idx} className="px-2 text-gray-400 select-none">
                  ...
                </span>
              );
            }
            return null;
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            className="px-2 border rounded text-gray-600 disabled:opacity-50"
            disabled={currentPage === pageCount}
          >
            {">"}
          </button>
        </div>
      )}

      {/* Comment */}
      {!isLoading && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="w-full">
            <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
              <h3 className="text-base font-medium text-gray-600">
                Add comment (for this Meter)
              </h3>
              {isEditingComment ? (
                <button
                  onClick={() => {
                    setComments((prev) => ({
                      ...prev,
                      [currentPage]: comment,
                    }));
                    setIsEditingComment(false);
                  }}
                  className="text-[#265F95] hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              ) : comments[currentPage] ? (
                <button
                  onClick={() => {
                    setComment(comments[currentPage]);
                    setIsEditingComment(true);
                  }}
                  className="text-[#265F95] hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              ) : null}
            </div>

            {isEditingComment ? (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-[#265F95] min-h-[6rem] resize-y"
                placeholder="Type your comment here..."
                autoFocus
              />
            ) : comments[currentPage] ? (
              <div className="border border-transparent px-3 py-2 rounded min-h-[6rem] whitespace-pre-wrap bg-gray-50">
                {comments[currentPage]}
              </div>
            ) : (
              <button
                onClick={() => {
                  setComment("");
                  setIsEditingComment(true);
                }}
                className="text-[#265F95] hover:text-blue-700 text-sm font-medium hover:underline"
              >
                + Add comment
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeterParameterList;