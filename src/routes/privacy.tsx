import { createFileRoute } from "@tanstack/react-router";
import { privacyHead, PrivacyPage } from "./-privacy-page";

export const Route = createFileRoute("/privacy")({
  head: privacyHead,
  component: PrivacyPage,
});
