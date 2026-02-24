import { redirect } from "next/navigation";

export default function TrainEntryPage() {
  redirect("/play?mode=train");
}
