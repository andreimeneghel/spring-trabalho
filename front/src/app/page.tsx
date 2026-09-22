import { redirect } from "next/navigation";

/** O middleware já decide entre /login e /playlists; aqui só encaminhamos. */
export default function Home() {
  redirect("/playlists");
}
