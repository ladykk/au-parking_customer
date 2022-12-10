import { useEffect, useState } from "react";
import {
  useCollection,
  useCollectionData,
} from "react-firebase-hooks/firestore";
import Feedback from "../../components/Feedback";
import { Header, LIFFRequired, Main } from "../../components/Layout";
import { TransactionCard } from "../../components/Transaction";
import useAuth from "../../contexts/auth";
import useLiff from "../../contexts/liff";
import { Car } from "../../types/car";
import { Transaction } from "../../types/transaction";
import { getUpdateTime } from "../../utils/datetime";
import {
  carsCollection,
  unpaidTransactionCollection,
} from "../../utils/firebase";
import useTitle from "../../utils/hooks";

const PaymentList = () => {
  const { user } = useAuth();
  const { liff } = useLiff();
  const [cars, carsLoading] = useCollection<Car>(carsCollection(user?.uid));
  const [transactions, transactionsLoading] = useCollectionData<Transaction>(
    unpaidTransactionCollection(cars)
  );
  const [updateTime, setUpdateTime] = useState<string>("Updating...");

  useEffect(() => {
    if (carsLoading || transactionsLoading) setUpdateTime("Updating...");
    else setUpdateTime(getUpdateTime());
  });

  useTitle("Pay");

  return (
    <LIFFRequired>
      <Header
        title="Pay Transactions"
        subTitle={`Updated on: ${updateTime}`}
        hideBack
        liff={liff}
      />
      <Main isLoading={carsLoading || transactionsLoading}>
        {transactions && transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionCard transaction={transaction} payment />
          ))
        ) : (
          <p className="text-center text-gray-500">
            There is no unpaid transaction.
          </p>
        )}
      </Main>
    </LIFFRequired>
  );
};

export default PaymentList;
