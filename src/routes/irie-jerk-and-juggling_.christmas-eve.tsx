import { createFileRoute } from "@tanstack/react-router";
import { irieJerkHolidayHead, IrieJerkHolidayPage } from "./-irie-jerk-holiday-page";

export const Route = createFileRoute("/irie-jerk-and-juggling_/christmas-eve")({
  head: () => irieJerkHolidayHead("christmas-eve"),
  component: () => <IrieJerkHolidayPage night="christmas-eve" />,
});
