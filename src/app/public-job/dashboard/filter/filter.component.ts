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
export class FilterComponent implements OnInit, OnChanges {
  filterSection = FilterService
  @Input() verifyForm: string[] = []
  @Output() verifyFormChange = new EventEmitter<string[]>() // two way binding to parent

  // skills
  @Input() skillsForm: string[] = []
  @Output() skillsFormChange = new EventEmitter<string[]>() // two way binding to parent
  tempSkillsForm: string[] = []
  skillsLength: number = 9 // how many skills to show at start

  // categories
  @Input() categoriesForm: string[] = []
  @Output() categoriesFormChange = new EventEmitter<string[]>() // two way binding to parent

  @Input() ratingForm: number[] = []
  @Output() ratingChange = new EventEmitter<number[]>() // two way binding to parent

  @Input() experienceForm: number[] = []
  @Output() experienceFormChange = new EventEmitter<number[]>() // two way binding to parent

  @Input() fixedForm: number[] = []
  @Output() fixedFormChange = new EventEmitter<number[]>() // two way binding to parent

  @Input() hourlyInput: number[] = []
  @Output() hourlyInputChange = new EventEmitter<number[]>() // two way binding to parent

  hourlyFlag: boolean = false
  hourlymin_max: boolean = false
  min: number = undefined // minimum
  max: number = undefined // maximum

  fixedFlag: boolean = false

  // search location

