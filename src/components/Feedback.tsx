import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { Liff } from "@line/liff/dist/lib";
import { Button } from "./Form";
import { useNavigate } from "react-router-dom";

type Props = {
  header: string;
  message: string;
  type: "Success" | "Warning" | "Error";
  liff: Liff | null;
  button?: "Close" | "Back";
};
function Feedback({ header, message, type, liff, button }: Props) {
  // [Settings]
  const color =
    type === "Success" ? "green" : type === "Error" ? "rose" : "yellow";
  const Icon =
    type === "Success"
      ? CheckCircleIcon
      : type === "Error"
      ? XCircleIcon
      : ExclamationTriangleIcon;

  // [Hooks]
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-2 mx-auto max-w-md">
      <Icon className={`text-${color}-500 w-24 h-24 md:w-32 md:h-32 my-5`} />
      <p className={`text-${color}-500 text-2xl font-medium`}>{header}</p>
      <p className="text-center mb-10">{message}</p>
      {button === "Close" && liff && (
        <Button onClick={() => liff.closeWindow()}>Close</Button>
      )}
      {button === "Back" && <Button onClick={() => navigate(-1)}>Back</Button>}
    </div>
  );
}

export default Feedback;

export function FeedbackNoRoute({
  header,
  message,
  type,
  liff,
  button,
}: Props) {
  // [Settings]
  const color =
    type === "Success" ? "green" : type === "Error" ? "rose" : "yellow";
  const Icon =
    type === "Success"
      ? CheckCircleIcon
      : type === "Error"
      ? XCircleIcon
      : ExclamationTriangleIcon;

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-2 mx-auto max-w-md">
      <Icon className={`text-${color}-500 w-24 h-24 md:w-32 md:h-32 my-5`} />
      <p className={`text-${color}-500 text-2xl font-medium`}>{header}</p>
      <p className="text-center mb-10">{message}</p>
      {button === "Close" && liff && (
        <Button onClick={() => liff.closeWindow()}>Close</Button>
      )}
    </div>
  );
}
