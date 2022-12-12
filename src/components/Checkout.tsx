import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Form } from "./Form";

function CheckOutForm({ tid, pid }: { tid: string; pid: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.hostname}/payment/${tid}/${pid}`,
      },
    });
  };
  return (
    <Form onSubmit={handleSubmit}>
      <div className="py-5 flex flex-col gap-5">
        <hr />
        <p className="text-gray-500 text-center font-light">
          2. Fill your email address to receive the receipt.
        </p>
        <hr />
        <PaymentElement />
        <hr />
      </div>
    </Form>
  );
}

export default CheckOutForm;
