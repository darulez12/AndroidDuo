import { createFileRoute } from "@tanstack/react-router";
import { FoldStage } from "@/components/fold-stage";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="h-dvh overflow-hidden bg-black">
      <FoldStage />
    </main>
  );
}
