import { redirect } from "next/navigation";

// The prediction moved onto the Map screen; keep old links working.
export default function PredictionPage() {
  redirect("/map");
}
