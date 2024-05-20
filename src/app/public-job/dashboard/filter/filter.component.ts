import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  SimpleChanges,
  OnChanges,
} from '@angular/core'
import { FilterService } from 'app/shared/constants/public-job-dashboard-page'
@Component({
  selector: 'dashboard-filter',
  templateUrl: './filter.component.html',
})
export class FilterComponent implements OnInit,OnChanges {
  filterSection = FilterService
  @Input() verifyForm: string[] = []
  @Output() verifyFormChange = new EventEmitter<string[]>() // two way binding to parent

  // skills
  @Input() skillsForm: string[] = []
  @Output() skillsFormChange = new EventEmitter<string[]>() // two way binding to parent
  tempSkillsForm: string[] = []
  skillsLength: number = 9 // how many skills to show at start

  @Input() ratingForm: number[] = []
  @Output() ratingChange = new EventEmitter<number[]>() // two way binding to parent

  @Input() experienceForm: number[] = []
  @Output() experienceFormChange = new EventEmitter<number[]>() // two way binding to parent
  ngOnInit() {
    this.tempSkillsForm = this.filterSection.skills.slice(0, this.skillsLength)
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('skillsForm', this.skillsForm)
  }
 
  getNumberAllFilters(): number {
    return (
      this.verifyForm.length +
      this.skillsForm.length +
      this.ratingForm.length +
      this.experienceForm.length
    )
  }

  allClear() {
    this.verifyForm = []
    this.skillsForm = []
    this.ratingForm = []
    this.experienceForm = []

    this.verifyFormChange.emit(this.verifyForm) // notify parent and algolia handler
    this.skillsFormChange.emit(this.skillsForm) // notify parent and algolia handler
    this.ratingChange.emit(this.ratingForm) // notify parent and algolia handler
    this.experienceFormChange.emit(this.experienceForm) // notify parent and algolia handler
  }
  verifyClear() {
    this.verifyForm = []
    this.verifyFormChange.emit(this.verifyForm) // notify parent and algolia handler
  }

  /*delLocation(value: string) {
    this.locationForm = this.locationForm.filter((item) => item !== value)
  }*/

  checkedItem(value: string) {
    if(this.skillsForm.includes(value)) {
      return true
    } else {
      return false
    }
  }
  verifyClick(e) {
    //console.log(this.verifyForm);
    //['Verified'] or []
    this.verifyFormChange.emit(this.verifyForm) // notify parent and algolia handler
  }

  skillClick(e) {
    this.skillsFormChange.emit(this.skillsForm) // notify parent and algolia handler
  }

  experienceClick(e) {
    this.experienceFormChange.emit(this.experienceForm) // notify parent and algolia handler
  }
  ratingClick(item) {
    if (this.ratingForm.length > 0) this.ratingForm = [item]
    /*
    force only max one rating at time for now, due to algolia limitations:
    
    filters: filter (X AND Y) OR Z is not allowed, only (X OR Y) AND Z is allowed
    https://github.com/algolia/algoliasearch-client-php/issues/385
    */
    this.ratingChange.emit(this.ratingForm) // notify parent and algolia handler
  }

  skillsClear() {
    this.skillsForm = []
    this.skillsFormChange.emit(this.skillsForm) // notify parent and algolia handler
  }

  ratingClear() {
    this.ratingForm = []
    this.ratingChange.emit(this.ratingForm) // notify parent and algolia handler
  }

  experienceClear() {
    this.experienceForm = []
    this.experienceFormChange.emit([]) // notify parent and algolia handler
  }
  seeMoreClick() {
    if (this.skillsLength < this.filterSection.skills.length) {
      this.skillsLength = this.filterSection.skills.length
    } else {
      this.skillsLength = 9
    }
    this.tempSkillsForm = this.filterSection.skills.slice(0, this.skillsLength)
  }
}
