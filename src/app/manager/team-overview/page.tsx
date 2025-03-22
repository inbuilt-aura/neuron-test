"use client";
import { useRouter } from "next/navigation";
import {
  useGetSalesEmployeesQuery,
  useGetResearcherEmployeesQuery,
  useGetEditorEmployeesQuery,
  useGetBiostatEmployeesQuery,
  useGetTechnicalEmployeesQuery,
} from "../../../store/manager/managerApiSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, HelpCircle } from "lucide-react";

export default function TeamOverview() {
  const router = useRouter();

  // Fetch employees data using the API hooks
  const { data: salesEmployees, isLoading: salesLoading } =
    useGetSalesEmployeesQuery();
  const { data: researcherEmployees, isLoading: researcherLoading } =
    useGetResearcherEmployeesQuery();
  const { data: editorEmployees, isLoading: editorLoading } =
    useGetEditorEmployeesQuery();
  const { data: biostatEmployees, isLoading: biostatLoading } =
    useGetBiostatEmployeesQuery();
  const { data: technicalEmployees, isLoading: technicalLoading } =
    useGetTechnicalEmployeesQuery();

  // Function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Function to handle employee click
  const handleEmployeeClick = (id: number) => {
    router.push(`/manager/team-overview/${id}`);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Overview</h1>
        <div className="flex gap-4">
          <button className="p-2 rounded-full bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full bg-gray-100">
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Sales Person Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-sm font-medium">Sales Person</div>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
              S
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {salesLoading ? (
              <div className="animate-pulse">Loading...</div>
            ) : (
              salesEmployees?.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors"
                  onClick={() => handleEmployeeClick(employee.id)}
                >
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage
                      src={employee.profilePic}
                      alt={`${employee.firstName} ${employee.lastName}`}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    {employee.firstName} {employee.lastName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Researcher Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-sm font-medium">Researcher</div>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
              R
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {researcherLoading ? (
              <div className="animate-pulse">Loading...</div>
            ) : (
              researcherEmployees?.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors"
                  onClick={() => handleEmployeeClick(employee.id)}
                >
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage
                      src={employee.profilePic}
                      alt={`${employee.firstName} ${employee.lastName}`}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    {employee.firstName} {employee.lastName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-sm font-medium">Editor</div>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
              E
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {editorLoading ? (
              <div className="animate-pulse">Loading...</div>
            ) : (
              editorEmployees?.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors"
                  onClick={() => handleEmployeeClick(employee.id)}
                >
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage
                      src={employee.profilePic}
                      alt={`${employee.firstName} ${employee.lastName}`}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    {employee.firstName} {employee.lastName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Biostatistician Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-sm font-medium">Biostatistician</div>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
              B
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {biostatLoading ? (
              <div className="animate-pulse">Loading...</div>
            ) : (
              biostatEmployees?.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors"
                  onClick={() => handleEmployeeClick(employee.id)}
                >
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage
                      src={employee.profilePic}
                      alt={`${employee.firstName} ${employee.lastName}`}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    {employee.firstName} {employee.lastName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Technical Person Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-sm font-medium">Technical Person</div>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
              T
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {technicalLoading ? (
              <div className="animate-pulse">Loading...</div>
            ) : (
              technicalEmployees?.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors"
                  onClick={() => handleEmployeeClick(employee.id)}
                >
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage
                      src={employee.profilePic}
                      alt={`${employee.firstName} ${employee.lastName}`}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    {employee.firstName} {employee.lastName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
