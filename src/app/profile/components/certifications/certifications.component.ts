import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { User } from '../../../core-classes/user';
import { Certification } from '../../../core-classes/certification';
@Component({
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.css']
})
export class CertificationsComponent implements OnInit {

  @Input() userModel: User;
  @Input() isMyProfile: boolean;
  @Input() notMyProfile: boolean;

  constructor(
  ) {
  }

  ngOnInit() {
  }

  onInputChange() {
    console.log('changed');
  }

  onDeleteCertification() {
    console.log('deleting');
  }

  getCertifications() {
    console.log('fetching certifications...');
  }

}
