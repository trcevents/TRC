import { createFileRoute } from "@tanstack/react-router";
import { fridayLimeHead, FridayLimePage } from "./-friday-lime-page";

export const Route = createFileRoute("/friday-lime")({
  head: fridayLimeHead,
  component: FridayLimePage,
});
