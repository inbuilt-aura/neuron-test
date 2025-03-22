"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  Bell,
  HelpCircle,
  ArrowLeft,
  Briefcase,
  MoreVertical,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetSalesEmployeeDetailsQuery,
  useGetResearcherEmployeeDetailsQuery,
  useGetEditorEmployeeDetailsQuery,
  useGetBiostatEmployeeDetailsQuery,
  useGetTechnicalEmployeeDetailsQuery,
  useGetEmployeeClosedProjectsQuery,
  useGetEmployeeInProgressProjectsQuery,
  type EmployeeBase,
  type SalesEmployeeStats,
  type ResearcherEmployeeStats,
  type EditorOrTechnicalEmployeeStats,
  type EmployeeProject,
} from "../../../../store/manager/managerApiSlice";
import Link from "next/link";

type EmployeeRole =
  | "SALES"
  | "RESEARCHER"
  | "EDITOR"
  | "BIOSTATISTICIAN"
  | "TECHNICAL";

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const employeeId = Array.isArray(id) ? id[0] : id || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeRole, setEmployeeRole] = useState<EmployeeRole | null>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());

  const startDate = fromDate
    ? format(fromDate, "yyyy-MM-dd")
    : format(
        new Date(new Date().setDate(new Date().getDate() - 30)),
        "yyyy-MM-dd"
      );
  const endDate = toDate
    ? format(toDate, "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");

  // Do not set employeeRole from localStorage initially; let the API determine the role
  useEffect(() => {
    // Clear any stale role to force re-detection
    localStorage.removeItem(`employee_${employeeId}_role`);
    setEmployeeRole(null);
  }, [employeeId]);

  // Queries with strict role-based skipping
  const {
    data: salesData,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useGetSalesEmployeeDetailsQuery(
    { employeeId, startDate, endDate },
    { skip: !employeeId || (employeeRole !== null && employeeRole !== "SALES") }
  );

  const {
    data: researcherData,
    isLoading: researcherLoading,
    refetch: refetchResearcher,
  } = useGetResearcherEmployeeDetailsQuery(
    { employeeId, startDate, endDate },
    {
      skip:
        !employeeId || (employeeRole !== null && employeeRole !== "RESEARCHER"),
    }
  );

  const {
    data: editorData,
    isLoading: editorLoading,
    refetch: refetchEditor,
  } = useGetEditorEmployeeDetailsQuery(
    { employeeId, startDate, endDate },
    {
      skip: !employeeId || (employeeRole !== null && employeeRole !== "EDITOR"),
    }
  );

  const {
    data: biostatData,
    isLoading: biostatLoading,
    refetch: refetchBiostat,
  } = useGetBiostatEmployeeDetailsQuery(
    { employeeId, startDate, endDate },
    {
      skip:
        !employeeId ||
        (employeeRole !== null && employeeRole !== "BIOSTATISTICIAN"),
    }
  );

  const {
    data: technicalData,
    isLoading: technicalLoading,
    refetch: refetchTechnical,
  } = useGetTechnicalEmployeeDetailsQuery(
    { employeeId, startDate, endDate },
    {
      skip:
        !employeeId || (employeeRole !== null && employeeRole !== "TECHNICAL"),
    }
  );

  const { data: closedProjects, isLoading: closedProjectsLoading } =
    useGetEmployeeClosedProjectsQuery({ employeeId }, { skip: !employeeId });

  const { data: inProgressProjects, isLoading: inProgressProjectsLoading } =
    useGetEmployeeInProgressProjectsQuery(
      { employeeId },
      { skip: !employeeId }
    );

  // Set role based on first valid response
  useEffect(() => {
    if (!employeeId || employeeRole !== null) return;

    let roleFromData: EmployeeRole | null = null;
    if (salesData?.employee?.role === "SALES") roleFromData = "SALES";
    else if (researcherData?.employee?.role === "RESEARCHER")
      roleFromData = "RESEARCHER";
    else if (editorData?.employee?.role === "EDITOR") roleFromData = "EDITOR";
    else if (biostatData?.employee?.role === "BIOSTATISTICIAN")
      roleFromData = "BIOSTATISTICIAN";
    else if (technicalData?.employee?.role === "TECHNICAL")
      roleFromData = "TECHNICAL";

    if (roleFromData) {
      setEmployeeRole(roleFromData);
      localStorage.setItem(`employee_${employeeId}_role`, roleFromData);
    }
  }, [
    employeeId,
    employeeRole,
    salesData,
    researcherData,
    editorData,
    biostatData,
    technicalData,
  ]);

  // Refetch when dates change
  useEffect(() => {
    if (!fromDate || !toDate || !employeeRole) return;

    switch (employeeRole) {
      case "SALES":
        refetchSales();
        break;
      case "RESEARCHER":
        refetchResearcher();
        break;
      case "EDITOR":
        refetchEditor();
        break;
      case "BIOSTATISTICIAN":
        refetchBiostat();
        break;
      case "TECHNICAL":
        refetchTechnical();
        break;
    }
  }, [
    fromDate,
    toDate,
    employeeRole,
    refetchSales,
    refetchResearcher,
    refetchEditor,
    refetchBiostat,
    refetchTechnical,
  ]);

  const isLoading: boolean =
    employeeRole === null ||
    (employeeRole === "SALES" && salesLoading) ||
    (employeeRole === "RESEARCHER" && researcherLoading) ||
    (employeeRole === "EDITOR" && editorLoading) ||
    (employeeRole === "BIOSTATISTICIAN" && biostatLoading) ||
    (employeeRole === "TECHNICAL" && technicalLoading);

  const employeeData =
    employeeRole === "SALES"
      ? salesData
      : employeeRole === "RESEARCHER"
      ? researcherData
      : employeeRole === "EDITOR"
      ? editorData
      : employeeRole === "BIOSTATISTICIAN"
      ? biostatData
      : employeeRole === "TECHNICAL"
      ? technicalData
      : undefined;

  if (isLoading) {
    return <div className="p-8 text-center">Loading employee details...</div>;
  }

  if (!employeeData?.employee) {
    return <div className="p-8 text-center">Employee not found</div>;
  }

  const employee: EmployeeBase = employeeData.employee;
  const stats = employeeData.stats;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDateDisplay = (date: Date | undefined) =>
    date ? format(date, "MMMM do, yyyy") : "";
  const formatDate = (dateString: string | null) =>
    dateString ? format(parseISO(dateString), "dd/MM/yyyy") : "-";

  const filterProjects = (projects: EmployeeProject[] | undefined) => {
    if (!projects || !searchQuery) return projects || [];
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${project.Client?.firstName} ${project.Client?.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  };

  const filteredClosedProjects = filterProjects(closedProjects);
  const filteredInProgressProjects = filterProjects(inProgressProjects);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link
            href="/manager/team-overview"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Employee Details</h1>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full bg-gray-100">
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={employee.profilePic}
                alt={`${employee.firstName} ${employee.lastName}`}
              />
              <AvatarFallback>
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">
                Dr. {employee.firstName} {employee.lastName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Briefcase className="h-4 w-4" />
              <span>
                {employeeRole === "SALES"
                  ? "Sales Person"
                  : employeeRole === "RESEARCHER"
                  ? "Researcher"
                  : employeeRole === "EDITOR"
                  ? "Editor"
                  : employeeRole === "BIOSTATISTICIAN"
                  ? "Biostatistician"
                  : "Technical Person"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? (
                    formatDateDisplay(fromDate)
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span>To</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? (
                    formatDateDisplay(toDate)
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={(date) => {
                    // Only set the date if it's after fromDate
                    if (fromDate && date && date <= fromDate) {
                      // You can add a toast notification here if you want
                      alert("End date must be after start date");
                      return;
                    }
                    setToDate(date);
                  }}
                  initialFocus
                  disabled={(date) => (fromDate ? date < fromDate : false)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-5 mt-6">
          {employeeRole === "SALES" && (
            <>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">Project Conversion Rate</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as SalesEmployeeStats).conversion_rate ?? 0}%
                </div>
              </div>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">Closed Project</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as SalesEmployeeStats).closed ?? 0}
                </div>
              </div>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">Created Project</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as SalesEmployeeStats).created ?? 0}
                </div>
              </div>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">Total Generated Revenue</div>
                <div className="text-4xl font-bold mt-2">
                  ₹{" "}
                  {(stats as SalesEmployeeStats).revenue?.toLocaleString() ??
                    "0"}
                </div>
              </div>
              <div className="px-4">
                <div className="text-gray-500">Lead Added</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as SalesEmployeeStats).leads ?? 0}
                </div>
              </div>
            </>
          )}

          {employeeRole === "RESEARCHER" && (
            <>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">Completed Project</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as ResearcherEmployeeStats).completed ?? 0}
                </div>
              </div>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">Ongoing Project</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as ResearcherEmployeeStats).ongoing ?? 0}
                </div>
              </div>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">Milestones Missed</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as ResearcherEmployeeStats).missed ?? 0}
                </div>
              </div>
              <div className="px-4">
                <div className="text-gray-500">On Time Project Delivery</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as ResearcherEmployeeStats).ontime ?? 0}
                </div>
              </div>
            </>
          )}

          {(employeeRole === "EDITOR" ||
            employeeRole === "BIOSTATISTICIAN" ||
            employeeRole === "TECHNICAL") && (
            <>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">Completed Project</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as EditorOrTechnicalEmployeeStats).completed ?? 0}
                </div>
              </div>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">Ongoing Project</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as EditorOrTechnicalEmployeeStats).ongoing ?? 0}
                </div>
              </div>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">Milestones Missed</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as EditorOrTechnicalEmployeeStats).missed ?? 0}
                </div>
              </div>
              <div className="border-r border-gray-200 px-4">
                <div className="text-gray-500">On Time Project Delivery</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as EditorOrTechnicalEmployeeStats).ontime ?? 0}
                </div>
              </div>
              <div className="px-4">
                <div className="text-gray-500">Project Reviewed</div>
                <div className="text-4xl font-bold mt-2">
                  {(stats as EditorOrTechnicalEmployeeStats).reviewed ?? 0}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4">
        <Tabs defaultValue="completed">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="completed" className="px-4">
                Completed Project
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="px-4">
                Ongoing Project
              </TabsTrigger>
            </TabsList>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-8 pr-4 py-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <TabsContent value="completed" className="mt-0">
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Sr. No.
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Project Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Total Payment
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      EDD
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Client Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Start Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {closedProjectsLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        Loading projects...
                      </td>
                    </tr>
                  ) : filteredClosedProjects &&
                    filteredClosedProjects.length > 0 ? (
                    filteredClosedProjects.map((project, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">{project.name}</td>
                        <td className="py-3 px-4">INR. 1200</td>
                        <td className="py-3 px-4">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm">
                            {formatDate(project.edd)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={project.Client?.profilePic}
                                alt={`${project.Client?.firstName} ${project.Client?.lastName}`}
                              />
                              <AvatarFallback>
                                {project.Client
                                  ? getInitials(
                                      project.Client.firstName,
                                      project.Client.lastName
                                    )
                                  : "CL"}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {project.Client?.firstName}{" "}
                              {project.Client?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                            {formatDate(project.startDate)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No completed projects found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <div className="text-sm text-gray-500">
                Page 1 of{" "}
                {Math.ceil((filteredClosedProjects?.length || 0) / 10) || 1}
              </div>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ongoing" className="mt-0">
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Sr. No.
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Project Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Total Payment
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      EDD
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Client Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Start Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inProgressProjectsLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        Loading projects...
                      </td>
                    </tr>
                  ) : filteredInProgressProjects &&
                    filteredInProgressProjects.length > 0 ? (
                    filteredInProgressProjects.map((project, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">{project.name}</td>
                        <td className="py-3 px-4">INR. 1200</td>
                        <td className="py-3 px-4">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm">
                            {formatDate(project.edd)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={project.Client?.profilePic}
                                alt={`${project.Client?.firstName} ${project.Client?.lastName}`}
                              />
                              <AvatarFallback>
                                {project.Client
                                  ? getInitials(
                                      project.Client.firstName,
                                      project.Client.lastName
                                    )
                                  : "CL"}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {project.Client?.firstName}{" "}
                              {project.Client?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                            {formatDate(project.startDate)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No ongoing projects found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <div className="text-sm text-gray-500">
                Page 1 of{" "}
                {Math.ceil((filteredInProgressProjects?.length || 0) / 10) || 1}
              </div>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
