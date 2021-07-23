import { Level } from "./model/Level";

class GalleryServiceWorker {
  private static readonly cacheName = "pr-reality";

  public static run(): void {
    addEventListener('install', GalleryServiceWorker.onInstalled);
    addEventListener('fetch', GalleryServiceWorker.onFetch);
  }

  public static onInstalled(event: ExtendableEvent): void {
    event.waitUntil(GalleryServiceWorker.InstallApplication());
  }

  public static onFetch(event: FetchEvent): void {
    event.respondWith(GalleryServiceWorker.FetchContent(event.request));
  }

  public static async FetchContent(request: Request) {
    try {
      var data = await fetch(request);
      return data;
    }
    catch
    {
      var cache = await caches.open(GalleryServiceWorker.cacheName);
      return cache.match(request);
    }
  }
  public static async InstallApplication() {
    try {
      const response = await fetch("json/levels.json");
      const data: Level[] = await response.json();

      const offlineFiles = [
        // Application files
        '/',
        '/index.html',
        '/main.min.js',
        '/bundle.css',
        '/component/toolbar/toolbar.html',
        '/component/search/search.html',
        '/component/mapBrowser/mapBrowser.html',
        '/component/mapDetails/mapDetails.html',
        '/component/routeSelector/routeSelector.html',
        '/component/layoutSelector/layoutSelector.html',
        '/component/assetsPanel/assetsPanel.html',

        // Gallery 'dynamic' data
        '/css/flags_sprite.css',
        '/css/vehicles_sprite.css',
        '/images/vehicles_sprite.png',
        '/images/flags_sprite.png',
        '/json/vehicles.json',
      ];

      for (var level of data) {
        for (var layout of level.Layouts) {
          var layoutJson = `/json/${GalleryServiceWorker.cleanName(level.Name)}/${layout.Key}_${layout.Value}.json`;
          offlineFiles.push(layoutJson);
        }
      }

      const cache = await caches.open(GalleryServiceWorker.cacheName);
      return cache.addAll(offlineFiles);
    }
    catch (error) {
      console.error(error);
    }
  }

  public static cleanName(name: string) {
    return name.replace(/\s|_/g, "").toLowerCase();
  }
}


GalleryServiceWorker.run();



/** Extends the lifetime of the install and activate events dispatched on the global scope as part of the service worker lifecycle. This ensures that any functional events (like FetchEvent) are not dispatched until it upgrades database schemas and deletes the outdated cache entries. */
interface ExtendableEvent extends Event {
  waitUntil(f: any): void;
}

/** This is the event type for fetch events dispatched on the service worker global scope. It contains information about the fetch, including the request and how the receiver will treat the response. It provides the event.respondWith() method, which allows us to provide a response to this fetch. */
interface FetchEvent extends ExtendableEvent {
  readonly clientId: string;
  readonly preloadResponse: Promise<any>;
  readonly replacesClientId: string;
  readonly request: Request;
  readonly resultingClientId: string;
  respondWith(r: Response | Promise<Response>): void;
}