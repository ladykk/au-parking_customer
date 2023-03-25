import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/globals.css";
import Home from "./routes";
import { FeedbackNoRoute } from "./components/Feedback";
import Landing from "./components/Landing";
import Layout from "./components/Layout";
import useAuth from "./contexts/auth";
import useLiff from "./contexts/liff";
import FourOhFour from "./routes/404";
import CarList from "./routes/car";
import AddCar from "./routes/car/add";
import PaymentList from "./routes/payment";
import ProcessPayment from "./routes/payment/[tid]";
import TransactionList from "./routes/transaction";
import TransactionInfo from "./routes/transaction/[tid]";
import Loading from "./components/Loading";
import PaymentResult from "./routes/payment/[tid]/[pid]";

function MyApp() {
  const { isLiffInitialized, liffError } = useLiff();
  const { user, isAuthLoading, authError } = useAuth();

  const router = createBrowserRouter([
    { path: "", element: <Home /> },
    {
      path: "car",
      children: [
        {
          path: "",
          element: <CarList />,
        },
        { path: "add", element: <AddCar /> },
      ],
    },
    {
      path: "payment",
      children: [
        {
          path: "",
          element: <PaymentList />,
        },
        {
          path: ":tid",
          children: [
            { path: "", element: <ProcessPayment /> },
            { path: ":pid", element: <PaymentResult /> },
          ],
        },
      ],
    },
    {
      path: "transaction",
      children: [
        {
          path: "",
          element: <TransactionList />,
        },
        {
          path: ":tid",
          element: <TransactionInfo />,
        },
      ],
    },
    { path: "*", element: <FourOhFour /> },
  ]);

  if (isAuthLoading || !isLiffInitialized) return <Landing />;

  if (liffError || authError)
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <FeedbackNoRoute
          header="Error Occured"
          message={
            liffError
              ? liffError
              : authError
              ? authError.message
              : "Something went wrong."
          }
          type={"Error"}
          liff={null}
          button="Close"
        />
      </div>
    );

  return (
    <Layout>
      <RouterProvider fallbackElement={<Loading />} router={router} />
    </Layout>
  );
}

export default MyApp;
