import liff, { Liff } from "@line/liff";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface ContextType {
  liff: Liff;
  liffError: string | null;
  isLiffInitialized: boolean;
}

const Context = createContext<ContextType>({} as ContextType);
const useLiff = () => useContext(Context);
export default useLiff;

export function LiffProvider({ children }: { children?: ReactNode }) {
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLiffInitialized, setLiffInitialized] = useState<boolean>(false);

  useEffect(() => {
    liff
      .init({
        liffId: import.meta.env.VITE_LIFF_ID,
      })
      .catch((e: Error) => {
        setLiffError(`${e}`);
      })
      .finally(() => {
        setLiffInitialized(true);
      });
  }, []);

  const value = {
    liff: liff,
    liffError: liffError,
    isLiffInitialized: isLiffInitialized,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
