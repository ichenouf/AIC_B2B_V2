
const version="V1"
self.addEventListener('install', (event) => {
  console.log(`${version} Install`)
  self.skipWaiting()
    event.waitUntil(
      caches.open('app-cache').then((cache) => {
        return cache.addAll([
          '/app.html',
       
        ]);
      })
    );
});

self.addEventListener('activate',()=>{
  clients.claim();
  console.log(`${version} Active`)
})  


self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async function () {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        console.error('Error fetching:', error);
        return new Response('Failed to fetch', { status: 500, statusText: 'Internal Server Error' });
      }
    })()
  );
});


// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     (async function () {
//       try {
//         const preloadResponse = await event.preloadResponse;
//         if (preloadResponse) {
//           return preloadResponse;
//         }
//         const networkResponse = await fetch(event.request);
//         return new Response(networkResponse.body, networkResponse);
//       } catch (error) {
//         console.error('Error fetching:', error);
//         return new Response('Failed to fetch', { status: 500, statusText: 'Internal Server Error' });
//       }
//     })()
//   );
// });



// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//       async function(){
//         try {
//           const preloadResponse= await event.preloadResponse
//           if(preloadResponse){
//             return preloadResponse
//           }
//           return await fetch(event.request)
  
//         } catch (error) {
          
//         }
//       }
//       // caches.match(event.request).then((response) => {
//       //   return response || fetch(event.request);
//       // })
//     );
// });
  