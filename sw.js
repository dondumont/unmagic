const version = '20220222211408';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/news/2022/02/22/state-of-disorganized-play-1.html","/swig-n'-sealed/2022/02/13/SNS25.html","/news/2021/11/09/Were-Back-Update.html","/swig-n'-sealed/2021/11/09/SNS-24.html","/news/2020/06/12/Covid-Update.html","/news/2020/03/22/Virtual-FNMs.html","/drafts-and-draft/2020/03/19/Upcoming-Members-Only-Event.html","/swig-n'-sealed/2020/01/14/SNS-23.html","/drafts-and-draft/2019/12/01/Our-First-Invite-Only-Event.html","/swig-n'-sealed/2019/10/04/SNS-22.html","/about/","/calendar/","/discord/","/feed.xml","/css/main.css","/patreon/","/posts/","/assets/styles.css","/subscribe/","/manifest.json","/assets/search.json","/redirects.json","/sitemap.xml","/robots.txt","/index.html","/page/2/index.html","/page/3/index.html","/css/main.css.map","/assets/styles.css.map","/assets/logo.svg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
