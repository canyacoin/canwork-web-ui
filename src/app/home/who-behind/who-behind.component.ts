import { Component } from '@angular/core';
import { WhoBehindService } from 'app/shared/constants/home';

@Component({
  selector: 'who-behind',
  templateUrl: './who-behind.component.html'
})
export class WhoBehindComponent {
  whoBehindSection = WhoBehindService;
}