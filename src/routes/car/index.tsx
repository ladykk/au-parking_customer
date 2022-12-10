import Feedback from "../../components/Feedback";
import { Header, LIFFRequired, Main } from "../../components/Layout";
import { useCollection } from "react-firebase-hooks/firestore";
import type { Car } from "../../types/car";
import { carsCollection } from "../../utils/firebase";
import { useEffect, useState } from "react";
import { getUpdateTime } from "../../utils/datetime";
import { CarCard } from "../../components/Car";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import useLiff from "../../contexts/liff";
import useAuth from "../../contexts/auth";
import useTitle from "../../utils/hooks";
import { Link } from "react-router-dom";

const CarList = () => {
  const { liff } = useLiff();
  const { user } = useAuth();
  const [cars, loading] = useCollection<Car>(carsCollection(user?.uid));
  const [updateTime, setUpdateTime] = useState<string>("Updating...");

  useEffect(() => {
    if (loading) setUpdateTime("Updating...");
    else setUpdateTime(getUpdateTime());
  });

  useTitle("Your Cars");

  return (
    <LIFFRequired>
      <Header
        liff={liff}
        title="Your Car"
        subTitle={`Updated on: ${updateTime}`}
        btns={
          <Link to="/car/add">
            <PlusCircleIcon className="w-10 h-10 p-1 rounded-md text-green-500 hover:bg-gray-200" />
          </Link>
        }
        hideBack
      />
      <Main isLoading={updateTime === "Updating..."}>
        {cars && cars.docs.length > 0 ? (
          cars.docs.map((doc, index) => (
            <CarCard key={index} car={doc.data()} doc={doc} />
          ))
        ) : (
          <p className="text-center text-gray-500">
            There is no car registered.
          </p>
        )}
      </Main>
    </LIFFRequired>
  );
};

export default CarList;
