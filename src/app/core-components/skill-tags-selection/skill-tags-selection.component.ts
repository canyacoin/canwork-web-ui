import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { take } from 'rxjs/operators'

export class SkillTag {
  tag: string
}

@Component({
  selector: 'skill-tags-selection',
  templateUrl: './skill-tags-selection.component.html',
})
export class SkillTagsSelectionComponent implements OnInit {
  @Input() initialTags: string[]
  @Input() minimumTags: number
  @Input() updatedTags: string[]
  @Output() tagsUpdated: EventEmitter<string> = new EventEmitter()
  @Output() tagsLoaded: EventEmitter<string[]> = new EventEmitter()

  popularSkillTags: string[] = []

  skillTagsList: string[] = []
  tagSelectionInvalid: number // 0 = validation, 1 = validation error with length 20, 2 = validation error with input, 3 = when duplicate
  noValidTag = false
  acceptedTags: string[] = []
  tagInput = ''

  constructor(private afs: AngularFirestore) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes.updatedTags) {
      this.acceptedTags =
        changes.updatedTags.currentValue === undefined
          ? []
          : changes.updatedTags.currentValue
      this.tagsUpdated.emit(this.acceptedTags.join(','))
    }
    if (
      !!changes.initialTags &&
      changes.initialTags.currentValue !== undefined
    ) {
      this.acceptedTags = changes.initialTags.currentValue
    }
  }

  ngOnInit() {
    this.popularSkillTags = [
      'UI/UX',
      'Website',
      'Web Dev',
      'Shopify',
      'Html',
      'Css',
    ]
    this.afs
      .collection<SkillTag>('skill-tags')
      .valueChanges()
      .pipe(take(1))
      .subscribe((tags: SkillTag[]) => {
        this.skillTagsList = tags.map((x) => x.tag)
        this.tagsLoaded.emit(this.skillTagsList)
      })
    this.acceptedTags = this.initialTags === undefined ? [] : this.initialTags
    this.tagsUpdated.emit(this.acceptedTags.join(','))
  }

  onBlurMethod() {
    if (this.acceptedTags.length == 0) this.noValidTag = true
  }
  onFocusMethod() {
    this.noValidTag = false
  }

  onTagEnter(inputtag?: string) {
    this.noValidTag = false
    let tag

    if (inputtag) {
      // click on popular tags
      tag = inputtag
    } else {
      tag = this.tagInput
    }

    tag = tag.replace(',', '').trim()
    if (tag === '') {
      this.tagSelectionInvalid = 2
      return false
    }
    const duplicate = this.acceptedTags.findIndex((x) => x === tag) > -1
    if (
      this.acceptedTags.length <= 20 &&
      !duplicate &&
      tag.length >= 2 &&
      tag.length <= 20
    ) {
      this.acceptedTags.push(tag)
      this.tagsUpdated.emit(this.acceptedTags.join(','))
    } else {
      if (duplicate) {
        this.tagSelectionInvalid = 3
      } else this.tagSelectionInvalid = 1
      return false
    }
    this.tagInput = ''
    this.tagSelectionInvalid = 0
    this.onDropDownTT()
    // console.log('this.tagSelectionInvalid', this.tagSelectionInvalid)
  }

  onTagChange() {
    let tag = this.tagInput
    tag = tag.replace(',', '').trim()
    const indexOfTag = this.skillTagsList.findIndex((x) => x === tag)
    const duplicate = this.acceptedTags.findIndex((x) => x === tag) > -1
    if (indexOfTag !== -1) {
      if (this.acceptedTags.length <= 20 && !duplicate) {
        this.acceptedTags.push(tag)
        this.tagsUpdated.emit(this.acceptedTags.join(','))
        this.tagInput = ''
      }
      if (duplicate) {
        this.tagInput = ''
      }
    }
    this.tagSelectionInvalid = 0
  }

  removeTag(tag: string) {
    const index = this.acceptedTags.indexOf(tag)
    this.acceptedTags.splice(index, 1)
    this.tagsUpdated.emit(this.acceptedTags.join(','))
  }

  onDropDownTT() {
    let tag = this.tagInput
    tag = tag.replace(',', '').trim()

    const tooltip = document.querySelector<any>('#tagInputTT')
    if (tooltip) {
      tooltip.innerText = 'Click to add: ' + tag

      if (tag !== '') {
        tooltip.setAttribute('data-show', '')
      } else {
        tooltip.removeAttribute('data-show')
      }
    }
    // Can click the tooltip to enter it for better UX on mobile
    // optionally the user can press 'enter' or 'comma' as usual
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      this.onTagEnter()
    }
  }
}
