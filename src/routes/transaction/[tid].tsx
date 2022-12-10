import { useEffect, useState } from "react";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { useParams } from "react-router-dom";
import { LicensePlate } from "../../components/Car";
import Feedback from "../../components/Feedback";
import { Header, Main } from "../../components/Layout";
import { PaymentCard } from "../../components/Payment";
import Table, { TBody, TPair } from "../../components/Table";
import { TransactionStatusBadge } from "../../components/Transaction";
import useAuth from "../../contexts/auth";
import useLiff from "../../contexts/liff";
import { Car } from "../../types/car";
import { Transaction } from "../../types/transaction";
import { getUpdateTime, timestampToString } from "../../utils/datetime";
import {
  carDocument,
  transactionDocument,
  transactionPaymentsCollection,
} from "../../utils/firebase";
import useTitle from "../../utils/hooks";

const TransactionInfo = () => {
  const { tid } = useParams();
  const { user } = useAuth();
  const { liff } = useLiff();
  const [transaction, transactionLoading] = useDocumentData<Transaction>(
    transactionDocument(tid)
  );
  const [car, carLoading] = useDocumentData<Car>(
    carDocument(user?.uid, transaction?.license_number)
  );
  const [payments, paymentsLoading] = useCollectionData(
    transactionPaymentsCollection(transaction?.tid)
  );
  const [updateTime, setUpdateTime] = useState<string>("Updating...");

  useEffect(() => {
    if (transactionLoading || carLoading || paymentsLoading)
      setUpdateTime("Updating...");
    else setUpdateTime(getUpdateTime());
  });

  useTitle(`#TID - ${tid}`);

  return (
    <>
      <Header
        title="Transaction Info"
        subTitle={`Updated on: ${updateTime}`}
        liff={liff}
      />
      <Main isLoading={transactionLoading || carLoading || paymentsLoading}>
        {transaction ? (
          <div className="flex flex-col gap-3">
            <p className="font-semibold text-2xl">Info</p>
            <Table>
              <TBody>
                <TPair header="TID" value={transaction.tid} />
                <TPair
                  header="Status"
                  value={<TransactionStatusBadge status={transaction.status} />}
                />
                <TPair
                  header="License Number"
                  value={
                    <LicensePlate
                      license_number={
                        car?.license_number ?? transaction.license_number
                      }
                      province={car?.province}
                    />
                  }
                />
                <TPair
                  header="Timestamp-In"
                  value={timestampToString(transaction.timestamp_in)}
                />
                <TPair
                  header="Timestamp-Out"
                  value={timestampToString(transaction.timestamp_out)}
                />
              </TBody>
            </Table>
            <p className="font-semibold text-2xl">Payment</p>
            <Table>
              <TBody>
                <TPair header="Fee" value={`฿ ${transaction.fee.toFixed(2)}`} />
                <TPair
                  header="Paid"
                  value={
                    transaction.paid ? `฿ ${transaction.paid.toFixed(2)}` : "-"
                  }
                />
              </TBody>
            </Table>
            <div className="p-2 rounded-lg border shadow-md">
              {payments && payments.length > 0 ? (
                payments.map((payment, index) => (
                  <PaymentCard payment={payment} key={index} />
                ))
              ) : (
                <p className="text-center text-gray-500">No payments.</p>
              )}
            </div>
          </div>
        ) : (
          <Feedback
            header="Transaction not found."
            message={`Transaction with tid "${tid}" is not found.`}
            type="Error"
            button="Back"
            liff={liff}
          />
        )}
      </Main>
    </>
  );
};

export default TransactionInfo;
