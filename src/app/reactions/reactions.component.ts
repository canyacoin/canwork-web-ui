import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';

import * as maxBy from 'lodash/maxBy';

@Component({
  selector: 'app-reactions',
  templateUrl: './reactions.component.html',
  styleUrls: ['./reactions.component.css']
})

export class ReactionsComponent implements OnInit, OnChanges {

  max: any = {};
  @Input() reactions: any = null;
  @Output() action: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for ( const propName of Object.keys(changes) ) {
      if (propName === 'reactions') {
        // const tmp = changes[propName].currentValue;
       this.setMax();
        break;
      }
    }
  }

  setMax() {
    this.max = {};
    if ( this.reactions !== null ) {
      this.reactions.map( (item) => {
        this.max[item.id] = maxBy(item.answers, 'value');
      });
      console.log('setMax', this.max);
    }
  }

  resetAnswers(index: number, rIndex: number) {
    for (let i = 0; i < this.reactions[index]['answers'].length; i++) {
      this.reactions[index]['answers'][i].active = 'false';
      localStorage.setItem(`${this.reactions[index].uid}${this.reactions[index]['answers'][i].answer}`, 'false');

      if ( this.reactions[index]['answers'][i]['value'] > 0 && i !== rIndex ) {
        this.reactions[index]['answers'][i]['value']--;
      }
    }
  }

  onAction(index: number, rIndex: number, response: any) {
    console.log('onAction - before', index, rIndex, response, this.reactions[index]['answers'][rIndex]['value']);

    this.resetAnswers(index, rIndex);
    if ( response.active === 'true' ) {
      response.active = 'false';
      localStorage.setItem(`${this.reactions[index].uid}${response.answer}`, 'false');

      if ( this.reactions[index]['answers'][rIndex]['value'] > 0 ) {
        this.reactions[index]['answers'][rIndex]['value']--;
      }

      if ( this.reactions[index].total > 0 ) {
        this.reactions[index].total--;
      }

    } else {
      response.active = 'true';
      localStorage.setItem(`${this.reactions[index].uid}${response.answer}`, 'true');
      this.reactions[index]['answers'][rIndex]['value']++;
      this.reactions[index].total++;
    }
    this.setMax();

    console.log('onAction - after', index, rIndex, response, this.reactions[index]['answers'][rIndex]['value']);

    this.action.emit( { reaction: this.reactions[index], response: this.reactions[index]['answers'][rIndex] } );
  }
}
