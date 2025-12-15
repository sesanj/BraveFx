import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-tawk-chat',
  standalone: true,
  template: '', // No template needed
  styles: [''],
})
export class TawkChatComponent implements OnInit, OnDestroy {
  private static isLoaded = false; // Track globally across all instances
  private static loadPromise: Promise<void> | null = null;

  ngOnInit() {
    this.loadTawk();
  }

  ngOnDestroy() {
    // Just hide the widget when navigating away (don't destroy it)
    this.hideWidget();
  }

  private async loadTawk() {
    // If already loading, wait for it
    if (TawkChatComponent.loadPromise) {
      await TawkChatComponent.loadPromise;
      this.showWidget();
      return;
    }

    // If already loaded, just show it
    if (TawkChatComponent.isLoaded) {
      this.showWidget();
      return;
    }

    // Load for the first time
    TawkChatComponent.loadPromise = new Promise<void>((resolve) => {
      // Create Tawk script
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_LoadStart = new Date();

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/6937790d77922a1980f6aa72/1jc0b1n60';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');

      script.onload = () => {
        TawkChatComponent.isLoaded = true;
        TawkChatComponent.loadPromise = null;
        resolve();
      };

      document.head.appendChild(script);
    });

    await TawkChatComponent.loadPromise;
  }

  private showWidget() {
    // Wait for Tawk_API to be ready
    setTimeout(() => {
      if ((window as any).Tawk_API?.showWidget) {
        (window as any).Tawk_API.showWidget();
      }
    }, 100);
  }

  private hideWidget() {
    // Use both hideWidget and minimize to fully hide including notifications
    const tawkApi = (window as any).Tawk_API;
    if (tawkApi) {
      // Minimize first to hide the notification bubble
      if (tawkApi.minimize) {
        tawkApi.minimize();
      }
      // Then hide the widget completely
      if (tawkApi.hideWidget) {
        tawkApi.hideWidget();
      }
    }
  }
}
