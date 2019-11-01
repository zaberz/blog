this.addEventListener('install', function (event) {
  // event.waitUntil 这会确保Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成。
  // https://developer.mozilla.org/zh-CN/docs/Web/API/ExtendableEvent/waitUntil
  event.waitUntil(
    // CacheStorage
    // https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
    caches.open('v1').then(function (cache) {
      return cache.addAll([
        '/',
        '/avatar.jpg',
        // '/sw-test/index.html',
        // '/sw-test/style.css',
        // '/sw-test/app.js',
        // '/sw-test/image-list.js',
        // '/sw-test/star-wars-logo.jpg',
        // '/sw-test/gallery/',
        // '/sw-test/gallery/bountyHunters.jpg',
        // '/sw-test/gallery/myLittleVader.jpg',
        // '/sw-test/gallery/snowTroopers.jpg'
      ]);
    })
  );
  console.log(event);
});

this.addEventListener('fetch', function (event) {
  event.respondWith(caches.match(event.request).then(function (response) {
    console.log(1);
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response.clone();

        caches.open('v2').then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        return caches.match('/avatar1.jpg');
        // return new Response('hello');
      });
    }
  }));
});

