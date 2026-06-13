import StepClient from "./StepClient";

// Enumerate the wizard steps so `output: export` can prerender each one.
export function generateStaticParams() {
  return [{ step: "connect" }, { step: "target" }, { step: "avatar" }, { step: "group" }];
}

export const dynamicParams = false;

export default function OnboardingStepPage() {
  return <StepClient />;
}
