import type { Transaction, TransactionStatus } from "../types/transaction";
import { timestampToString } from "../utils/datetime";
import { LicensePlate } from "./Car";
import { Size } from "../types/tailwind";
import Badge from "./Badge";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "./Form";
import Modal, { Body, Footer, handleModalFunction } from "./Modal";
import { useNavigate } from "react-router-dom";

// C - Transaction card
type TransactionCardProps = {
  transaction: Transaction;
  noNavigate?: boolean;
  box?: boolean;
  payment?: boolean;
};
export function TransactionCard({
  transaction,
  noNavigate = false,
  box,
  payment,
}: TransactionCardProps) {
  const navigate = useNavigate();

  return (
    transaction && (
      <div
        className={`w-full h-24 py-2 px-4 ${
          box ? "border shadow rounded-lg" : "border-b"
        } flex items-center gap-2 hover:bg-zinc-50 relative cursor-pointer`}
        onClick={() =>
          !noNavigate &&
          transaction.tid &&
          navigate(
            payment
              ? `/payment/${transaction.tid}`
              : `/transaction/${transaction.tid}`
          )
        }
      >
        <div className="w-[70px] flex flex-col gap-2 items-center justify-center">
          <TransactionStatusBadge status={transaction.status} expand />
        </div>
        <div className="flex flex-col">
          <p>
            <span className="font-medium">Time-In:</span>{" "}
            {timestampToString(transaction.timestamp_in)}
          </p>
          {transaction.timestamp_out && (
            <p>
              <span className="font-medium">Time-Out:</span>{" "}
              {timestampToString(transaction.timestamp_out)}
            </p>
          )}

          <p>
            <span className="font-medium">Fee:</span> {transaction.fee}฿
          </p>
        </div>
        <div className="absolute top-0 right-0 bottom-0 flex opacity-20 lg:opacity-100 px-4 py-3 z-10">
          <LicensePlate license_number={transaction.license_number} />
        </div>
      </div>
    )
  );
}

type TransactionStatusBadgeProps = {
  status: TransactionStatus;
  size?: Size;
  expand?: boolean;
};
export function TransactionStatusBadge({
  status,
  size = "sm",
  expand = false,
}: TransactionStatusBadgeProps) {
  return (
    <Badge
      size={size}
      color={status === "Paid" ? "green" : status === "Unpaid" ? "red" : "gray"}
      expand={expand}
    >
      {status ? status : "Process"}
    </Badge>
  );
}

type TransactionSelectProps = {
  transactions: Array<Transaction> | undefined;
  loading: boolean;
  name: string;
  placeholder: string;
  value: string | undefined;
  setForm: Dispatch<SetStateAction<any>>;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  setError?: Dispatch<SetStateAction<any>>;
};

export default function TransactionSelect({
  transactions = [],
  loading,
  name = "",
  placeholder = "",
  value,
  setForm,
  required = false,
  disabled = false,
  error,
  setError,
}: TransactionSelectProps) {
  // [States]
  const [isShow, setShow] = useState<boolean>(false);
  const [allowClear, setAllowClear] = useState<boolean>(false);

  // [Data]
  const selectedIndex = transactions.findIndex(
    (transaction) => transaction.tid === value
  );

  // [Settings]
  const color = error ? "rose" : "gray";

  // [Functions]
  // F - Handle modal.
  const handleModal = handleModalFunction(setShow);

  // F - On input change
  const handleOnChange = (tid: string | undefined) => {
    setError &&
      setError((errors: any) => ({ ...errors, [name]: "", form: "" }));

    setForm((f: any) => ({ ...f, [name]: tid ?? "" }));
    handleModal(false);
  };

  // F - Handle clear selected.
  const clearSelected = () => {
    if (!allowClear) return;
    setForm((f: any) => ({ ...f, [name]: undefined }));
    handleModal(false);
  };

  // [Effects]
  // E - Set allow clear when transaction loaded.
  useEffect(() => {
    if (!loading) setAllowClear(true);
  }, [loading]);

  // E - Clear when transaction not found.
  useEffect(() => {
    if (selectedIndex <= -1) clearSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  return (
    <div className="mb-4">
      <Modal title="Select Transaction" isShow={isShow} setShow={setShow}>
        <Body hFull>
          {transactions.length > 0 ? (
            transactions.map((transaction, i) => (
              <div key={i} onClick={() => handleOnChange(transaction.tid)}>
                <TransactionCard transaction={transaction} noNavigate />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center my-2">No transaction</p>
          )}
        </Body>
        <Footer>
          <Button onClick={() => clearSelected()}>Clear</Button>
        </Footer>
      </Modal>
      <label className={`block mb-2 text-sm font-medium text-${color}-600`}>
        {placeholder} {required && <span className="text-rose-500">*</span>}
      </label>
      <div
        onClick={() => handleModal(true)}
        className={`flex justify-between items-center gap-2 ${
          selectedIndex > -1 ? "bg-white" : "bg-gray-50"
        } border border-${color}-300 text-gray-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full min-h-[48px] md:min-h-[40px] p-2.5`}
      >
        {selectedIndex > -1 ? (
          <TransactionCard
            transaction={transactions[selectedIndex]}
            noNavigate
          />
        ) : (
          <p>Not selected</p>
        )}
        <ChevronDownIcon className="w-4 text-gray-500" />
      </div>
    </div>
  );
}
