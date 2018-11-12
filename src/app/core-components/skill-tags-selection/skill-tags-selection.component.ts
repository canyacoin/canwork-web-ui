import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { take } from 'rxjs/operators';

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
  @Input() minimumTags: number;
  @Output() tagsUpdated: EventEmitter<string> = new EventEmitter();

  skillTagsList: string[] = [];
  tagSelectionInvalid = false;
  acceptedTags: string[] = [];
  tagInput = '';

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    this.afs.collection<SkillTag>('skill-tags').valueChanges().pipe(take(1)).subscribe((tags: SkillTag[]) => {
      this.skillTagsList = tags.map(x => x.tag);
    });
    this.acceptedTags = this.initialTags === undefined ? [] : this.initialTags;
    this.tagsUpdated.emit(this.acceptedTags.join(','));
  }

  onTagEnter() {
    const tag = this.tagInput;
    if (tag === '') {
      this.tagSelectionInvalid = true;
      return false;
    }
    const duplicate = this.acceptedTags.findIndex(x => x === tag) > -1;
    if (this.acceptedTags.length <= 5 && !duplicate && tag.length >= 2 && tag.length <= 14) {
      this.acceptedTags.push(tag);
      this.tagsUpdated.emit(this.acceptedTags.join(','));
    } else {
      this.tagSelectionInvalid = true;
      return false;
    }
<<<<<<< HEAD

    this.tagInput = '';
    this.tagSelectionInvalid = false;
=======
    this.tagInput = ''
    this.tagSelectionInvalid = false
>>>>>>> public job services WIP, some fixes for duplicate tags
  }

  onTagChange() {
    const tag = this.tagInput;
    const indexOfTag = this.skillTagsList.findIndex(x => x === tag);
    const duplicate = (this.acceptedTags.findIndex(x => x === tag) > -1);
    if (indexOfTag !== -1) {
      if (this.acceptedTags.length <= 5 && !duplicate) {
        this.acceptedTags.push(tag);
        this.tagsUpdated.emit(this.acceptedTags.join(','));
        this.tagInput = '';
      }
      if (duplicate) {
        this.tagInput = '';
      }
    }
    this.tagSelectionInvalid = false;
  }

  removeTag(tag: string) {
    const index = this.acceptedTags.indexOf(tag);
    this.acceptedTags.splice(index, 1);
    this.tagsUpdated.emit(this.acceptedTags.join(','));
  }
}
