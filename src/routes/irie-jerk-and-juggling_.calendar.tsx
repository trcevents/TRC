import { createFileRoute } from "@tanstack/react-router";
import { irieJerkCalendarHead, IrieJerkCalendarPage } from "./-irie-jerk-calendar-page";

export const Route = createFileRoute("/irie-jerk-and-juggling_/calendar")({
  head: irieJerkCalendarHead,
  component: IrieJerkCalendarPage,
});
