import { useEffect, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { Link, Navigate, useParams } from "react-router-dom";
import Feedback from "../../../components/Feedback";
import { Button } from "../../../components/Form";
import { Header, Main } from "../../../components/Layout";
import Spinner from "../../../components/Spinner";
import useLiff from "../../../contexts/liff";
import { getUpdateTime } from "../../../utils/datetime";
import { paymentDocument, transactionDocument } from "../../../utils/firebase";
import useTitle from "../../../utils/hooks";

function PaymentResult() {
  const { tid, pid } = useParams();
  const { liff } = useLiff();

  const [transaction, transaction_loading] = useDocumentData(
    transactionDocument(tid)
  );
  const [payment, payment_loading] = useDocumentData(
    paymentDocument(transaction?.tid, pid)
  );

  const [updateTime, setUpdateTime] = useState<string>("Updating...");

  useEffect(() => {
    if (payment_loading) setUpdateTime("Updating...");
    else setUpdateTime(getUpdateTime());
  });

  useTitle(`#PAY - ${tid}`);
  return (
    <>
      <Header
        title="Payment Result"
        subTitle={`Updated on: ${updateTime}`}
        hideBack
        liff={liff}
      />
      <Main isLoading={transaction_loading || payment_loading}>
        {transaction ? (
          payment ? (
            payment.status === "Pending" || payment.status === "Process" ? (
              <div className="h-full flex flex-col justify-center gap-5">
                <div className="w-14 h-14 mx-auto">
                  <Spinner resize />
                </div>
                <h1 className="text-2xl font-medium text-rose-500 text-center">
                  Waiting for Confirmation
                </h1>
                <p className="text-center text-gray-500">
                  Once the bank confirm the payment, we will update to you.
                </p>
                <hr />
                <p className="text-center text-gray-500">Not paid yet?</p>
                <Link to={`/payment/${tid}`}>
                  <Button>Go to Process Payment</Button>
                </Link>
              </div>
            ) : payment.status === "Success" ? (
              <Feedback
                header="Transaction has been paid."
                message="Transaction has been paid. Thank you for using our service."
                type="Success"
                button="Close"
                liff={liff}
              />
            ) : payment.status === "Canceled" || payment.status === "Refund" ? (
              <Feedback
                header={`Payment ${payment.status}`}
                message="This payment is no loger be used with the transaction."
                type="Warning"
                button="Close"
                liff={liff}
              />
            ) : (
              <Feedback
                header="Payment Failed"
                message={`Reason: ${payment.reason?.slice(15)}`}
                type="Error"
                button="Close"
                liff={liff}
              />
            )
          ) : payment_loading ? (
            <></>
          ) : transaction.fee === transaction.paid ? (
            <Feedback
              header="Transaction has been paid."
              message="Transaction has been paid. Thank you for using our service."
              type="Success"
              button="Close"
              liff={liff}
            />
          ) : (
            <Navigate to={`/payment/${tid}`} />
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
}

export default PaymentResult;
