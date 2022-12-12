import { initializeApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  getFirestore,
  orderBy,
  query,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import { Car } from "../types/car";
import { Transaction } from "../types/transaction";
import { Payment } from "../types/payment";
import { Customer } from "../types/customer";
import { Staff } from "../types/staff";

// Client Configuration.
const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: "AIzaSyAvG93gN6SFwfqVb_w8L5zILklrpVF9J2U",
  authDomain: "au-parking.firebaseapp.com",
  databaseURL:
    "https://au-parking-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "au-parking",
  storageBucket: "au-parking.appspot.com",
  messagingSenderId: "655310230312",
  appId: "1:655310230312:web:eed21ec9f3403224e9f61d",
  measurementId: "G-GPKLLX5GZP",
};

// Initialize App.
const App = initializeApp(FIREBASE_CONFIG);

// Export Services.
export const Authentication = getAuth(App);
export const Functions = getFunctions(App, "asia-southeast2");
export const Firestore = getFirestore(App);

// Collections
export const carsCollection = (uid: string | undefined) =>
  uid
    ? (collection(
        Firestore,
        "customers",
        uid,
        "cars"
      ) as CollectionReference<Car>)
    : undefined;
export const carDocument = (
  uid: string | undefined,
  license_number: string | undefined
) =>
  license_number && uid
    ? (doc(
        Firestore,
        "customers",
        uid,
        "cars",
        license_number
      ) as DocumentReference<Car>)
    : undefined;

export const transactionsCollection = (cars: QuerySnapshot<Car> | undefined) =>
  cars && cars?.docs.length > 0
    ? query(
        collection(
          Firestore,
          "transactions"
        ) as CollectionReference<Transaction>,

        where(
          "license_number",
          "in",
          cars.docs.map((car) => car.ref.id)
        ),
        orderBy("timestamp_in", "desc")
      )
    : undefined;
export const unpaidTransactionCollection = (
  cars: QuerySnapshot<Car> | undefined
) =>
  cars && cars?.docs.length > 0
    ? query(
        collection(
          Firestore,
          "transactions"
        ) as CollectionReference<Transaction>,
        where(
          "license_number",
          "in",
          cars.docs.map((car) => car.ref.id)
        ),
        where("status", "==", "Unpaid"),
        orderBy("timestamp_in", "desc")
      )
    : undefined;
export const transactionPaymentsCollection = (tid: string | undefined) =>
  tid
    ? query(
        collection(
          Firestore,
          "transactions",
          tid,
          "payments"
        ) as CollectionReference<Payment>,
        orderBy("timestamp", "desc")
      )
    : undefined;

// Documents
export const transactionDocument = (tid: string | undefined) =>
  tid
    ? (doc(Firestore, "transactions", tid) as DocumentReference<Transaction>)
    : undefined;
export const paymentDocument = (
  tid: string | undefined,
  pid: string | undefined
) =>
  tid && pid
    ? (doc(
        Firestore,
        "transactions",
        tid,
        "payments",
        pid
      ) as DocumentReference<Payment>)
    : undefined;
export const customerDocument = (uid: string | undefined) =>
  uid
    ? (doc(Firestore, "customers", uid) as DocumentReference<Customer>)
    : undefined;
export const staffDocument = (email: string | undefined) =>
  email
    ? (doc(Firestore, "staffs", email) as DocumentReference<Staff>)
    : undefined;
