import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';

interface NavLink { path: string; icon: string; label: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule,
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  role = localStorage.getItem('role');
  username = localStorage.getItem('username');

  // Below Bootstrap's lg breakpoint (phones + portrait/landscape tablets) the
  // sidenav becomes a collapsible overlay drawer instead of a pinned column.
  isHandset$: Observable<boolean> = this.breakpointObserver.observe('(max-width: 991.98px)').pipe(
    map((result) => result.matches),
    shareReplay(1)
  );

  studentLinks: NavLink[] = [
    { path: '/student/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/student/requests', icon: 'list', label: 'My Requests' },
    { path: '/student/new-request', icon: 'add_circle', label: 'New Request' },
  ];
  adminLinks: NavLink[] = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/requests', icon: 'pending_actions', label: 'Pending Requests' },
    { path: '/admin/users', icon: 'people', label: 'Users' },
    { path: '/admin/register-user', icon: 'person_add', label: 'Register User' },
    { path: '/admin/audit-logs', icon: 'history', label: 'Audit Logs' },
  ];
  get links(): NavLink[] {
    if (this.role === 'ADMIN') return this.adminLinks;
    return this.studentLinks;
  }

  constructor(private auth: AuthService, private breakpointObserver: BreakpointObserver) {}

  logout() { this.auth.logout(); }
}
