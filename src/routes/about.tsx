import { createFileRoute } from "@tanstack/react-router";
import { aboutHead, AboutPage } from "./-about-page";

export const Route = createFileRoute("/about")({
  head: aboutHead,
  component: AboutPage,
});
