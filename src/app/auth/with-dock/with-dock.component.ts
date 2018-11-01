import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DockIoService } from '@service/dock-io.service';
import { AuthService } from '@service/auth.service';

@Component({
  selector: 'app-with-dock',
  templateUrl: './with-dock.component.html',
  styleUrls: ['./with-dock.component.scss']
})
export class WithDockComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private dockIoService: DockIoService,
    private authService: AuthService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(({ code }) => {
      this.init(code)
    })
  }

  async init(code: string) {
    const user = await this.authService.getCurrentUser()
    this.dockIoService.callAuthenticationService(code, user.address)
  }
}
