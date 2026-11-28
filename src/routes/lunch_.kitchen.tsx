import { createFileRoute } from "@tanstack/react-router";
import { lunchKitchenHead, LunchKitchenPage } from "./-lunch-kitchen-page";

export const Route = createFileRoute("/lunch_/kitchen")({
  head: lunchKitchenHead,
  component: LunchKitchenPage,
});
