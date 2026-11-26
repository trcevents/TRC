import { createFileRoute } from "@tanstack/react-router";
import { termsHead, TermsPage } from "./-terms-page";

export const Route = createFileRoute("/terms")({
  head: termsHead,
  component: TermsPage,
});
