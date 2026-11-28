import { createFileRoute } from "@tanstack/react-router";
import { irieJerkHolidayHead, IrieJerkHolidayPage } from "./-irie-jerk-holiday-page";

export const Route = createFileRoute("/irie-jerk-and-juggling_/winter-ball")({
  head: () => irieJerkHolidayHead("winter-ball"),
  component: () => <IrieJerkHolidayPage night="winter-ball" />,
});
