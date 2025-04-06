import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0sGQETzKDyvi2xUqpEKuWmQl4JRLPqVw",
  authDomain: "campuspulse-55f8d.firebaseapp.com",
  databaseURL: "https://campuspulse-55f8d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "campuspulse-55f8d",
  storageBucket: "campuspulse-55f8d.firebasestorage.app",
  messagingSenderId: "847619999840",
  appId: "1:847619999840:web:3746e19d862722cc411b05",
  measurementId: "G-EVCWDVYFEM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const firestore = getFirestore();