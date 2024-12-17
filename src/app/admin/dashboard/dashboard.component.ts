import { Component } from '@angular/core'
import { AuthService } from '@service/auth.service'
import { User } from '@class/user'
import { Router } from '@angular/router'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  currentUser: User

  constructor(private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    // check also here
    try {
      this.currentUser = await this.authService.getCurrentUser()
    } catch (e) {}
    const isAdmin = this.currentUser?.isAdmin // configured into backend

    if (!isAdmin) this.router.navigate(['/home'])
  }
}
