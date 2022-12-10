import type { Payment, PaymentStatus } from "../types/payment";
import { timestampToString } from "../utils/datetime";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import Modal, { Body, Footer, handleModalFunction } from "./Modal";
import { Size } from "../types/tailwind";
import Badge from "./Badge";
import no_img from "../assets/no-image.jpg";

type PaymentCardProps = {
  payment: Payment;
};
export function PaymentCard({ payment }: PaymentCardProps) {
  return (
    payment && (
      <div className="w-full h-24 py-2 px-4 border-b flex items-center justify-between gap-2 hover:bg-zinc-50">
        <div className="flex flex-col">
          <div className="flex gap-1 items-center">
            <PaymentStatusBadge status={payment.status} />
          </div>
          <p>
            <span className="font-medium">Amount:</span> ฿{" "}
            {payment.amount.toFixed(2)}
          </p>
          <p>
            <span className="font-medium">Timestamp:</span>{" "}
            {timestampToString(payment.timestamp)}
          </p>
        </div>
        <PaymentPreview payment={payment} />
      </div>
    )
  );
}

// C - Payment preview
type Props = { payment: Payment };
export function PaymentPreview({ payment }: Props) {
  // [States]
  const [isModalShow, setModalShow] = useState<boolean>(false);

  // [Functions]
  // F - Handle modal.
  const handleModal = handleModalFunction(setModalShow, () => {});

  return (
    <>
      <PhotoIcon
        className="w-9 h-9 md:w-8 md:h-8 p-1 rounded-md text-black hover:bg-gray-300 hover:cursor-pointer"
        onClick={() => handleModal()}
      />
      <Modal
        title={`฿ ${payment.amount.toFixed(2)} on ${timestampToString(
          payment.timestamp
        )}`}
        isShow={isModalShow}
        setShow={setModalShow}
      >
        <Body>
          <img
            src={payment.slip ? payment.slip : no_img}
            alt=""
            className="mx-auto w-full h-[75vh] object-scale-down"
          />
        </Body>
      </Modal>
    </>
  );
}

// C - Payment status.
type PaymentStatusBadgeProps = {
  status?: PaymentStatus;
  size?: Size;
  expand?: boolean;
};
export function PaymentStatusBadge({
  status,
  size = "sm",
  expand = false,
}: PaymentStatusBadgeProps) {
  return (
    <Badge
      size={size}
      color={
        status === "Approve"
          ? "green"
          : status === "Reject"
          ? "red"
          : status === "Pending"
          ? "yellow"
          : status === "Refund"
          ? "gray"
          : "blue"
      }
      expand={expand}
    >
      {status}
    </Badge>
  );
}
