import { Dispatch, SetStateAction } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Metric {
  label: string;
  value: number | string;
}

interface MetricsProps<T extends string> {
  metrics: Metric[];
  selectedMetric: T;
  setSelectedMetric: Dispatch<SetStateAction<T>>;
}

const Metrics = <T extends string>({
  metrics,
  selectedMetric,
  setSelectedMetric,
}: MetricsProps<T>) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-3 pb-4">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          onClick={() => setSelectedMetric(metric.label as T)}
          className={`cursor-pointer h-24 sm:h-26 lg:h-28 ${
            selectedMetric === metric.label
              ? "border-4 border-[#CEE9FF]"
              : "border border-gray-200"
          } transition-all duration-200`}
        >
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-xs sm:text-sm text-gray-500">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <span className="text-2xl sm:text-3xl">{metric.value}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Metrics;
