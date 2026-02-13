import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-responsive-scaler',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Rotate Phone Overlay (portrait on small devices) -->
    <div class="rotate-overlay" *ngIf="showRotateBanner">
      <div class="rotate-content">
        <div class="rotate-phone-icon">
          <div class="phone-body">
            <div class="phone-screen"></div>
          </div>
          <div class="rotate-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </div>
        </div>
        <h2>Rotate Your Device</h2>
        <p>Bauerblick works best in landscape mode.<br>Please rotate your phone for the best experience.</p>
        <button class="rotate-dismiss" (click)="dismissRotate()">
          Continue anyway
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ── Rotate Overlay ── */
    .rotate-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: linear-gradient(135deg, #2d5a18 0%, #1a3a0a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .rotate-content {
      color: #fff;
      max-width: 320px;
    }

    .rotate-content h2 {
      font-family: 'Fraunces', 'Georgia', serif;
      font-size: 1.6rem;
      font-weight: 800;
      margin-bottom: 0.8rem;
      color: #f5a623;
    }

    .rotate-content p {
      font-size: 0.95rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.75);
      margin-bottom: 2rem;
    }

    /* Phone icon with rotation animation */
    .rotate-phone-icon {
      position: relative;
      width: 80px;
      height: 120px;
      margin: 0 auto 2rem;
      animation: rotateHint 2.5s ease-in-out infinite;
    }

    .phone-body {
      width: 60px;
      height: 100px;
      border: 3px solid rgba(255, 255, 255, 0.6);
      border-radius: 10px;
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.05);
    }

    .phone-screen {
      position: absolute;
      inset: 8px 5px 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    .phone-body::after {
      content: '';
      position: absolute;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 3px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 2px;
    }

    .rotate-arrow {
      position: absolute;
      bottom: -5px;
      right: -10px;
      width: 28px;
      height: 28px;
      color: #f5a623;
    }

    @keyframes rotateHint {
      0%, 30% { transform: rotate(0deg); }
      50%, 80% { transform: rotate(-90deg); }
      100% { transform: rotate(0deg); }
    }

    .rotate-dismiss {
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.25);
      color: rgba(255, 255, 255, 0.6);
      padding: 0.6rem 1.5rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.25s;
    }

    .rotate-dismiss:hover {
      border-color: rgba(255, 255, 255, 0.5);
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }
  `]
})
export class ResponsiveScalerComponent implements OnInit, OnDestroy {
  showRotateBanner = false;
  private dismissed = false;
  private routerSub?: Subscription;

  // The design width your app was built for
  private readonly DESIGN_WIDTH = 1440;
  // Minimum scale to prevent things getting too tiny
  private readonly MIN_SCALE = 0.55;
  // Below this width, we consider it a phone
  private readonly PHONE_BREAKPOINT = 768;

  // Routes that should NOT be scaled (landing page + auth pages)
  // IMPORTANT: /home is the dashboard and SHOULD be scaled
  private readonly EXCLUDED_ROUTES = [
    '/',
    '/landing-page',
    '/first-page',
    '/login',
    '/signup',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/profile',

  ];

  private styleElement?: HTMLStyleElement;
  private isExcludedRoute = false;

  private injectGlobalStyles(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      /* Global fixes for zoom scaling */
      html, body {
        overflow-x: hidden !important;
        max-width: 100% !important;
        min-height: 100vh !important;
        background-image: url('/assets/images/background.png') !important;
        background-size: cover !important;
        background-position: center !important;
        background-attachment: scroll !important;
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inject global styles to prevent white sides when zoomed
    this.injectGlobalStyles();

    // Watch route changes to toggle scaling
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects || e.url;
        this.isExcludedRoute = this.EXCLUDED_ROUTES.some(
          route => url === route || url.startsWith(route + '?')
        );
        this.applyScaling();
        this.checkOrientation();
      });

    // Initial check
    this.isExcludedRoute = this.EXCLUDED_ROUTES.some(
      route => this.router.url === route || this.router.url.startsWith(route + '?')
    );
    this.applyScaling();
    this.checkOrientation();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    document.documentElement.style.removeProperty('zoom');
    this.styleElement?.remove();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.applyScaling();
    this.checkOrientation();
  }

  @HostListener('window:orientationchange')
  onOrientationChange(): void {
    setTimeout(() => this.checkOrientation(), 200);
  }

  dismissRotate(): void {
    this.dismissed = true;
    this.showRotateBanner = false;
  }

  private applyScaling(): void {
    if (this.isExcludedRoute) {
      // Excluded pages handle their own responsiveness
      document.documentElement.style.removeProperty('zoom');
      return;
    }

    const viewportWidth = window.innerWidth;

    if (viewportWidth >= this.DESIGN_WIDTH) {
      // Full size, no scaling needed
      document.documentElement.style.removeProperty('zoom');
    } else {
      // Scale down proportionally
      const scale = Math.max(viewportWidth / this.DESIGN_WIDTH, this.MIN_SCALE);
      document.documentElement.style.zoom = `${scale}`;
    }
  }

  private checkOrientation(): void {
    if (this.dismissed) return;

    const isPhone = window.innerWidth <= this.PHONE_BREAKPOINT
      || (window.screen?.width <= this.PHONE_BREAKPOINT);
    const isPortrait = window.innerHeight > window.innerWidth;

    this.showRotateBanner = isPhone && isPortrait && !this.isExcludedRoute;
  }
}
