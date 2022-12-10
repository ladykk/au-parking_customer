import Spinner from "./Spinner";

// C - Loading
type Props = {
  isLoading?: boolean;
};
export default function Loading({ isLoading = true }: Props) {
  return isLoading ? (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-300 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-3 shadow rounded-lg flex flex-col items-center justify-center gap-3">
        <Spinner />
      </div>
    </div>
  ) : (
    <></>
  );
}
