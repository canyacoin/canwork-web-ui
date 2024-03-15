import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core'
import { FilterService } from 'app/shared/constants/search-page'
@Component({
  selector: 'search-filter',
  templateUrl: './filter.component.html',
})
export class FilterComponent implements OnInit {
  filterSection = FilterService
  locationForm: any[] = []
  @Input() locationFormSelected: string[] = []
  @Output() locationChange = new EventEmitter<string[]>() // two way binding to parent
  @Input() hourlyInput: string[] = []
  @Output() hourlyInputChange = new EventEmitter<string[]>() // two way binding to parent
  @Input() verifyForm: string[] = []
  @Output() verifyFormChange = new EventEmitter<string[]>() // two way binding to parent

  // skills
  @Input() skillsForm: string[] = []
  @Output() skillsFormChange = new EventEmitter<string[]>() // two way binding to parent
  tempSkillsForm: string[] = []
  skillsLength: number = 9 // how many skills to show at start

  ratingForm: number[] = []

  ngOnInit() {
    this.locationForm = [
      { full: 'Netherlands', abbr: 'NL' },
      { full: 'Italy', abbr: 'IT' },
      { full: 'Australia', abbr: 'AU' },
      { full: 'Nigeria', abbr: 'NG' },
      { full: 'France', abbr: 'FR' },
      { full: 'Germany', abbr: 'DE' },
      { full: 'United States', abbr: 'US' },
    ] // possible choices
    this.tempSkillsForm = this.filterSection.skills.slice(0, this.skillsLength)
  }

  getNumberAllFilters(): number {
    return (
      this.verifyForm.length +
      this.hourlyInput.length +
      this.locationFormSelected.length +
      this.skillsForm.length +
      this.ratingForm.length
    )
  }

  allClear() {
    this.verifyForm = []
    this.hourlyInput = []
    this.locationFormSelected = []
    this.skillsForm = []
    this.ratingForm = []

    this.hourlyInputChange.emit(this.hourlyInput) // notify parent and algolia handler
    this.verifyFormChange.emit(this.verifyForm) // notify parent and algolia handler
    this.locationChange.emit(this.locationFormSelected) // notify parent and algolia handler
    this.skillsFormChange.emit(this.skillsForm) // notify parent and algolia handler
    // todo add the other filters later
  }

  isLocationSelected(locationName: string) {
    return this.locationFormSelected.includes(locationName)
  }

  clickLocationTag(locationAbbr: string) {
    // update local state and ui
    if (locationAbbr) {
      if (!this.isLocationSelected(locationAbbr)) {
        this.locationFormSelected.push(locationAbbr) // select it
      } else {
        const index = this.locationFormSelected.findIndex(function (element) {
          return element === locationAbbr
        })
        this.locationFormSelected.splice(index, 1) // deselect id
      }
      this.locationChange.emit(this.locationFormSelected) // notify parent and algolia handler
    }
  }

  verifyClear() {
    this.verifyForm = []
    this.verifyFormChange.emit(this.verifyForm) // notify parent and algolia handler
  }

  /*delLocation(value: string) {
    this.locationForm = this.locationForm.filter((item) => item !== value)
  }*/

  locationClear() {
    this.locationFormSelected = []
    this.locationChange.emit(this.locationFormSelected) // notify parent and algolia handler
  }

  verifyClick(e) {
    //console.log(this.verifyForm);
    //['Verified'] or []
    this.verifyFormChange.emit(this.verifyForm) // notify parent and algolia handler
  }

  skillClick(e) {
    this.skillsFormChange.emit(this.skillsForm) // notify parent and algolia handler
  }

  hourlyClick(e) {
    this.hourlyInputChange.emit(this.hourlyInput) // notify parent and algolia handler
  }

  hourlyClear() {
    this.hourlyInput = []
    this.hourlyInputChange.emit(this.hourlyInput) // notify parent and algolia handler
  }

  skillsClear() {
    this.skillsForm = []
    this.skillsFormChange.emit(this.skillsForm) // notify parent and algolia handler
  }

  ratingClear() {
    this.ratingForm = []
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
