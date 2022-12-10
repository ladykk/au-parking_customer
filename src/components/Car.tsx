import type { Car } from "../types/car";
import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Button } from "./Form";
import Modal, { Body, Footer, handleModalFunction } from "./Modal";
import Loading from "./Loading";
import { deleteDoc, QueryDocumentSnapshot } from "firebase/firestore";

// C - Car card.
type CarCardProps = { car: Car; doc: QueryDocumentSnapshot<Car> };
export function CarCard({ car, doc }: CarCardProps) {
  return (
    <div className="w-full p-2 border-b flex items-center justify-between">
      <div className="flex gap-3 items-center">
        <LicensePlate
          license_number={car.license_number}
          province={car.province}
        />
        <div>
          <p>Brand: {car.brand}</p>
          <p>Color: {car.color}</p>
        </div>
      </div>
      <CarRemoveModal car={car} doc={doc} />
    </div>
  );
}

// C - Car remove modal.
type CarRemoveModalProps = {
  doc: QueryDocumentSnapshot<Car>;
  car: Car;
};
export function CarRemoveModal({ doc, car }: CarRemoveModalProps) {
  // [States]
  const [isRequest, setIsRequest] = useState<boolean>(false);
  const [isModalShow, setModalShow] = useState<boolean>(false);

  // [Functions]
  // F - Handle modal.
  const handleModal = handleModalFunction(setModalShow);

  // F - Remove car.
  const handleDeleteCar = async () => {
    setIsRequest(true);
    await deleteDoc(doc.ref);
    setIsRequest(false);
    handleModal(false);
  };

  return (
    <>
      <Loading isLoading={isRequest} />
      <Modal
        title={`Remove '${car.license_number}'?`}
        isShow={isModalShow}
        setShow={setModalShow}
        maxSize="md"
      >
        <Body center>
          <p>
            You will not received a notification from this car.
            <br /> Are you sure to remove '{car.license_number}'?
          </p>
        </Body>
        <Footer>
          <Button onClick={handleDeleteCar}>Remove</Button>
          <Button variant="outline" onClick={() => handleModal(false)}>
            Cancel
          </Button>
        </Footer>
      </Modal>
      <TrashIcon
        className="w-8 h-8 p-1 rounded-md hover:bg-gray-200 hover:cursor-pointer text-rose-500"
        onClick={() => handleModal(true)}
      />
    </>
  );
}

// C - License plate.
type LicensePlateProps = {
  license_number?: string;
  province?: string;
  preview?: boolean;
};
export function LicensePlate({
  license_number,
  province,
  preview = false,
}: LicensePlateProps) {
  return (
    <div
      className={
        preview
          ? "w-fit min-w-[200px] bg-white mx-auto px-4 py-3 border-2 border-black rounded-lg flex flex-col gap-1 text-black"
          : "w-fit min-w-[150px] bg-white px-3 py-2 border-2 border-black rounded-lg flex flex-col justify-center gap-1 text-black"
      }
    >
      <p
        className={
          preview
            ? "text-2xl font-semibold text-center"
            : "text-xl font-semibold text-center"
        }
      >
        {license_number ? license_number : "License number"}
      </p>
      {typeof province !== "undefined" && (
        <p className={preview ? "text-center" : "text-center text-sm"}>
          {province ? province : "Province"}
        </p>
      )}
    </div>
  );
}
