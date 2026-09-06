import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/models';

type RoleFilter = 'ALL' | 'STUDENT' | 'FACULTY' | 'ADMIN';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  loading = true;
  users: User[] = [];
  roleFilter: RoleFilter = 'ALL';
  roles: RoleFilter[] = ['ALL', 'STUDENT', 'FACULTY', 'ADMIN'];
  search = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().subscribe({
      next: (data) => { this.users = [...data].sort((a, b) => a.id - b.id); this.loading = false; },
      error: () => this.loading = false
    });
  }

  get filteredUsers() {
    return this.users.filter(u => {
      const roleMatch = this.roleFilter === 'ALL' || u.role === this.roleFilter;
      const searchMatch = !this.search || u.username.toLowerCase().includes(this.search.toLowerCase());
      return roleMatch && searchMatch;
    });
  }
}
