// importScripts('https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/9.9.3/firebase-messaging.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');



const firebaseConfig = {
    apiKey: "AIzaSyAZuVXDC6TLWoQYnMhZ1uO_U-5LoTB_Dbo",
    authDomain: "aicbtob.firebaseapp.com",
    projectId: "aicbtob",
    storageBucket: "aicbtob.appspot.com",
    messagingSenderId: "148632971252",
    appId: "1:148632971252:web:8424d908ec9e33a234bba1"
};
const vapidKey = {
    publicKey: "BMr90_YT6VnmyuE_LhhJm2Reu3Up160x9a8bZVE-EynHuXX1WRmLu3xKPd6hYcVtRmMHsqMAWYJ6nFmX_W7wCfQ",
}
  
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
// messaging.usePublicVapidKey(vapidKey.publicKey);


messaging.onBackgroundMessage(function (payload) {
  console.log('Message reçu en arrière-plan', payload);

  const notificationTitle = 'Nouvelle notification!';
  const notificationOptions = {
    body: payload.data.body,
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


