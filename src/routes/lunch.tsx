import { createFileRoute } from "@tanstack/react-router";
import { lunchHead, LunchPage } from "./-lunch-page";

export const Route = createFileRoute("/lunch")({
  head: lunchHead,
  component: LunchPage,
});
