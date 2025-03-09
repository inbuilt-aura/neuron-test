"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Calendar, Target } from "phosphor-react";
import { Card, CardContent } from "@/components/ui/card";
// import { cn } from "@/lib/utils";
import { Milestone, MilestonesSectionProps } from "../../types";

export function MilestonesSection({
  projectEdd,
  projectCreatedAt,
  milestones,
}: MilestonesSectionProps) {
  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMMM, yyyy");
  };

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Sort milestones by dueDate
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );

  // Filter completed milestones
  const completedMilestones = sortedMilestones.filter(
    (milestone) => milestone.status === "COMPLETED"
  );

  return (
    <Card className="p-6">
      <CardContent>
      <h4 className="mb-6 flex items-center gap-2 text-base font-medium">
               <Target className="h-5 w-5" />
                Milestones
              </h4>
              <div className="relative">
              {completedMilestones.length > 0 ? (
            <>
              {/* Top section - gray line */}
              <div className="absolute left-5 top-[0px] w-[2px] bg-[#E9E9F1] h-[80px]" />
              
              {/* Middle section - green line (only for completed milestones) */}
              <div className="absolute left-5 top-[60px] bottom-4 w-[2px] bg-[#00B884]" />
            </>
          ) : (
            // Show a continuous gray line when no milestones are present
            <div className="absolute left-5 top-[0px] bottom-4 w-[2px] bg-[#E9E9F1]" />
          )}

          <div className="space-y-16">
            {/* Project EDD */}
            <div className="flex gap-6">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5]">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <h5 className="text-base font-medium text-gray-600">
                  Project EDD
                </h5>
                <p className="text-sm text-gray-500">
                  {projectEdd ? formatDate(projectEdd) : "Not set"}
                </p>
              </div>
            </div>

            {/* Only Completed Milestones */}
            {completedMilestones.map((milestone: Milestone) => (
              <div key={milestone.id} className="flex gap-6">
                <div className="relative">
                  <div className="absolute left-[13px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#00B884]" />
                </div>
                <div className="ml-10">
                  <h5 className="text-base font-medium text-[#00B884]">
                    {milestone.description}
                  </h5>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{`${milestone.AssignedTo.firstName} ${milestone.AssignedTo.lastName}`}</span>
                    <span>•</span>
                    <span>{getTimeAgo(milestone.createdAt)}</span>
                    <span>•</span>
                    <span>Due: {formatDate(milestone.dueDate)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Project Created */}
            <div className="flex gap-6">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5]">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <h5 className="text-base font-medium text-gray-600">
                  Project Created
                </h5>
                <p className="text-sm text-gray-500">
                  {formatDate(projectCreatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
