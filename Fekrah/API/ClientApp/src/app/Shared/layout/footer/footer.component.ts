import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  // Company information
  companyName: string = 'شركة قطع الغيار';
  currentYear: number = new Date().getFullYear();

  // Social media links
  socialLinks = {
    whatsapp: 'https://wa.me/201234567890',
    facebook: 'https://facebook.com/yourpage',
    twitter: 'https://twitter.com/yourhandle',
    instagram: 'https://instagram.com/yourprofile',
    youtube: 'https://youtube.com/yourchannel'
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Component initialization logic
  }

  /**
   * Handle navigation to router links
   * @param route - The route to navigate to
   */
  onLinkClick(route: string): void {
    // Analytics tracking for footer links
    this.trackFooterClick('footer-link', route);

    // Optional: Add custom navigation logic here
    console.log(`Navigating to: ${route}`);
  }

  /**
   * Handle social media link clicks
   * @param platform - The social media platform name
   */
  onSocialClick(platform: string): void {
    // Analytics tracking for social media clicks
    this.trackFooterClick('social-media', platform);

    console.log(`Opening ${platform} social media link`);
  }

  /**
   * Get router link with proper formatting
   * @param path - The path to navigate to
   * @returns Formatted router link
   */
  getRouterLink(path: string): string[] {
    return path.startsWith('/') ? [path] : ['/', path];
  }

  /**
   * Track footer interactions for analytics
   * @param category - The category of the click
   * @param action - The specific action performed
   */
  private trackFooterClick(category: string, action: string): void {
    // Implement your analytics tracking here
    // Example: Google Analytics, Adobe Analytics, etc.

    // Google Analytics 4 example:
    // gtag('event', 'footer_click', {
    //   event_category: category,
    //   event_label: action,
    //   custom_parameter: 'footer_interaction'
    // });

    console.log(`Analytics: ${category} - ${action}`);
  }

  /**
   * Handle scroll to top functionality
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Check if current route is active
   * @param route - The route to check
   * @returns Boolean indicating if route is active
   */
  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  /**
   * Handle newsletter subscription (if implemented)
   * @param email - User email for subscription
   */
  onNewsletterSubscribe(email: string): void {
    // Implement newsletter subscription logic
    console.log(`Newsletter subscription for: ${email}`);
    this.trackFooterClick('newsletter', 'subscribe');
  }

  /**
   * Handle contact form submission (if implemented)
   * @param formData - Contact form data
   */
  onContactSubmit(formData: any): void {
    // Implement contact form submission logic
    console.log('Contact form submitted:', formData);
    this.trackFooterClick('contact', 'form_submit');
  }

  /**
   * Get current language direction for RTL support
   * @returns Direction string ('rtl' or 'ltr')
   */
  getDirection(): string {
    // Implement language direction logic
    return 'rtl'; // Arabic is RTL
  }

  /**
   * Handle keyboard navigation for accessibility
   * @param event - Keyboard event
   * @param action - Action to perform
   */
  onKeyPress(event: KeyboardEvent, action: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      switch (action) {
        case 'scroll-top':
          this.scrollToTop();
          break;
        default:
          console.log(`Keyboard action: ${action}`);
      }
    }
  }
}
