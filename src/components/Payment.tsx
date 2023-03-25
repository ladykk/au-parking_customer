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
      <div className="w-full py-2 px-4 border-b flex flex-col hover:bg-zinc-50">
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
        {payment.reason && (
          <p>
            <span className="font-medium">Reason:</span>{" "}
            {payment.reason.slice(15)}
          </p>
        )}
      </div>
    )
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
        status === "Success"
          ? "green"
          : status === "Failed"
          ? "red"
          : status === "Pending"
          ? "yellow"
          : status === "Refund" || status === "Canceled"
          ? "gray"
          : "blue"
      }
      expand={expand}
    >
      {status}
    </Badge>
  );
}