  skillTagsList: string[] = []
  tagSelectionInvalid: number // 0 =-= validation, 1 = validation error with length 20, 2 = validation error with input, 3 = when duplicate
  noValidTag = false
  tagInput = ''
  @Input() locationInput: string[]
  @Output() LocationInputChange = new EventEmitter<string[]>() // two way binding to parent

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hourlyInput']) {
      if (this.hourlyInput.length === 0) {
        this.hourlyFlag = false
        this.hourlymin_max = false
        this.min = undefined
        this.max = undefined
      }
    }
    if (changes['fixedForm']) {
      if (this.fixedForm.length === 0) {
        this.fixedFlag = false
      }
    }
  }

  ngOnInit() {
    // this.tempSkillsForm = this.filterSection.skills.slice(0, this.skillsLength)
  }
  getNumberAllFilters(): number {
    return (
      this.verifyForm.length +
      this.skillsForm.length +
      this.ratingForm.length +
      this.experienceForm.length +
      this.fixedForm.length +
      this.categoriesForm.length +
      this.locationInput.length
    )
  }

  allClear() {
    this.verifyForm = []
    this.skillsForm = []
    this.ratingForm = []
    this.experienceForm = []
    this.hourlyInput = []
    this.categoriesForm = []
    this.locationInput = []
    this.fixedForm = []
    this.hourlyFlag = false
    this.fixedFlag = false

    this.verifyFormChange.emit(this.verifyForm)
    this.skillsFormChange.emit(this.skillsForm)
    this.ratingChange.emit(this.ratingForm)
    this.experienceFormChange.emit(this.experienceForm)
    this.fixedFormChange.emit(this.fixedForm)
    this.hourlyInputChange.emit(this.hourlyInput)
    this.categoriesFormChange.emit(this.categoriesForm)
    this.LocationInputChange.emit([])
  }
  verifyClear() {
    this.verifyForm = []
    this.verifyFormChange.emit(this.verifyForm) // notify parent and algolia handler
  }

  /*delLocation(value: string) {
    this.locationForm = this.locationForm.filter((item) => item !== value)
  }*/

  checkedItemskill(value: string) {
    return this.skillsForm.includes(value)
  }

  checkedItemCategory(value: string) {
    return this.categoriesForm.includes(value)
  }
  checkedItemFixed(value: number) {
    return this.fixedForm.includes(value)
  }

  verifyClick(e) {
    //console.log(this.verifyForm);
    //['Verified'] or []
    this.verifyFormChange.emit(this.verifyForm)
  }

  skillClick(e) {
    this.skillsFormChange.emit(this.skillsForm)
  }

  categoryClick(e) {
    this.categoriesFormChange.emit(this.categoriesForm)
  }

  fixedClick(e) {
    if (this.fixedFlag) {
      this.fixedForm = [-1]
    } else {
      this.fixedForm = []
    }
    this.fixedFormChange.emit(this.fixedForm)
  }

  fixedItemClick(e) {
    if (this.fixedForm.includes(-1)) {
      if (this.fixedForm.length === 1) {
        // there is no items but there is Fixed Flag, then we should set that flag as false
        this.fixedForm = []
        this.fixedFlag = false
      }
    } else {
      if (this.fixedForm.length > 0) {
        // there is items but there isn't Fixed Flag, then we should set that flag as true
        this.fixedFlag = true
        this.fixedForm.unshift(-1)
      }
    }
    // console.log('this.fixedForm', this.fixedForm)
    this.fixedFormChange.emit(this.fixedForm)
  }

  hourlyTopClick(e) {
    // console.log('hourly top click', this.hourlyFlag)
    if (this.hourlyFlag) {
      this.hourlyInput = [1, 300]
    } else {
      this.hourlymin_max = false
      this.min = undefined
      this.max = undefined
      this.hourlyInput = []
    }
    this.hourlyInputChange.emit(this.hourlyInput)
  }

  hourlyBottomClick(e) {
    if (this.hourlymin_max) {
      this.hourlyFlag = true
      this.min = 1
      this.max = 300
      this.hourlyInput = [1, 300]
    } else {
      this.hourlyFlag = false
      this.min = undefined
      this.max = undefined
      this.hourlyInput = []
    }
    this.hourlyInputChange.emit(this.hourlyInput)
  }
  onSearchInputChange() {
    this.hourlyFlag = true
    this.hourlymin_max = true
    this.hourlyInput = [Number(this.min), Number(this.max)]

    this.hourlyInputChange.emit(this.hourlyInput) // notify parent and algolia handler
  }

  experienceClick() {
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

  LocationClear() {
    this.locationInput = []
    this.LocationInputChange.emit([])
  }
  skillsClear() {
    this.skillsForm = []
    this.skillsFormChange.emit(this.skillsForm)
  }

  categoryClear() {
    this.categoriesForm = []
    this.categoriesFormChange.emit(this.categoriesForm)
  }
  ratingClear() {
    this.ratingForm = []
    this.ratingChange.emit(this.ratingForm)
  }

  PriceClear() {
    this.hourlyFlag = false
    this.hourlyInputChange.emit([])

    this.fixedFlag = false
    this.fixedForm = []
    this.fixedFormChange.emit([])
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

  // location search

  onBlurMethod() {
    if (this.locationInput.length == 0) this.noValidTag = true
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
    const duplicate = this.locationInput.findIndex((x) => x === tag) > -1
    if (!duplicate) {
      this.locationInput.push(tag)
      this.LocationInputChange.emit(this.locationInput)
    } else {
      if (duplicate) {
        this.tagSelectionInvalid = 3
      } else this.tagSelectionInvalid = 1
      return false
    }
    this.tagInput = ''
    this.tagSelectionInvalid = 0
    this.onDropDownTT()
  }

  onTagChange() {
    let tag = this.tagInput
    tag = tag.replace(',', '').trim()
    const indexOfTag = this.skillTagsList.findIndex((x) => x === tag)
    const duplicate = this.locationInput.findIndex((x) => x === tag) > -1
    if (indexOfTag !== -1) {
      if (!duplicate) {
        this.locationInput.push(tag)
        this.LocationInputChange.emit(this.locationInput)
        this.tagInput = ''
      }
      if (duplicate) {
        this.tagInput = ''
      }
    }
    this.tagSelectionInvalid = 0
  }

  removeTag(tag: string) {
    const index = this.locationInput.indexOf(tag)
    this.locationInput.splice(index, 1)
    this.LocationInputChange.emit(this.locationInput)
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
  }
}
