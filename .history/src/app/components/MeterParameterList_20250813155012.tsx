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
  searchQuery?: string;
  statusFilter?: string;
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
  searchQuery = "",
  statusFilter = "",
}) => {
  const [parameters, setParameters] = useState<Parameter[]>(data);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [comment, setComment] = useState<string>("");
  const [isEditingComment, setIsEditingComment] = useState<boolean>(false);
  const [realTimeValues, setRealTimeValues] = useState<Record<string, number>>({});
  const [lastFetchedTime, setLastUpdatedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRealTimeLoading, setIsRealTimeLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const [meterComment, setMeterComment] = useState<string>("");

  // Unified API call function
  const updateMeterData = async (updates: {
    paramName?: string;
    newStatus?: ParameterStatus;
    comment?: string;
  }) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/meters/${uniqueKey}/update-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );
      if (!response.ok) throw new Error("Failed to update meter data");
      return await response.json();
    } catch (error) {
      console.error("Error updating meter data:", error);
      throw error;
    }
  };

  const fetchRealTimeValues = async () => {
    setIsRealTimeLoading(true);
    try {
      const response = await fetch("http://13.234.241.103:1880/surajcotton");
      if (!response.ok) throw new Error("Failed to fetch real-time data");
      const data = await response.json();
      setRealTimeValues(data);
      setLastUpdatedTime(new Date().toLocaleTimeString());
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

  const fetchParameters = async () => {
    if (!uniqueKey) return;
    setIsLoading(true);
    try {
      let url = `http://localhost:3000/api/meters/${uniqueKey}`;
      if (statusFilter && statusFilter !== "") {
        url = `http://localhost:3000/api/meters/filter?unique_key=${uniqueKey}&status=${encodeURIComponent(statusFilter)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const apiData = await res.json();
        if (apiData?.parameters) {
          const dynamicParams: Parameter[] = apiData.parameters.map(
            (p: any) => ({
              param: p.paramName,
              status: (p.status || "Not Verified") as ParameterStatus,
            })
          );
          setParameters(dynamicParams);
          setMeterComment(apiData.comment || "");
        }
      } else {
        setParameters(data);
      }
    } catch (err) {
      setParameters(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, [uniqueKey, statusFilter]);

  // Filter parameters based on search query and status filter
  const filteredParameters = parameters.filter((param) => {
    const matchesSearch = param.param.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || param.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Update comment state when uniqueKey changes
  useEffect(() => {
    setComment(comments[uniqueKey] || "");
    setIsEditingComment(false);
  }, [uniqueKey]);

  const pageCount = Math.ceil(filteredParameters.length / PAGE_SIZE);
  const pagedParameters = filteredParameters.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleStatusChange = async (index: number, newStatus: ParameterStatus) => {
    const paramToUpdate = pagedParameters[index];
    const originalIndex = parameters.findIndex(p => p.param === paramToUpdate.param);
    if (originalIndex !== -1) {
      try {
        setUpdatingStatus(prev => ({...prev, [paramToUpdate.param]: true}));
        const newParameters = [...parameters];
        newParameters[originalIndex].status = newStatus;
        setParameters(newParameters);
        setLastUpdated(getCurrentTime());
        await updateMeterData({
          paramName: paramToUpdate.param,
          newStatus: newStatus
        });
      } catch (error) {
        const originalParameters = [...parameters];
        setParameters(originalParameters);
        console.error("Failed to update status:", error);
      } finally {
        setUpdatingStatus(prev => ({...prev, [paramToUpdate.param]: false}));
      }
    }
  };

  const handleSaveComment = async () => {
    try {
      await updateMeterData({ comment });
      setComments((prev) => ({
        ...prev,
        [uniqueKey]: comment,
      }));
      setMeterComment(comment);
      setIsEditingComment(false);
    } catch (error) {
      console.error("Failed to save comment:", error);
    }
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
    <div className="bg-white px-2 sm:px-4 md:px-6 lg:px-8 py-4 rounded-lg shadow-sm max-w-full">
      {/* Header */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-700 mb-4">
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
          <span className="text-[#265F95]">{lastUpdatedTime || "N/A"}</span>
        </span>
      </div>
      {/* Title with Results Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h1 className="text-base sm:text-lg font-medium text-[#7B849A] text-left">
          Parameter list for meter ({selectedMeter})
        </h1>
        {(searchQuery || statusFilter) && (
          <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-2">
            <span>Showing {filteredParameters.length} of {parameters.length} parameters</span>
            {searchQuery && (
              <span className="ml-2">
                • Search: "<span className="font-medium text-blue-600">{searchQuery}</span>"
              </span>
            )}
            {statusFilter && (
              <span className="ml-2">
                • Status: <span className="font-medium text-blue-600">{statusFilter}</span>
              </span>
            )}
          </div>
        )}
      </div>
      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full w-full border border-gray-200 text-center text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr className="bg-[#02569738]">
              <th className="p-2 sm:p-3 text-[#004981] border whitespace-nowrap w-[10%]">
                Serial No.
              </th>
              <th className="p-2 sm:p-3 border text-[#004981] whitespace-nowrap w-[30%]">
                Parameter
              </th>
              <th className="p-2 sm:p-3 border text-[#004981] whitespace-nowrap w-[20%]">
                Value
              </th>
              <th className="p-2 sm:p-3 border text-[#004981] whitespace-nowrap w-[40%]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr className="h-[200px]">
                <td colSpan={4} className="p-8">
                  <div className="flex justify-center items-center h-[50vh] sm:h-[30vh]">
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
            ) : filteredParameters.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 text-xs sm:text-sm">
                  {searchQuery || statusFilter
                    ? "No parameters found matching your search criteria."
                    : "No parameters available."}
                </td>
              </tr>
            ) : (
              pagedParameters.map((param, i) => (
                <tr key={`${param.param}-${i}`} className="border-t hover:bg-gray-50">
                  <td className="p-2 sm:p-3 border whitespace-nowrap">
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="p-2 sm:p-3 border text-center truncate">
                    {searchQuery ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: param.param.replace(
                            new RegExp(`(${searchQuery})`, 'gi'),
                            '<mark class="bg-yellow-200 font-medium">$1</mark>'
                          )
                        }}
                      />
                    ) : (
                      param.param
                    )}
                  </td>
                  <td className="p-2 sm:p-3 border whitespace-nowrap">
                    {getRealTimeValue(param.param)}
                  </td>
                  <td className="p-2 sm:p-3 border">
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                      {statusOptions.map((option) => {
                        const isSelected = param.status === option;
                        return (
                          <label
                            key={option}
                            className={`flex items-center gap-1 cursor-pointer whitespace-nowrap text-xs sm:text-sm ${getStatusColor(
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
                              name={`status-${param.param}-${i}`}
                              checked={isSelected}
                              onChange={() => handleStatusChange(i, option)}
                              className="hidden"
                              disabled={updatingStatus[param.param]}
                            />
                            <span className="font-medium">{option}</span>
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
            className="px-2 py-1 sm:px-3 sm:py-1 border rounded shadow-sm bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition disabled:opacity-50 disabled:shadow-none text-xs sm:text-sm"
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
                  className={`px-2 py-1 sm:px-3 sm:py-1 border rounded shadow-sm bg-white transition text-xs sm:text-sm
                    ${
                      currentPage === idx + 1
                        ? "font-bold text-black bg-blue-100 border-[#004981] shadow"
                        : "text-gray-600 hover:bg-blue-100 hover:text-blue-700"
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
                <span key={idx} className="px-2 text-gray-400 select-none text-xs sm:text-sm">
                  ...
                </span>
              );
            }
            return null;
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            className="px-2 py-1 sm:px-3 sm:py-1 border rounded shadow-sm bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition disabled:opacity-50 disabled:shadow-none text-xs sm:text-sm"
            disabled={currentPage === pageCount}
          >
            {">"}
          </button>
        </div>
      )}
      {/* Comment */}
      {!isLoading && (
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
              <h3 className="text-base sm:text-lg font-medium text-gray-600">
                Add comment (for this Meter)
              </h3>
              {isEditingComment ? (
                <button
                  onClick={handleSaveComment}
                  className="text-[#265F95] hover:text-blue-700 flex items-center gap-1 text-xs sm:text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              ) : meterComment || comments[uniqueKey] ? (
                <button
                  onClick={() => {
                    setComment(meterComment || comments[uniqueKey] || "");
                    setIsEditingComment(true);
                  }}
                  className="text-[#265F95] hover:text-blue-700 flex items-center gap-1 text-xs sm:text-sm font-medium"
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
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#265F95] min-h-[6rem] resize-y"
                placeholder="Type your comment here..."
                autoFocus
              />
            ) : meterComment || comments[uniqueKey] ? (
              <div className="border border-transparent px-3 py-2 rounded min-h-[6rem] whitespace-pre-wrap bg-gray-50 text-xs sm:text-sm">
                {meterComment || comments[uniqueKey]}
              </div>
            ) : (
              <button
                onClick={() => {
                  setComment("");
                  setIsEditingComment(true);
                }}
                className="text-[#265F95] hover:text-blue-700 text-xs sm:text-sm font-medium hover:underline"
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