import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './first-page.html',
  styleUrls: ['./first-page.css']
})
export class HomepageComponent implements OnInit, OnDestroy {
  isNavScrolled = false;

  features = [
    {
      icon: '🏡',
      title: 'Farm Management',
      description: 'Manage multiple farms from a single account with an intuitive farm dashboard.',
      badge: 'Core'
    },
    {
      icon: '🌾',
      title: 'Field Grid System',
      description: 'Visual grid-based fields — plant crops, track growth stages, and harvest with a click.',
      badge: 'Interactive'
    },
    {
      icon: '⚡',
      title: 'Real-time Alerts',
      description: 'Instant notifications for frost, heat, irrigation, disease risks and much more.',
      badge: 'Live'
    },
    {
      icon: '🌤️',
      title: 'Weather Forecast',
      description: 'Live weather widget on your farm page, so you can plan your activities with confidence.',
      badge: 'Open Meteo'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Charts for feedback stats, alert distribution, crop vulnerability, and water savings.',
      badge: 'Insights'
    },
    {
      icon: '🌱',
      title: 'Seeds Catalog',
      description: 'A big crop database powering an adaptive rule-based recommendation engine.',
      badge: 'Database'
    },
    {
      icon: '📬',
      title: 'Email Notifications',
      description: 'Automated email alerts for farm events, profile changes, and password resets.',
      badge: 'Automated'
    },
    {
      icon: '💬',
      title: 'Feedback System',
      description: 'Post-harvest feedback that trains the rule engine to personalize recommendations.',
      badge: 'Adaptive'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initScrollObserver();
  }

  ngOnDestroy(): void {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.isNavScrolled = window.scrollY > 60;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  scrollTo(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openDemo(): void {
    window.open('https://drive.google.com/file/d/1cfG_x4XYp9j8F1dizdWV9Mr_yhIkngml/view?usp=sharing', '_blank');
  }

  private initScrollObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        revealObserver.observe(el);
      });
    }, 100);
  }
}
