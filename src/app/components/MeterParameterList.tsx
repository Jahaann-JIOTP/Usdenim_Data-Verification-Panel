"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Edit, Save } from "lucide-react";

type ParameterStatus = "Verified" | "Not Verified" | "Not Sure" | "Not Used";

interface Parameter {
  param: string;
  value: string;
  status: ParameterStatus;
}

interface MeterParameterListProps {
  selectedMeter: string;
  data: Parameter[];
  location: string;
}

const statusOptions: ParameterStatus[] = [
  "Verified",
  "Not Verified",
  "Not Sure",
  "Not Used",
];

const PAGE_SIZE = 12;

const MeterParameterList: React.FC<MeterParameterListProps> = ({ selectedMeter, data, location }) => {
  const [parameters, setParameters] = useState<Parameter[]>(data);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [comment, setComment] = useState<string>("");
  const [isEditingComment, setIsEditingComment] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  const tableRef = useRef<HTMLTableElement>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const triggerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pageCount = Math.ceil(parameters.length / PAGE_SIZE);
  const pagedParameters = parameters.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const groupedParameters = [];
  for (let i = 0; i < pagedParameters.length; i += 3) {
    groupedParameters.push(pagedParameters.slice(i, i + 3));
  }

  const savedComment = comments[currentPage] || "";

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleStatusChange = (index: number, newStatus: ParameterStatus) => {
    const newParameters = [...parameters];
    newParameters[index].status = newStatus;
    setParameters(newParameters);
    setOpenDropdownId(null);
    setLastUpdated(getCurrentTime());
  };

  const toggleDropdown = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (triggerRefs.current[index]) {
      const rect = triggerRefs.current[index]!.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
    setOpenDropdownId(openDropdownId === index ? null : index);
  };

  const getStatusColor = (status: ParameterStatus) => {
    const colors = {
      "Verified": "text-green-600",
      "Not Verified": "text-gray-500",
      "Not Sure": "text-blue-500",
      "Not Used": "text-yellow-600"
    };
    return colors[status];
  };

  const handleCommentSave = () => {
    setComments(prev => ({ ...prev, [currentPage]: comment }));
    setIsEditingComment(false);
    setLastUpdated(getCurrentTime());
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(pageCount, newPage)));
    setIsEditingComment(false);
    setOpenDropdownId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        const dropdownElement = dropdownRefs.current[openDropdownId];
        const triggerElement = triggerRefs.current[openDropdownId];
        
        if (
          dropdownElement && 
          !dropdownElement.contains(event.target as Node) &&
          triggerElement &&
          !triggerElement.contains(event.target as Node)
        ) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  useEffect(() => {
    if (openDropdownId !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [openDropdownId]);

  return (
    <div className="bg-white px-2 py-2 sm:px-4 md:px-6 lg:px-8 overflow-y-auto h-full">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-2">
          <div>
            <span className="font-medium text-gray-800">Meter:</span>{" "}
            <span className="text-[#265F95]">
              {selectedMeter.replace("meter", "Meter ")}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Location:</span>{" "}
            <span className="text-[#265F95]">{location}</span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Last Updated:</span>{" "}
            <span className="text-[#265F95]">{lastUpdated || "Not updated yet"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Unique ID:</span>{" "}
            <span className="text-[#265F95]">{"921"}</span>

          </div>
           <div>
            <span className="font-medium text-gray-800">PT Ratio:</span>{" "}
            <span className="text-[#265F95]">{"470.5"}</span>

          </div>
           <div>
            <span className="font-medium text-gray-800">CT Ratio:</span>{" "}
            <span className="text-[#265F95]">{"921"}</span>

          </div>
           <div>
            <span className="font-medium text-gray-800">Modbus ID:</span>{" "}
            <span className="text-[#265F95]">{"921"}</span>
          </div>
        </div>

        <h1 className="text-lg font-medium text-gray-700 mt-2">
          Parameter list for {selectedMeter.replace("meter", "Meter ")}
        </h1>
      </div>

      <div className="mt-1 w-full overflow-x-auto">
        <table ref={tableRef} className="min-w-full border-collapse">
          <thead>
            <tr className="text-[#265F95] border-b border-gray-200">
              {Array.from({ length: 3 }).map((_, i) => (
                <React.Fragment key={i}>
                  <th className="py-3 px-2 sm:px-4 text-left font-semibold bg-gray-50">
                    Param
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-left font-semibold bg-gray-50">
                    Value
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-left font-semibold bg-gray-50">
                    Status
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedParameters.map((group, groupIndex) => (
              <tr key={groupIndex} className="border-b border-gray-100 hover:bg-gray-50">
                {group.map((param, paramIndex) => {
                  const absoluteIndex = (currentPage - 1) * PAGE_SIZE + groupIndex * 3 + paramIndex;
                  return (
                    <React.Fragment key={paramIndex}>
                      <td className="py-3 px-2 sm:px-4 text-gray-500">{param.param}</td>
                      <td className="py-3 px-2 sm:px-4 font-medium text-gray-700">{param.value}</td>
                      <td className="py-3 px-2 sm:px-4 relative">
                        <div
                          ref={(el) => (triggerRefs.current[absoluteIndex] = el)}
                          className="dropdown-trigger flex items-center cursor-pointer w-fit"
                          onClick={(e) => toggleDropdown(absoluteIndex, e)}
                          data-index={absoluteIndex}
                        >
                          <span className={`mr-1 ${getStatusColor(param.status)}`}>
                            {param.status}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              openDropdownId === absoluteIndex ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                        {openDropdownId === absoluteIndex && (
                          <div
                            ref={(el) => (dropdownRefs.current[absoluteIndex] = el)}
                            className="fixed z-50 bg-white shadow-lg rounded-md border border-gray-200 w-40 max-h-48 overflow-y-auto"
                            style={{
                              top: `${dropdownPosition.top}px`,
                              left: `${dropdownPosition.left}px`
                            }}
                          >
                            {statusOptions.map((option) => (
                              <div
                                key={option}
                                className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center ${
                                  param.status === option ? "font-medium" : ""
                                }`}
                                onClick={() => handleStatusChange(absoluteIndex, option)}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${
                                    param.status === option
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {param.status === option && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span
                                  className={
                                    param.status === option ? getStatusColor(option) : "text-gray-700"
                                  }
                                >
                                  {option}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </React.Fragment>
                  );
                })}
                {Array(3 - group.length).fill(null).map((_, i) => (
                  <React.Fragment key={`empty-${i}`}>
                    <td className="py-3 px-2 sm:px-4"></td>
                    <td className="py-3 px-2 sm:px-4"></td>
                    <td className="py-3 px-2 sm:px-4"></td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center gap-4 sm:gap-10 items-center mt-6 max-w-md mx-auto">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 border rounded text-sm font-medium ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#265F95] hover:bg-gray-100"
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700 text-sm">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{pageCount}</span>
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            className={`px-3 py-1 border rounded text-sm font-medium ${
              currentPage === pageCount
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#265F95] hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-medium text-gray-600">
              Add comment (for this Meter)
            </h3>
            {isEditingComment ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingComment(false)}
                  className="text-[#265F95] hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleCommentSave}
                  className="text-[#265F95] hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            ) : savedComment ? (
              <button
                onClick={() => {
                  setComment(savedComment);
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
          ) : savedComment ? (
            <div className="border border-transparent px-3 py-2 rounded min-h-[6rem] whitespace-pre-wrap bg-gray-50">
              {savedComment}
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
    </div>
  );
};

export default MeterParameterList;