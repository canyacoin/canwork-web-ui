import { Component, OnInit } from '@angular/core'
import { FilterService } from 'app/shared/constants/search-page'
@Component({
  selector: 'search-filter',
  templateUrl: './filter.component.html',
})
export class FilterComponent implements OnInit {
  filterSection = FilterService
  verifyForm: string[] = []
  locationForm: string[] = []
  hourlyForm: string[] = []
  ratingForm: number[] = []
  // skills
  skillsForm: string[] = []
  tempSkillsForm: string[] = []
  skillsLength: number = 9

  ngOnInit() {
    this.locationForm = [
      'Netherlands',
      'Italy',
      'Australia',
      'Nigeria',
      'France',
      'Germany',
      'United States',
    ]
    this.tempSkillsForm = this.filterSection.skills.slice(0, 9)
  }

  getNumberAllFilters(): number {
    return (
      this.verifyForm.length +
      this.hourlyForm.length +
      this.locationForm.length +
      this.skillsForm.length +
      this.ratingForm.length
    )
  }

  allClear() {
    this.verifyForm = []
    this.hourlyForm = []
    this.locationForm = []
    this.skillsForm = []
    this.ratingForm = []
  }

  verifyClear() {
    this.verifyForm = []
  }

  delLocation(value: string) {
    this.locationForm = this.locationForm.filter((item) => item !== value)
  }

  LocationClear() {
    this.locationForm = []
  }

  hourlyClear() {
    this.hourlyForm = []
  }

  skillsClear() {
    this.skillsForm = []
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
