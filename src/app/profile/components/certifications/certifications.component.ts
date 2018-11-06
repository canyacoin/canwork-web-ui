import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../core-classes/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.css']
})
export class CertificationsComponent implements OnInit {

  @Input() userModel: User;
  @Input() isMyProfile: boolean;
  @Input() notMyProfile: boolean;
  uniInput = '';
  uniList: any;
  uniListSelection = new Array();
  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.getJSON().subscribe(data => {
      this.uniList = data;
      /*
      for (let i = 0; i < this.uniList.length; i++) {
        const name = this.uniList[i]['name'];
        console.log(name);
        this.uniListSelection.push(name);
      }
      */
    });
  }

  public getJSON(): Observable<any> {
    return this.http.get('../../assets/js/UniversityList.json');
  }
  onInputChange() {
    console.log('changed');
  }

}
