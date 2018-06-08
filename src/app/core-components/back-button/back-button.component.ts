import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.css']
})
export class BackButtonComponent {

  constructor(private router: Router, private location: Location) { }


  goBack() {
    if ((<any>window).history.length > 0) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }
}
