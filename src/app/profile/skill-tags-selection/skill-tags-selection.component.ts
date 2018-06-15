import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

export class SkillTag {
  tag: string;
}

@Component({
  selector: 'app-skill-tags-selection',
  templateUrl: './skill-tags-selection.component.html',
  styleUrls: ['./skill-tags-selection.component.css']
})
export class SkillTagsSelectionComponent implements OnInit {

  @Input() initialTags: string[];
  @Output() tagsUpdated: EventEmitter<string> = new EventEmitter();

  skillTagsList: string[] = [];
  tagSelectionInvalid = false;
  acceptedTags: string[] = [];
  tagInput = '';

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    this.afs.collection<SkillTag>('skill-tags').valueChanges().take(1).subscribe((tags: SkillTag[]) => {
      this.skillTagsList = tags.map(x => x.tag);
    });
    this.acceptedTags = this.initialTags;
    this.tagsUpdated.emit(this.acceptedTags.join(','));
  }

  onTagEnter() {
    const tag = this.tagInput;
    const indexOfTag = this.skillTagsList.findIndex(x => x === tag);
    if (indexOfTag !== -1) {
      if (!this.acceptedTags.includes(tag)) {
        if (this.acceptedTags.length <= 5) {
          this.acceptedTags.push(tag);
          this.tagsUpdated.emit(this.acceptedTags.join(','));
        } else {
          this.tagSelectionInvalid = true;
          return;
        }
      }
      this.tagInput = '';
    } else if (tag !== '') {
      this.tagSelectionInvalid = true;
      return;
    }
    this.tagSelectionInvalid = false;
  }

  removeTag(tag: string) {
    const index = this.acceptedTags.indexOf(tag);
    this.acceptedTags.splice(index, 1);
    this.tagsUpdated.emit(this.acceptedTags.join(','));
  }
}
