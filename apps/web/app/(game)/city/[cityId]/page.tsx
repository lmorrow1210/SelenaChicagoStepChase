import TrophyClient from "./TrophyClient";

// Chicago (id 1) is the only completed-city trophy in the demo route map.
// In server builds this list just seeds SSG; the client fetches live data.
export function generateStaticParams() {
  return [{ cityId: "1" }, { cityId: "2" }, { cityId: "3" }];
}

// Server builds render other cities on demand; static export prerenders only
// the list above (the demo links just Chicago).
export const dynamicParams = true;

export default function PastCityPage() {
  return <TrophyClient />;
}
