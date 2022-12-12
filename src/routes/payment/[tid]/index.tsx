import { useEffect, useState } from "react";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import {
  carDocument,
  Functions,
  transactionDocument,
  transactionPaymentsCollection,
} from "../../../utils/firebase";
import { getUpdateTime } from "../../../utils/datetime";
import { Header, Main } from "../../../components/Layout";
import Feedback from "../../../components/Feedback";

import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import useAuth from "../../../contexts/auth";
import useLiff from "../../../contexts/liff";
import useTitle from "../../../utils/hooks";
import { Query, query, where } from "firebase/firestore";
import { Payment } from "../../../types/payment";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button, Form } from "../../../components/Form";
import CheckOutForm from "../../../components/Checkout";
import Loading from "../../../components/Loading";
import { LicensePlate } from "../../../components/Car";
import Table, { TPair } from "../../../components/Table";
import { TransactionCard } from "../../../components/Transaction";
import Spinner from "../../../components/Spinner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const ProcessPayment = () => {
  const { tid } = useParams();
  const { user } = useAuth();
  const { liff } = useLiff();

  const [createPayment] = useHttpsCallable<string, string>(
    Functions,
    "transactions-createPayment"
  );
  const [transaction, transaction_loading] = useDocumentData(
    transactionDocument(tid)
  );
  const [payments, payments_loading] = useCollectionData(
    transaction?.tid
      ? query<Payment>(
          transactionPaymentsCollection(transaction.tid) as Query<Payment>,
          where("status", "==", "Pending")
        )
      : undefined
  );

  const [isRequest, setRequest] = useState<boolean>(false);
  const [updateTime, setUpdateTime] = useState<string>("Updating...");

  const handleCreatePaymentBtn = async () => {
    setRequest(true);
    await createPayment(tid);
    setRequest(false);
  };

  useEffect(() => {
    if (transaction_loading) setUpdateTime("Updating...");
    else setUpdateTime(getUpdateTime());
  });

  useTitle(`#PAY - ${tid}`);

  return (
    <>
      <Header
        title="Process Payment"
        subTitle={`Updated on: ${updateTime}`}
        hideBack
        liff={liff}
      />
      <Main isLoading={transaction_loading || payments_loading}>
        {transaction ? (
          transaction.fee === transaction.paid ? (
            <Navigate to={`/payment/${tid}/result`} />
          ) : (
            <div className="flex flex-col justify-between h-full">
              <div className="pt-5 flex flex-col gap-5">
                <TransactionCard transaction={transaction} box />
                <Table>
                  <TPair
                    header="Fee"
                    value={`${transaction.fee.toFixed(2)} ฿`}
                  />
                  {transaction.paid !== 0 && (
                    <>
                      <TPair
                        header="Paid"
                        value={`${transaction.paid.toFixed(2)} ฿`}
                      />
                      <TPair
                        header="Remain"
                        value={`${(transaction.fee - transaction.paid).toFixed(
                          2
                        )} ฿`}
                      />
                    </>
                  )}
                </Table>
              </div>
              {isRequest ? (
                <div className="h-full flex flex-col justify-center items-center gap-5">
                  <div className="w-14 h-14">
                    <Spinner resize />
                  </div>
                  <h1 className="text-xl font-medium text-rose-500">
                    Creating Payment
                  </h1>
                </div>
              ) : payments && payments.length > 0 ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: payments[0].client_secret,
                    appearance: {
                      theme: "flat",
                      variables: { colorPrimary: "#f43f5e" },
                    },
                  }}
                >
                  <CheckOutForm tid={transaction.tid} pid={payments[0].pid} />
                </Elements>
              ) : (
                <div className="flex flex-col gap-5">
                  <hr />
                  <p className="text-gray-500 font-light text-center">
                    1. Click the button to continue.
                  </p>
                  <hr />
                  <Button onClick={handleCreatePaymentBtn}>
                    Create Payment
                  </Button>
                </div>
              )}
            </div>
          )
        ) : (
          <Feedback
            header="Transaction not found."
            message={`Transaction with tid "${tid}" is not found.`}
            type="Error"
            button="Close"
            liff={liff}
          />
        )}
      </Main>
    </>
  );
};

export default ProcessPayment;
