import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  findIrieJerkJugglingEdition,
  irieJerkJugglingEditionHead,
  IrieJerkJugglingEditionPage,
} from "./-irie-jerk-juggling-page";

// One design edition on its own page, e.g. /irie-jerk-and-juggling/copenhagen.
// The trailing "_" keeps it out from under the /irie-jerk-and-juggling page
// (which has no <Outlet />). Each edition must also be listed in
// prerender.pages in vite.config.ts.
export const Route = createFileRoute("/irie-jerk-and-juggling_/$edition")({
  beforeLoad: ({ params }) => {
    if (!findIrieJerkJugglingEdition(params.edition)) throw notFound();
  },
  head: ({ params }) => irieJerkJugglingEditionHead(params.edition),
  component: RouteComponent,
});

function RouteComponent() {
  const { edition } = Route.useParams();
  const found = findIrieJerkJugglingEdition(edition);
  return found ? <IrieJerkJugglingEditionPage edition={found} /> : null;
}
