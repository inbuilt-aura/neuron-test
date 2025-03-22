import { Suspense } from "react";
import { ProjectDetails } from "../../../../components/manager/project-details";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <ProjectDetails id={id} />
      </div>
    </Suspense>
  );
}
