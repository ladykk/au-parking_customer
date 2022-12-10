import { FirebaseError } from "firebase/app";
import { doc, QuerySnapshot, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useCollectionOnce } from "react-firebase-hooks/firestore";
import { LicensePlate } from "../../components/Car";
import Feedback from "../../components/Feedback";
import { Form, Input, Select } from "../../components/Form";
import { Header, LIFFRequired, Main } from "../../components/Layout";
import { CAR_BRAND_LIST, CAR_COLOR_LIST } from "../../constants/car";
import PROVINCE_LISTS from "../../constants/provinces";
import useAuth from "../../contexts/auth";
import useLiff from "../../contexts/liff";
import { AddCarErrors, Car } from "../../types/car";
import { isThaiLicenseNumber, keyOfLicenseNumber } from "../../utils/car";
import {
  FormError,
  handleFormError,
  handleHelperError,
} from "../../utils/error";
import { carsCollection, Firestore } from "../../utils/firebase";
import { useNavigate } from "react-router-dom";
import useTitle from "../../utils/hooks";

// [Default States]
const formState: Car = {
  license_number: "",
  province: "",
  brand: "",
  color: "",
};

const errorsState: AddCarErrors = {
  license_number: "",
  province: "",
  brand: "",
  color: "",
  form: "",
};

const AddCar = () => {
  const { liff } = useLiff();
  const { user } = useAuth();

  const navigate = useNavigate();

  const [cars, loading] = useCollectionOnce<Car>(carsCollection(user?.uid));
  const [form, setForm] = useState<Car>(formState);
  const [errors, setErrors] = useState<AddCarErrors>(errorsState);
  const [isRequest, setIsRequest] = useState<boolean>(false);

  const handleOnSubmit = async () => {
    try {
      setIsRequest(true);
      await addCar(form, user?.uid, cars as QuerySnapshot<Car>);
      navigate(-1);
    } catch (err: any) {
      handleFormError(err, Object.keys(errors), setErrors);
    } finally {
      setIsRequest(false);
    }
  };

  useTitle("Add Car");

  return (
    <LIFFRequired>
      <Header liff={liff} title="Add Car" />
      <Main isLoading={loading || isRequest}>
        <Form onSubmit={handleOnSubmit} placeholder="Add" error={errors.form}>
          <div className="my-5">
            <LicensePlate
              license_number={form.license_number}
              province={form.province}
              preview
            />
          </div>
          <Input
            name="license_number"
            placeholder="License Number"
            value={form.license_number}
            setForm={setForm}
            setError={setErrors}
            error={errors.license_number}
            required
          />
          <Select
            name="province"
            placeholder="Province"
            value={form.province}
            setForm={setForm}
            setError={setErrors}
            options={PROVINCE_LISTS}
            error={errors.province}
            required
          />
          <Select
            name="brand"
            placeholder="Brand"
            value={form.brand}
            setForm={setForm}
            setError={setErrors}
            options={CAR_BRAND_LIST}
            error={errors.brand}
            required
          />
          <Select
            name="color"
            placeholder="Color"
            value={form.color}
            setForm={setForm}
            setError={setErrors}
            options={CAR_COLOR_LIST}
            error={errors.color}
            required
          />
        </Form>
      </Main>
    </LIFFRequired>
  );
};

export default AddCar;

const addCar = async (
  form: Car,
  uid: string | undefined,
  cars: QuerySnapshot<Car>
) => {
  // Check customer's uid
  if (typeof uid === "undefined") {
    throw new FormError({ form: "Cannot detect user acccount." });
  }
  // Check is license number is valid.
  if (!isThaiLicenseNumber(form.license_number)) {
    throw new FormError({
      license_number: "Please enter valid license number.",
    });
  }
  // Check if duplicate key.
  const key = keyOfLicenseNumber(form.license_number);
  if (cars.docs.some((doc) => keyOfLicenseNumber(doc.ref.id) === key)) {
    throw new FormError({
      license_number: "This license number already added.",
    });
  }
  // Add car.
  const carRef = doc(Firestore, "customers", uid, "cars", key);
  await setDoc(carRef, form)
    .then(() => {
      return;
    })
    .catch((err) => {
      handleHelperError("addCar", err);
      throw new FormError({
        form: `Cannot add car.${
          err instanceof FirebaseError ? ` (${err.message})` : ""
        })`,
      });
    });
};
