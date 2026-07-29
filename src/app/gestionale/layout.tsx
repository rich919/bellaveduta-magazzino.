import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestionale",
  // Il gestionale non deve finire nei motori di ricerca.
  robots: { index: false, follow: false, nocache: true },
};

export default function LayoutGestionale({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="adm">{children}</div>;
}
