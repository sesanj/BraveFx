import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TawkService {
  private renderer: Renderer2;
  private tawkLoaded = false;
  private tawkScript: any;

  // Pages where Tawk.to should be visible
  private allowedPages = ['/', '/checkout', '/reviews'];

  constructor(
    private rendererFactory: RendererFactory2,
    private router: Router
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);

    // Listen to route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.handleRouteChange(event.urlAfterRedirects);
      });
  }

  /**
   * Initialize Tawk.to chat widget
   * Call this method in app.component.ts ngOnInit
   */
  initTawk() {
    if (this.tawkLoaded) return;

    // Replace with your actual Tawk.to Property ID and Widget ID
    const propertyId = '6937790d77922a1980f6aa72'; // e.g., '5f1234567890abcdef123456'
    const widgetId = '1jc0b1n60'; // e.g., 'default' or '1a2b3c4d'

    // Check if we should show Tawk on current page
    // Remove query params and hash fragments
    const currentUrl = this.router.url.split('?')[0].split('#')[0];
    if (!this.shouldShowTawk(currentUrl)) {
      return;
    }

    // Create Tawk_API global object
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    // Create and append script
    this.tawkScript = this.renderer.createElement('script');
    this.tawkScript.type = 'text/javascript';
    this.tawkScript.async = true;
    this.tawkScript.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    this.tawkScript.charset = 'UTF-8';
    this.tawkScript.setAttribute('crossorigin', '*');

    this.renderer.appendChild(document.body, this.tawkScript);
    this.tawkLoaded = true;

    // Customize widget appearance
    this.customizeTawk();
  }

  /**
   * Check if Tawk should be shown on current page
   */
  private shouldShowTawk(url: string): boolean {
    // Remove hash fragments (e.g., /#enroll becomes /)
    const cleanUrl = url.split('#')[0];

    return this.allowedPages.some(
      (page) => cleanUrl === page || cleanUrl.startsWith(page + '/')
    );
  }

  /**
   * Handle route changes - show/hide Tawk widget
   */
  private handleRouteChange(url: string) {
    // Remove query params and hash fragments
    const cleanUrl = url.split('?')[0].split('#')[0];

    if (!this.tawkLoaded) {
      // If Tawk not loaded yet and we're on allowed page, load it
      if (this.shouldShowTawk(cleanUrl)) {
        this.initTawk();
      }
      return;
    }

    // Tawk is loaded, show or hide based on page
    if (this.shouldShowTawk(cleanUrl)) {
      this.showWidget();
    } else {
      this.hideWidget();
    }
  }

  /**
   * Show Tawk widget
   */
  showWidget() {
    if ((window as any).Tawk_API && (window as any).Tawk_API.showWidget) {
      (window as any).Tawk_API.showWidget();
    }
  }

  /**
   * Hide Tawk widget
   */
  hideWidget() {
    if ((window as any).Tawk_API && (window as any).Tawk_API.hideWidget) {
      (window as any).Tawk_API.hideWidget();
    }
  }

  /**
   * Customize Tawk widget colors to match BraveFx purple theme
   */
  private customizeTawk() {
    if ((window as any).Tawk_API) {
      (window as any).Tawk_API.onLoad = () => {
        // Customize widget appearance
        (window as any).Tawk_API.setAttributes(
          {
            name: 'BraveFx Visitor',
            // You can add more custom attributes here
          },
          (error: any) => {
            if (error) {
              console.error('Error setting Tawk attributes:', error);
            }
          }
        );
      };
    }
  }

  /**
   * Maximize (open) the chat window
   */
  maximize() {
    if ((window as any).Tawk_API && (window as any).Tawk_API.maximize) {
      (window as any).Tawk_API.maximize();
    }
  }

  /**
   * Minimize (close) the chat window
   */
  minimize() {
    if ((window as any).Tawk_API && (window as any).Tawk_API.minimize) {
      (window as any).Tawk_API.minimize();
    }
  }

  /**
   * Set visitor name and email (useful when user is logged in)
   */
  setVisitor(name: string, email: string) {
    if ((window as any).Tawk_API && (window as any).Tawk_API.setAttributes) {
      (window as any).Tawk_API.setAttributes(
        {
          name: name,
          email: email,
        },
        (error: any) => {
          if (error) {
            console.error('Error setting visitor info:', error);
          }
        }
      );
    }
  }
}
