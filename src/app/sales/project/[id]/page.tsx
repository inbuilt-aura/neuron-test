import { Suspense } from "react";
import {ProjectDetails} from "../../../../components/reuse_components/project_detail"
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectDetails id={id} onBack={() => {}} />
    </Suspense>
  );
}
