import { Component, OnInit, Input, EventEmitter, Output,SimpleChanges, OnChanges } from '@angular/core'
import { FilterService } from 'app/shared/constants/public-job-dashboard-page'
@Component({
  selector: 'dashboard-filter',
  templateUrl: './filter.component.html',
})
export class FilterComponent implements OnInit, OnChanges {
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

  @Input() fixedForm: number[] = []
  @Output() fixedFormChange = new EventEmitter<number[]>() // two way binding to parent

  @Input() hourlyInput: number[] = []
  @Output() hourlyInputChange = new EventEmitter<number[]>() // two way binding to parent

  hourly: boolean[] = [false]
  hourlymin_max: boolean[] = [false]
  min: number = undefined // minimum
  max: number  = undefined// maximum

  fixedflag: boolean[] = [false]
  ngOnInit() {
    this.tempSkillsForm = this.filterSection.skills.slice(0, this.skillsLength)
  }
  ngOnChanges(changes: SimpleChanges) {
    // check Hourly
    try {
      if(changes.hourlyInput.currentValue.length == 0) {
        this.hourly = [false]
        this.hourlymin_max = [false]
        this.min = undefined
        this.max = undefined
      }
    } catch (error) {
      
    }


    // check Flag 
    try {
      if(changes.fixedForm.currentValue.length == 0) {
        this.fixedflag = [false]
      }
    } catch (error) {
      
    }


  }
  getNumberAllFilters(): number {
    return (
      this.verifyForm.length +
      this.skillsForm.length +
      this.ratingForm.length +
      this.experienceForm.length +
      this.fixedForm.length
    )
  }

  allClear() {
    this.verifyForm = []
    this.skillsForm = []
    this.ratingForm = []
    this.experienceForm = []
    this.hourlyInput = []

    this.verifyFormChange.emit(this.verifyForm)
    this.skillsFormChange.emit(this.skillsForm)
    this.ratingChange.emit(this.ratingForm)
    this.experienceFormChange.emit(this.experienceForm)
    this.fixedFormChange.emit(this.fixedForm)
    this.hourlyInputChange.emit(this.hourlyInput)
  }
  verifyClear() {
    this.verifyForm = []
    this.verifyFormChange.emit(this.verifyForm) // notify parent and algolia handler
  }

  /*delLocation(value: string) {
    this.locationForm = this.locationForm.filter((item) => item !== value)
  }*/

  checkedItemskill(value: string) {
    if (this.skillsForm.includes(value)) {
      return true
    } else {
      return false
    }
  }
  checkedItemFixed(value: number) {
    if (this.fixedForm.includes(value)) {
      return true
    } else {
      return false
    }
  }
  verifyClick(e) {
    //console.log(this.verifyForm);
    //['Verified'] or []
    this.verifyFormChange.emit(this.verifyForm)
  }

  skillClick(e) {
    this.skillsFormChange.emit(this.skillsForm)
  }

  fixedClick(e) {
    if (!this.fixedForm.includes(-1)) {
      this.fixedForm.unshift(-1)
      if (!this.fixedflag.includes(true)) {
        this.fixedflag = [true]
      }
    } else if ((this.fixedflag.length == 0 || !this.fixedflag.includes(true))&& this.fixedForm.includes(-1)) {
      this.PriceClear()
    }
    this.fixedFormChange.emit(this.fixedForm)
  }

  hourlyTopClick(e) {
    if (this.hourly.length == 2) {
      this.hourlyInput = [0, 300]
    } else {
      this.min = undefined
      this.max = undefined
      this.hourlyInput = []
      this.hourlymin_max = [false]
    }

    this.hourlyInputChange.emit(this.hourlyInput)
  }

  hourlyBottomClick(e) {
    if (this.hourlymin_max.length == 2) {
      this.hourly = [true]
      this.hourlyInput = [Number(this.min), Number(this.max)]
    } else {
      this.min = undefined
      this.max = undefined
      this.hourlyInput = [0, 300]
    }
    this.hourlyInputChange.emit(this.hourlyInput)
  }
  onSearchInputChange() {
   
    this.hourly = [true]
    this.hourlymin_max = [true]
    this.hourlyInput = [Number(this.min), Number(this.max)]

    this.hourlyInputChange.emit(this.hourlyInput) // notify parent and algolia handler
  }

  experienceClick(e) {
    this.experienceFormChange.emit(this.experienceForm)
  }
  ratingClick(item) {
    // if (this.ratingForm.length > 0) this.ratingForm = [item]
    /*
    force only max one rating at time for now, due to algolia limitations:
    
    filters: filter (X AND Y) OR Z is not allowed, only (X OR Y) AND Z is allowed
    https://github.com/algolia/algoliasearch-client-php/issues/385
    */
    this.ratingChange.emit(this.ratingForm)
  }

  skillsClear() {
    this.skillsForm = []
    this.skillsFormChange.emit(this.skillsForm)
  }

  ratingClear() {
    this.ratingForm = []
    this.ratingChange.emit(this.ratingForm)
  }

  PriceClear() {
    this.fixedForm = []
    this.fixedFormChange.emit([])
    this.hourly = []
    this.hourlyInputChange.emit([])  
  }

  experienceClear() {
    this.experienceForm = []
    this.experienceFormChange.emit([])
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
