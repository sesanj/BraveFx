import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(private meta: Meta, private title: Title) {}

  updateTitle(title: string) {
    this.title.setTitle(title);
  }

  updateMetaTags(config: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    keywords?: string;
  }) {
    if (config.title) {
      this.title.setTitle(config.title);
      this.meta.updateTag({ property: 'og:title', content: config.title });
      this.meta.updateTag({ name: 'twitter:title', content: config.title });
    }

    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({
        property: 'og:description',
        content: config.description,
      });
      this.meta.updateTag({
        name: 'twitter:description',
        content: config.description,
      });
    }

    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }

    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
      this.meta.updateTag({ name: 'twitter:url', content: config.url });
      this.meta.updateTag({ rel: 'canonical', href: config.url });
    }

    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }
  }

  updateCanonicalUrl(url: string) {
    const head = document.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null =
      document.querySelector(`link[rel='canonical']`) || null;

    if (element == null) {
      element = document.createElement('link') as HTMLLinkElement;
      element.setAttribute('rel', 'canonical');
      head.appendChild(element);
    }
    element.setAttribute('href', url);
  }
}
