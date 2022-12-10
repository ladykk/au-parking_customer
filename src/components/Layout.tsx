import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Liff } from "@line/liff/dist/lib";
import { ReactElement, ReactNode } from "react";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";
import useAuth from "../contexts/auth";
import Feedback from "./Feedback";
import useLiff from "../contexts/liff";

type LayoutProps = {
  children: ReactElement;
};
function Layout({ children }: LayoutProps) {
  return (
    <div className="w-screen h-[95vh] flex flex-col items-start justify-between overflow-hidden">
      {children}
    </div>
  );
}

export default Layout;

type HeaderProps = {
  liff: Liff | null;
  title: string;
  subTitle?: string;
  btns?: ReactElement;
  hideBack?: boolean;
};
export function Header({
  liff,
  title,
  subTitle,
  btns,
  hideBack = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const isInClient = liff?.isInClient();
  return isInClient && !subTitle ? (
    <></>
  ) : (
    <div className="w-full h-auto flex-0">
      <hr />
      <div className={`flex justify-between items-center py-2 px-5`}>
        <div className="flex items-center gap-3">
          {!hideBack && !isInClient && (
            <ChevronLeftIcon
              className="w-10 h-10 p-1 rounded-md hover:bg-gray-200"
              onClick={() => navigate(-1)}
            />
          )}
          <div className="flex flex-col gap-1">
            {!isInClient && (
              <h1 className="text-3xl font-semibold text-rose-500">{title}</h1>
            )}
            {subTitle && <p className="text-sm text-gray-400">{subTitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">{btns}</div>
      </div>
      <hr />
    </div>
  );
}

export function Main({
  children,
  isLoading = false,
}: {
  children?: ReactNode;
  isLoading?: boolean;
}) {
  return (
    <div className="w-full flex-1 p-5 overflow-x-hidden overflow-y-scroll">
      <Loading isLoading={isLoading} />
      {children}
    </div>
  );
}

export function LIFFRequired({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { liff } = useLiff();

  if (!user)
    return (
      <Feedback
        header="LIFF Required"
        message="This link is required to be open on LINE Application."
        type="Error"
        liff={liff}
      />
    );

  return <>{children}</>;
}
