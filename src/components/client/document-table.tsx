"use client";

import type React from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useUploadDocumentFileMutation,
  useDownloadClientDocQuery,
} from "@/src/store/client/clientApiSlice";
import { useState, useRef, useMemo } from "react";
import { Cloud, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface DocumentRequestsTableProps {
  data: {
    srNo: number;
    details: string;
    requestDate: string;
    status: "PENDING" | "FULFILLED" | "OVERDUE";
    dueDate: string;
    id: number;
  }[];
  userId: string;
  refetch: () => void;
}

const ITEMS_PER_PAGE = 6;

const DocumentRequestsTable = ({
  data,
  userId,
  refetch,
}: DocumentRequestsTableProps) => {
  const [uploadDocument] = useUploadDocumentFileMutation();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [uploadingFiles, setUploadingFiles] = useState<
    {
      file: File;
      progress: number;
      status: "uploading" | "completed" | "error";
    }[]
  >([]);
  const [viewingDocumentId, setViewingDocumentId] = useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  // Get current page data
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [data, currentPage]);

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate OVERDUE status based on due date
  const getStatus = (originalStatus: string, dueDate: string) => {
    if (originalStatus === "FULFILLED") return "FULFILLED";
    const today = new Date();
    const dueDateTime = new Date(dueDate);
    return today > dueDateTime ? "OVERDUE" : "PENDING";
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedRequestId) {
      console.error("No request ID selected");
      return;
    }

    // Validate file type
    const validFileTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validFileTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF or DOCX files only.");
      console.error("Invalid file type:", file.type);
      return;
    }

    console.log("Starting file upload with:", {
      userId,
      requestId: selectedRequestId,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });

    try {
      // Add file to uploading list
      setUploadingFiles((prev) => [
        ...prev,
        { file, progress: 0, status: "uploading" },
      ]);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      // Actual upload - pass the file directly
      const response = await uploadDocument({
        userId,
        requestId: selectedRequestId.toString(),
        file,
      }).unwrap();

      console.log("Upload response:", response);

      // Complete upload
      clearInterval(progressInterval);
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, progress: 100, status: "completed" } : f
        )
      );

      toast.success("Document uploaded successfully!");
      setTimeout(() => {
        setUploadDialogOpen(false);
        setUploadingFiles([]);
        refetch();
      }, 1000);
    } catch (error: unknown) {
      // Type guard for RTK Query errors
      const isFetchBaseQueryError = (
        error: unknown
      ): error is FetchBaseQueryError =>
        typeof error === "object" && error != null && "status" in error;

      const isErrorWithMessage = (
        error: unknown
      ): error is { message: string } =>
        typeof error === "object" &&
        error != null &&
        "message" in error &&
        typeof error.message === "string";

      console.error("Upload error details:", {
        error,
        status: isFetchBaseQueryError(error) ? error.status : "unknown",
        data: isFetchBaseQueryError(error) ? error.data : null,
        requestDetails: {
          userId,
          requestId: selectedRequestId,
          fileName: file.name,
        },
      });

      setUploadingFiles((prev) =>
        prev.map((f) => (f.file === file ? { ...f, status: "error" } : f))
      );

      // More specific error message with proper type checking
      let errorMessage = "Failed to upload document. Please try again.";

      if (
        isFetchBaseQueryError(error) &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        errorMessage = String(error.data.message);
      } else if (isErrorWithMessage(error)) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const { data: fileInfo, isFetching: isDownloading } =
    useDownloadClientDocQuery(
      { userId, requestId: viewingDocumentId?.toString() || "" },
      { skip: !viewingDocumentId }
    );

  if (fileInfo && viewingDocumentId) {
    window.open(fileInfo.url, "_blank");
    setViewingDocumentId(null);
  }

  const handleViewDocument = (requestId: number) => {
    setViewingDocumentId(requestId);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      handleFileUpload(files[0]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files?.length) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-[80px] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Sr. No.
                    </TableHead>
                    <TableHead className="w-[250px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Details
                    </TableHead>
                    <TableHead className="w-[130px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Request Date
                    </TableHead>
                    <TableHead className="w-[130px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </TableHead>
                    <TableHead className="w-[130px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Due Date
                    </TableHead>
                    <TableHead className="w-[120px] px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageData.length > 0 ? (
                    currentPageData.map((request) => {
                      const currentStatus = getStatus(
                        request.status,
                        request.dueDate
                      );
                      return (
                        <TableRow
                          key={request.id}
                          className="hover:bg-gray-50/50"
                        >
                          <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                            {request.srNo}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {request.details}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-blue-600">
                            {request.requestDate}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn("h-2 w-2 rounded-full", {
                                  "bg-yellow-400": currentStatus === "PENDING",
                                  "bg-green-400": currentStatus === "FULFILLED",
                                  "bg-red-400": currentStatus === "OVERDUE",
                                })}
                              />
                              <span
                                className={cn("font-medium", {
                                  "text-yellow-600":
                                    currentStatus === "PENDING",
                                  "text-green-600":
                                    currentStatus === "FULFILLED",
                                  "text-red-600": currentStatus === "OVERDUE",
                                })}
                              >
                                {currentStatus}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className="bg-red-50 px-2 py-1 rounded-md">
                              {request.dueDate}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            {currentStatus === "FULFILLED" ? (
                              <Button
                                variant="link"
                                className="text-blue-600 font-medium"
                                onClick={() => handleViewDocument(request.id)}
                                disabled={
                                  isDownloading &&
                                  viewingDocumentId === request.id
                                }
                              >
                                {isDownloading &&
                                viewingDocumentId === request.id
                                  ? "Loading..."
                                  : "View"}
                              </Button>
                            ) : (
                              <Button
                                variant="link"
                                className="text-blue-600 font-medium"
                                onClick={() => {
                                  setSelectedRequestId(request.id);
                                  setUploadDialogOpen(true);
                                }}
                              >
                                Upload Document
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-gray-500"
                      >
                        No results found. Try adjusting your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <Button
              variant="outline"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] w-full">
          <DialogHeader className="space-y-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Upload Document</DialogTitle>
            </div>
          </DialogHeader>
          <div className="grid gap-6">
            <div
              className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-lg p-8 text-center cursor-pointer hover:border-blue-300 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={onFileSelect}
                accept=".pdf,.docx"
              />
              <Cloud className="mx-auto h-10 w-10 text-blue-500" />
              <div className="mt-4">
                <span className="font-semibold">Choose a file</span> or drag &
                drop it here
              </div>
              <p className="text-xs text-gray-500 mt-2">pdf & docx formats</p>
            </div>

            {uploadingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="h-10 w-10 flex-shrink-0 bg-white rounded-lg flex items-center justify-center">
                  <div className="bg-red-500 text-white text-xs px-2 py-0.5 uppercase rounded">
                    PDF
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(file.file.size / 1024)} KB of{" "}
                        {Math.round(file.file.size / 1024)} KB
                      </p>
                    </div>
                    {file.status !== "uploading" && (
                      <button
                        onClick={() => {
                          setUploadingFiles((prev) =>
                            prev.filter((f) => f.file !== file.file)
                          );
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        {file.status === "completed" ? (
                          <Trash2 className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {file.status === "uploading" && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {file.progress < 100 ? "Uploading..." : "Processing..."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                className="bg-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0F3C67] hover:bg-[#0F3C67]/90 text-white"
                disabled={uploadingFiles.some((f) => f.status === "uploading")}
                onClick={() => {
                  if (uploadingFiles.every((f) => f.status === "completed")) {
                    setUploadDialogOpen(false);
                    setUploadingFiles([]);
                  }
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentRequestsTable;
