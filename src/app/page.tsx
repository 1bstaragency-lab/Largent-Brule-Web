// TEMPORARY: site opened for testing. Original VIP gate preserved in
// git history (see commit before this one) and will be restored on
// "revert". Server-side redirect to the collections index so the
// shop is immediately reachable.
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/collections");
}
