import { createFileRoute } from "@tanstack/react-router";
import { irieJerkJugglingHead, irieJerkJugglingLoader, IrieJerkJugglingPage } from "./-irie-jerk-juggling-page";

export const Route = createFileRoute("/")({
  loader: irieJerkJugglingLoader,
  head: ({ loaderData }) => irieJerkJugglingHead(loaderData?.loadedAt),
  component: RouteComponent,
});

function RouteComponent() {
  const { loadedAt } = Route.useLoaderData();
  return <IrieJerkJugglingPage loadedAt={loadedAt} />;
}
