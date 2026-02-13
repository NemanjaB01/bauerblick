import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResponsiveScalerComponent } from './components/responsive-scaler/responsive-scaler';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ResponsiveScalerComponent],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'Bauerblick';
}


