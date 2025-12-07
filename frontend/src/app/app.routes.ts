import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import {AuthGuard} from './guard/auth-guard';
import {NoAuthGuard} from './guard/no-auth-guard';
import {HomeComponent} from './components/home/home';
import {NewFarmComponent} from './components/new-farm-component/new-farm-component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [NoAuthGuard]},
  { path: 'signup', component: Signup, canActivate: [NoAuthGuard]},
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  { path: 'new-farm', component: NewFarmComponent }
];
