// Fichier : app.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-messaging.js";

// Configurer et initialiser Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAZuVXDC6TLWoQYnMhZ1uO_U-5LoTB_Dbo",
    authDomain: "aicbtob.firebaseapp.com",
    projectId: "aicbtob",
    storageBucket: "aicbtob.appspot.com",
    messagingSenderId: "148632971252",
    appId: "1:148632971252:web:8424d908ec9e33a234bba1"
};
  


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging }; 


