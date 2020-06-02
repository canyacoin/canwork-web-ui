import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core'
import { AngularFirestore } from 'angularfire2/firestore'
import { take } from 'rxjs/operators'

export class SkillTag {
  tag: string
}

@Component({
  selector: 'app-skill-tags-selection',
  templateUrl: './skill-tags-selection.component.html',
  styleUrls: ['./skill-tags-selection.component.css'],
})
export class SkillTagsSelectionComponent implements OnInit {
  @Input() initialTags: string[]
  @Input() minimumTags: number
  @Input() updatedTags: string[];
  @Output() tagsUpdated: EventEmitter<string> = new EventEmitter()
  @Output() tagsLoaded: EventEmitter<string[]> = new EventEmitter()

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes.updatedTags) {
      this.acceptedTags = changes.updatedTags.currentValue === undefined ? [] : changes.updatedTags.currentValue
      this.tagsUpdated.emit(this.acceptedTags.join(','))
    }
  }

  skillTagsList: string[] = []
  tagSelectionInvalid = false
  noValidTag = false
  acceptedTags: string[] = []
  tagInput = ''

  constructor(private afs: AngularFirestore) {}

  ngOnInit() {
    this.afs
      .collection<SkillTag>('skill-tags')
      .valueChanges()
      .pipe(take(1))
      .subscribe((tags: SkillTag[]) => {
        this.skillTagsList = tags.map(x => x.tag)
        this.tagsLoaded.emit(this.skillTagsList)
      })
    this.acceptedTags = this.initialTags === undefined ? [] : this.initialTags
    this.tagsUpdated.emit(this.acceptedTags.join(','))
  }

  onBlurMethod() {
    if (this.acceptedTags.length == 0) this.noValidTag = true;
  }
  onFocusMethod() {
    this.noValidTag = false;
  }  

  onTagEnter() {
    this.noValidTag = false;
    const tag = this.tagInput
    if (tag === '') {
      this.tagSelectionInvalid = true
      return false
    }
    const duplicate = this.acceptedTags.findIndex(x => x === tag) > -1
    if (
      this.acceptedTags.length <= 5 &&
      !duplicate &&
      tag.length >= 2 &&
      tag.length <= 14
    ) {
      this.acceptedTags.push(tag)
      this.tagsUpdated.emit(this.acceptedTags.join(','))
    } else {
      this.tagSelectionInvalid = true
      return false
    }
    this.tagInput = ''
    this.tagSelectionInvalid = false
  }

  onTagChange() {
    const tag = this.tagInput
    const indexOfTag = this.skillTagsList.findIndex(x => x === tag)
    const duplicate = this.acceptedTags.findIndex(x => x === tag) > -1
    if (indexOfTag !== -1) {
      if (this.acceptedTags.length <= 5 && !duplicate) {
        this.acceptedTags.push(tag)
        this.tagsUpdated.emit(this.acceptedTags.join(','))
        this.tagInput = ''
      }
      if (duplicate) {
        this.tagInput = ''
      }
    }
    this.tagSelectionInvalid = false
  }

  removeTag(tag: string) {
    const index = this.acceptedTags.indexOf(tag)
    this.acceptedTags.splice(index, 1)
    this.tagsUpdated.emit(this.acceptedTags.join(','))

  }
}
