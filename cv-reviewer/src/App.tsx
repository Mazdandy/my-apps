import { Workspace } from "@/components/Workspace";
import { useLanguage } from "@/lib/useLanguage";

export function App() {
  const lang = useLanguage();
  return <Workspace lang={lang} />;
}
