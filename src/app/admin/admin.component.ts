import { Component } from '@angular/core'
import { AuthService } from '@service/auth.service'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  currentUser: any

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    try {
      this.currentUser = await this.authService.getCurrentUser()
    } catch (e) {}
  }
}
