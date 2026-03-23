import { redirect } from "next/navigation";
import { getDefaultLibraryId } from "@/data/library-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const defaultLibraryId = await getDefaultLibraryId();
  redirect(`/library/${defaultLibraryId}`);
}
