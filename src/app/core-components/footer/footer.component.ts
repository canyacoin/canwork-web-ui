import { Component, OnInit } from '@angular/core';

declare var createCustomFooter: any;
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
    
    constructor() { }

    ngOnInit() {
        var footerUrls = [
        {name:"FAQ", url:"faq"}, 
        ];
        createCustomFooter(footerUrls); 
    }
 
}
