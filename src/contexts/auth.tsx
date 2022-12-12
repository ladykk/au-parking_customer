import {
  browserLocalPersistence,
  setPersistence,
  signInWithCustomToken,
  User,
} from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Authentication, Functions } from "../utils/firebase";
import { useSignOut, useIdToken } from "react-firebase-hooks/auth";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import useLiff from "./liff";

interface ContextType {
  user: User | null | undefined;
  isAuthLoading: boolean;
  authError: Error | undefined;
}

const Context = createContext<ContextType>({} as ContextType);
const useAuth = () => useContext(Context);
export default useAuth;

export function AuthProvider({ children }: { children?: ReactNode }) {
  const [signOut] = useSignOut(Authentication);
  const [signInWithLINEProvider] = useHttpsCallable<string, string>(
    Functions,
    "customers-signInWithLINEProvider"
  );
  const [user, isAuthLoading, authError] = useIdToken(Authentication, {
    onUserChanged: async (user) => {
      // CASE: no user.
      // DO: ignore.
      if (!user) return;

      // Check "line" claims.
      const { line } = (await user.getIdTokenResult()).claims;

      // CASE: don't have custom claims.
      // DO: sign out.
      if (!line) signOut();
    },
  });
  const [isLoading, setLoading] = useState<boolean>(true);
  const { liff, isLiffInitialized } = useLiff();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // CASE: cannot initialized LIFF, already sign in, auth loading.
        // DO: ignore.
        if (!isLiffInitialized || user || isAuthLoading) return;

        // CASE: LIFF not login.
        // DO: ignore.
        if (!liff.isLoggedIn()) return;

        // Get LINE access token.
        const access_token = liff.getAccessToken();

        // CASE: cannot get access token.
        // DO: throw error.
        if (!access_token) throw new Error("Cannot get access token.");

        // Get custom token using LINE access token.
        const result = await signInWithLINEProvider(access_token);

        // CASE: cannot get custom token.
        // DO: throw error.
        if (!result) throw new Error("Cannot get custom token.");

        // Sign in with custom token.
        const custom_token = result.data;
        await setPersistence(Authentication, browserLocalPersistence);
        await signInWithCustomToken(Authentication, custom_token);
      } catch (e: any) {
        if (e.message) console.log(e.message);
        else console.log(e);
      } finally {
        if (isLiffInitialized) setLoading(false);
      }
    })();
  }, [liff, isLiffInitialized]);

  return (
    <Context.Provider
      value={{ user, isAuthLoading: isLoading || isAuthLoading, authError }}
    >
      {children}
    </Context.Provider>
  );
}
