import { useState, useEffect } from "react";
import {
  useCollection,
  useCollectionData,
} from "react-firebase-hooks/firestore";
import { Header, LIFFRequired, Main } from "../../components/Layout";
import { TransactionCard } from "../../components/Transaction";
import useAuth from "../../contexts/auth";
import useLiff from "../../contexts/liff";
import { Transaction } from "../../types/transaction";
import { getUpdateTime } from "../../utils/datetime";
import {
  carsCollection,
  Firestore,
  transactionsCollection,
} from "../../utils/firebase";
import useTitle from "../../utils/hooks";

const TransactionList = () => {
  const { user } = useAuth();
  const { liff } = useLiff();
  const [cars, carsLoading] = useCollection(carsCollection(user?.uid));
  const [transactions, transactionsLoading] = useCollectionData<Transaction>(
    transactionsCollection(cars)
  );
  const [updateTime, setUpdateTime] = useState<string>("Updating...");

  useEffect(() => {
    if (carsLoading || transactionsLoading) setUpdateTime("Updating...");
    else setUpdateTime(getUpdateTime());
  });

  useTitle("Transactions");

  return (
    <LIFFRequired>
      <Header
        title="Transactions"
        liff={liff}
        subTitle={`Updated on: ${updateTime}`}
        hideBack
      />
      <Main isLoading={carsLoading || transactionsLoading}>
        {transactions && transactions?.length > 0 ? (
          transactions.map((transaction, index) => (
            <TransactionCard key={index} transaction={transaction} />
          ))
        ) : (
          <p className="text-center text-gray-500">There is no transaction.</p>
        )}
      </Main>
    </LIFFRequired>
  );
};

export default TransactionList;
