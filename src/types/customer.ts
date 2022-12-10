import { Car } from "./car";

export type Customer = {
  uid: string;
  displayName: string;
  photoUrl: string | null;
};

export type CustomerWithCarRef = Customer & { cars: Array<Car> };
