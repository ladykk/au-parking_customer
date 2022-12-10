import { useEffect, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {
  CreatePayment,
  CreatePaymentErrors,
  CreatePaymentForm,
} from "../../types/payment";
import {
  Firestore,
  transactionDocument,
  uploadSlipImage,
} from "../../utils/firebase";
import generatePayload from "promptpay-qr";
import {
  FormError,
  handleFormError,
  handleHelperError,
} from "../../utils/error";
import { FirebaseError } from "firebase/app";
import { doc, DocumentReference, addDoc, collection } from "firebase/firestore";
import { Customer } from "../../types/customer";
import { getUpdateTime, inputToTimestamp } from "../../utils/datetime";
import { Header, Main } from "../../components/Layout";
import Feedback from "../../components/Feedback";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { FileInput, Form, Input } from "../../components/Form";
import QRCode from "react-qr-code";
import thai_qr_logo from "../../assets/thai-qr-logo.png";
import thai_qr_payment from "../../assets/thai-qr-payment.png";
import { useParams, Link } from "react-router-dom";
import useAuth from "../../contexts/auth";
import useLiff from "../../contexts/liff";
import useTitle from "../../utils/hooks";

// [Default States]
const formState: CreatePaymentForm = {
  amount: 0,
  slip: null,
  timestamp: "",
  paid_by: "",
};

const errorsState: CreatePaymentErrors = {
  slip: "",
  timestamp: "",
  form: "",
};

const ProcessPayment = () => {
  const { tid } = useParams();
  const { user } = useAuth();
  const { liff } = useLiff();

  const [transaction, loading] = useDocumentData(transactionDocument(tid));

  const [form, setForm] = useState<CreatePaymentForm>(formState);
  const [errors, setErrors] = useState<CreatePaymentErrors>(errorsState);
  const [isRequest, setRequest] = useState<boolean>(false);
  const [isPaid, setPaid] = useState<boolean>(false);
  const [updateTime, setUpdateTime] = useState<string>("Updating...");

  useEffect(() => {
    if (loading) setUpdateTime("Updating...");
    else setUpdateTime(getUpdateTime());
  });

  const remaining = transaction?.fee
    ? transaction.fee - (transaction.paid ? transaction.paid : 0)
    : 0;
  const qrCodePayload = generatePayload("1100703162982", { amount: remaining });

  useEffect(() => {
    setForm((f) => {
      return {
        ...f,
        amount: remaining,
        paid_by: user?.uid ?? "",
      };
    });
  }, [remaining, user]);

  const handleOnSubmit = async () => {
    try {
      setRequest(true);
      if (tid) {
        await addPayment(tid, form);
        setPaid(true);
      }
    } catch (err: any) {
      handleFormError(err, Object.keys(errors), setErrors);
    } finally {
      setRequest(false);
    }
  };

  useTitle(`#PAY - ${tid}`);

  return (
    <>
      <Header
        title="Process Payment"
        subTitle={`Updated on: ${updateTime}`}
        hideBack
        liff={liff}
      />
      <Main
        isLoading={
          loading || isRequest || (isPaid && transaction?.status !== "Paid")
        }
      >
        {transaction ? (
          transaction.fee === transaction.paid ? (
            <Feedback
              header="Transaction has been paid."
              message="Transaction has been paid. Thank you for using our service."
              type="Success"
              button="Close"
              liff={null}
            />
          ) : (
            <Form onSubmit={handleOnSubmit} error={errors.form}>
              <div className="flex flex-col justify-between">
                <div className="w-full flex flex-col justify-center gap-5 py-5 flex-1">
                  <div className="bg-white p-2 w-[65%] rounded-lg h-auto aspect-square flex justify-center items-center mx-auto shadow-md border relative">
                    <QRCode
                      value={qrCodePayload}
                      size={256}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                      viewBox={`0 0 256 256`}
                    />
                    <img
                      src={thai_qr_logo}
                      className="absolute top-0 left-0 right-0 bottom-0 w-full h-full object-scale-down p-[35%]"
                      alt=""
                    />
                  </div>
                  <Link
                    to={tid ? `/transaction/${tid}` : "#"}
                    className="text-zinc-500 border shadow-md flex items-center justify-center gap-1 w-[65%] mx-auto rounded-lg h-10 pr-1"
                  >
                    <img
                      src={thai_qr_payment}
                      alt=""
                      className="h-full w-auto rounded-l-lg flex-0"
                    />
                    <p className="font-medium ml-2 flex-1 text-center">
                      {`฿ ${remaining.toFixed(2)}`}
                    </p>
                    <ChevronRightIcon className="w-5 h-5 flex-0" />
                  </Link>
                </div>
                <div className="flex-0 h-fit">
                  <FileInput
                    name="slip"
                    placeholder="Slip"
                    setForm={setForm}
                    limitMB={2}
                    required
                    preview
                    error={errors.slip}
                    setError={setErrors}
                  />
                  <Input
                    name="timestamp"
                    placeholder="Timestamp"
                    type="datetime-local"
                    value={form.timestamp}
                    setForm={setForm}
                    required
                    error={errors.timestamp}
                    setError={setErrors}
                  />
                </div>
              </div>
            </Form>
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

export const addPayment = async (tid: string, form: CreatePaymentForm) => {
  // Validate.
  // CASE: no slip photo.
  // DO: throw form error.
  if (!form.slip) {
    throw new FormError({ slip: "Required slip photo." });
  }

  // Upload slip.
  const slipUrl = await uploadSlipImage(tid, form.slip);

  // Format payment.
  const payment: CreatePayment = {
    amount: form.amount,
    slip: slipUrl,
    timestamp: inputToTimestamp(form.timestamp),
    paid_by: doc(
      Firestore,
      "customers",
      form.paid_by
    ) as DocumentReference<Customer>,
  };

  // Add payment.
  return await addDoc(
    collection(Firestore, "transactions", tid, "payments"),
    payment
  ).catch((err) => {
    handleHelperError("addPayment", err);
    throw new FormError({
      form: `Cannot add payment.${
        err instanceof FirebaseError ? ` (${err.message})` : ""
      })`,
    });
  });
};
