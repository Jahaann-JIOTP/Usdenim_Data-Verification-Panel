"use client";
import React, { useState, useEffect } from "react";
import { FaEdit as Edit, FaSave as Save } from "react-icons/fa";
import { RotatingLines } from "react-loader-spinner";

type ParameterStatus = "Verified" | "Not Verified" | "Not Sure" | "Not Used";

interface Parameter {
  param: string;
  status: ParameterStatus;
  createdAt: string;
  updatedAt: string;
}

interface MeterParameterListProps {
  selectedMeter: string;
  data: Parameter[];
  location: string;
  uniqueKey: string;
  searchQuery: string;
  statusFilter: string;
  currentPage: number;
  meterName: string;
  setCurrentPage: (page: number) => void;
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
  searchQuery,
  statusFilter,
  currentPage,
  meterName,
  setCurrentPage,
}) => {
  const [parameters, setParameters] = useState<Parameter[]>(data);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [comments, setComments] = useState<Record<string, string>>({});
  const [comment, setComment] = useState<string>("");
  const [isEditingComment, setIsEditingComment] = useState<boolean>(false);
  const [realTimeValues, setRealTimeValues] = useState<Record<string, number>>(
    {}
  );

  const [lastFetchedTime, setLastFetchedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRealTimeLoading, setIsRealTimeLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {}
  );
  const [meterComment, setMeterComment] = useState<string>("");

  const lastUpdatedToLocaleDate = lastUpdated
    ? new Date(lastUpdated).toLocaleString()
    : "N/A";

  //===================fetch parameters=============================
  const fetchParameters = async () => {
    if (!uniqueKey) return;
    setIsLoading(true);
    try {
      let url = `/api/meters/${uniqueKey}`;
      if (statusFilter && statusFilter !== "") {
        url = `/api/meters/filter?unique_key=${uniqueKey}&status=${encodeURIComponent(
          statusFilter
        )}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const apiData = await res.json();

        if (apiData?.parameters) {
          const dynamicParams: Parameter[] = apiData.parameters.map(
            (p: any) => ({
              param: p.paramName,
              status: (p.status || "Not Verified") as ParameterStatus,
              createdAt: p.createdAt || apiData.createdAt || null,
              updatedAt: p.updatedAt || apiData.updatedAt || null,
            })
          );

          setParameters(dynamicParams);
          setMeterComment(apiData.comment || "");

          // ✅ Latest parameter ka updatedAt nikaalna
          const latestParamUpdate = apiData.parameters
            .map((p: any) => new Date(p.updatedAt))
            .filter((d: Date) => !isNaN(d.getTime()))
            .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0];

          // Agar parameter ka updatedAt mila to wahi set karo warna meter ka updatedAt
          setLastUpdated(
            latestParamUpdate
              ? latestParamUpdate.toISOString()
              : apiData.updatedAt || null
          );
        }
      } else {
        setParameters(data);
      }
    } catch (err) {
      console.error("Error fetching parameters:", err);
      setParameters(data);
    } finally {
      setIsLoading(false);
    }
  };

  // =================== Update Status of Param =============================
  const updateMeterData = async (updates: {
    paramName?: string;
    newStatus?: ParameterStatus;
    comment?: string;
  }) => {
    try {
      const response = await fetch(`/api/meters/${uniqueKey}/update-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update meter data");
      return await response.json();
    } catch (error) {
      console.error("Error updating meter data:", error);
      throw error;
    }
  };

  const handleStatusChange = async (
    paramName: string,
    newStatus: ParameterStatus
  ) => {
    const originalIndex = parameters.findIndex((p) => p.param === paramName);
    if (originalIndex !== -1) {
      try {
        setUpdatingStatus((prev) => ({ ...prev, [paramName]: true }));

        const newParameters = [...parameters];
        newParameters[originalIndex].status = newStatus;

        // ✅ Local updatedAt turant update karo
        const now = new Date().toISOString();
        newParameters[originalIndex].updatedAt = now;
        setParameters(newParameters);

        // ✅ Header ka lastUpdated bhi turant update ho jaye
        setLastUpdated(now);

        await updateMeterData({
          paramName,
          newStatus,
        });
      } catch (error) {
        console.error("Failed to update status:", error);
      } finally {
        setUpdatingStatus((prev) => ({
          ...prev,
          [paramName]: false,
        }));
      }
    }
  };

  // =================== Comment Handling =============================
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

  // =================== Real Time Values =============================
  const fetchRealTimeValues = async () => {
    setIsRealTimeLoading(true);
    try {
      const response = await fetch("/api/usdenim-real-time-link");
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
    const interval = setInterval(fetchRealTimeValues, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchParameters();
  }, [uniqueKey, statusFilter]);

  useEffect(() => {
    setComment(comments[uniqueKey] || "");
    setIsEditingComment(false);
  }, [uniqueKey]);

  // =================== Filters, Pagination =============================
  const filteredParameters = parameters.filter((param) => {
    const paramName = param?.param || "";
    const matchesSearch = paramName
      .toLowerCase()
      .includes(searchQuery?.toLowerCase() || "");
    const matchesStatus = !statusFilter || param.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pageCount = Math.ceil(filteredParameters.length / PAGE_SIZE);
  const pagedParameters = filteredParameters.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // =================== Helpers =============================
  const getRealTimeValue = (paramName: string) => {
    if (uniqueKey === "USG_DP1_PS1_MRCZ1_PSL") {
      if (paramName === "PSB1_PSL_COUNTER_VALUE") {
        return realTimeValues["USG_DP1_PS1_PSB1_PSL_COUNTER_VALUE"] !==
          undefined
          ? realTimeValues["USG_DP1_PS1_PSB1_PSL_COUNTER_VALUE"].toFixed(2)
          : "N/A";
      }
      if (paramName === "MRCZ1_PSL_COUNTER_VALUE") {
        return realTimeValues["USG_DP1_PS1_MRCZ1_PSL_COUNTER_VALUE"] !==
          undefined
          ? realTimeValues["USG_DP1_PS1_MRCZ1_PSL_COUNTER_VALUE"].toFixed(2)
          : "N/A";
      }
    }
    const key = `${uniqueKey}_${paramName}`.replace(/\s+/g, "_");
    return realTimeValues[key] !== undefined
      ? realTimeValues[key].toFixed(2)
      : "N/A";
  };

  const getLastUpdatedTime = (updatedAt: string) => {
    if (!updatedAt) return "N/A";
    const date = new Date(updatedAt);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
  };

  const getStatusColor = (status: ParameterStatus, isSelected: boolean) => {
    if (!isSelected) return "text-gray-500";
    switch (status) {
      case "Verified":
        return "text-green-600";
      case "Not Verified":
        return "text-red-600";
      case "Not Sure":
        return "text-[#1A68B2]";
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
        return "bg-[#1A68B2]";
      case "Not Used":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  // =================== Render =============================
  return (
    <div className="bg-white px-2 sm:px-4 md:px-7 py-4">
      {/* Header */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-700 mb-4">
        <span>
          <span className="font-medium">Meter Name:</span>{" "}
          <span className="text-[#265F95] cursor-pointer">{meterName}</span>
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
          <span className="font-medium">Last Updated:</span>{" "}
          <span className="text-[#265F95]">{lastUpdatedToLocaleDate}</span>
        </span>
        <span>
          <span className="font-medium">Last Fetched:</span>{" "}
          <span className="text-[#265F95]">{lastFetchedTime || "N/A"}</span>
        </span>
      </div>

      {/* Title with Results Count */}
      <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
        <h1 className="text-base sm:text-lg font-medium text-[#7B849A] text-left">
          Parameter list for meter ({meterName})
        </h1>
        {(searchQuery || statusFilter) && (
          <div className="text-sm text-gray-600">
            Showing {filteredParameters.length} of {parameters.length}{" "}
            parameters
          </div>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-center text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr className="bg-[#02569738]">
              <th className="p-2 text-[#004981] border">Serial No.</th>
              <th className="p-2 border text-[#004981]">Parameter</th>
              <th className="p-2 border text-[#004981]">Value</th>
              <th className="p-2 border text-[#004981]">Status</th>
              <th className="p-2 border text-[#004981]">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8">
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
            ) : filteredParameters.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No parameters found.
                </td>
              </tr>
            ) : (
              pagedParameters.map((param, i) => (
                <tr
                  key={`${uniqueKey}-${param.param}`}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-2 border">
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="p-2 border">{param.param}</td>
                  <td className="p-2 border">
                    {getRealTimeValue(param.param)}
                  </td>
                  <td className="p-2 border">
                    <div className="flex flex-col md:flex-row justify-around gap-2">
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
                              name={`status-${uniqueKey}-${param.param}`}
                              checked={isSelected}
                              onChange={() =>
                                handleStatusChange(param.param, option)
                              }
                              className="hidden"
                              disabled={updatingStatus[param.param]}
                            />
                            <span className="text-xs sm:text-sm font-medium">
                              {option}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-2 border text-xs">
                    {getLastUpdatedTime(param.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeterParameterList;
