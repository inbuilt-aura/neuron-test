import { Card, CardContent } from "@/components/ui/card"; // Update based on your project structure

const milestone = {
    start: { title: "Project Created", date: "12/06/2024" },
    end: { title: "Project EDD", date: "12/06/2024" },
    updates: [
        {
            title: "Lorem ipsum",
            date: "12/06/2024",
            status: true,
        },
        {
            title: "Lorem ipsum dolor ",
            date: "18/06/2024",
            status: true,
        },
        {
            title: "Lorem ipsum",
            date: "12/06/2024",
            status: false,
        },
        {
            title: "Lorem ipsum dolor",
            date: "18/06/2024",
            status: false,
        },
    ],
};

const HorizontalMilestones = () => {
    return (
        <Card className="p-2 mb-2 bg-[#E2E8F0]">
            <CardContent>
                {/* Project Heading */}
                <h4 className="mb-6 pb-6 text-center text-xl font-semibold">
                    Project Name Here
                </h4>

                {/* Milestones Timeline */}
                <div className="relative flex items-center justify-between">
                    {/* Line passing through the center of the circles */}
                    <div className="absolute top-1/2 left-0 right-0 h-[5px] bg-[#0B4776]" />

                    {/* Start Milestone */}
                    <div className="relative flex flex-col items-center gap-2 z-10">
                        {/* Title Above Circle */}
                        <div className="absolute bottom-12 ps-5 whitespace-nowrap">
                            <h5 className="text-base font-medium text-gray-600 break-words max-w-xs">
                                {milestone.start.title}
                            </h5>
                            <p className="text-sm text-[#3B82F6]">{milestone.start.date}</p>
                        </div>
                        {/* Circle */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B4776] text-white font-bold">

                        </div>
                    </div>

                    {/* Timeline Updates */}
                    {milestone.updates.map((update, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col items-center gap-2 z-10 ${index > 0 ? "invisible" : ""}`} // Hide updates after the first two
                        >
                            {/* Title Above Circle */}
                            <div className="absolute bottom-12 text-center whitespace-nowrap">
                                <h5 className="text-base font-medium text-gray-600 break-words max-w-xs">
                                    {update.title}
                                </h5>
                                <p className="text-sm text-[#3B82F6]">{update.date}</p>
                            </div>
                            {/* Circle */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B4776] text-white font-bold">

                            </div>
                        </div>
                    ))}

                    {/* End Milestone */}
                    <div className="relative flex flex-col items-center gap-2 z-10">
                        {/* Title Above Circle */}
                        <div className="absolute bottom-12 text-center whitespace-nowrap">
                            <h5 className="text-base font-medium text-[#3B82F6] break-words max-w-xs">
                                {milestone.end.title}
                            </h5>
                            <p className="text-sm text-[#3B82F6]">{milestone.end.date}</p>
                        </div>
                        {/* Circle with original color for the end milestone */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff] text-[#0B4776] font-bold">
                            ✔
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};

export default HorizontalMilestones;
