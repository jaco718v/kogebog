import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"

const firebaseConfig = {

  apiKey: "AIzaSyBJBavwx2D2wZYjN9SrgAP6pDe80M5_-hw",

  authDomain: "cookbook-906c5.firebaseapp.com",

  projectId: "cookbook-906c5",

  storageBucket: "cookbook-906c5.appspot.com",

  messagingSenderId: "691861510645",

  appId: "1:691861510645:web:647efaf56703d7f72d28bc"

};


  const app = initializeApp(firebaseConfig);

  const storage = getStorage(app)

  const db = getFirestore(app)

  export {app, db, storage}