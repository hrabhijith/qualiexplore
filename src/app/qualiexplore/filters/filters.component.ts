/**
 * Copyright 2020
 * University of Bremen, Faculty of Production Engineering, Badgasteiner Straße 1, 28359 Bremen, Germany.
 * In collaboration with BIBA - Bremer Institut für Produktion und Logistik GmbH, Bremen, Germany.
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit } from '@angular/core'
import { FiltersService } from './filters.service'
import { Router } from '@angular/router'
import { Filter } from './model/filter.model'
import { AuthService } from '../auth/auth.service'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  providers: [FiltersService],
})
export class FiltersComponent implements OnInit {
  filters: Filter[] = []
  selections: number[] = []
  private selectionsSet: Set<number> = new Set()
  constructor(
    private service: FiltersService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authService.autoLogin()
    // Get previously selected Filters and Selection Array
    const previousFilterSelections = sessionStorage.getItem('currentFilters')
    const previousSelectionsSet = sessionStorage.getItem('currentSelectionsSet')
    if (previousFilterSelections !== null && previousSelectionsSet !== null) {
      // if Previously interacted then use those values
      this.filters = JSON.parse(previousFilterSelections)
      this.selections = JSON.parse(previousSelectionsSet)
      this.selectionsSet = new Set<number>(this.selections)
    } else {
      // call the API
      this.showFilters()
    }
  }

  /**
   * API call to Filter Static JSON
   */
  async showFilters() {
    // this.service.getQuestions().then((data: any) => {
    //     this.filters = data.categories;
    // });

    let filtersObs: Observable<any>
    filtersObs = this.service.getQuestions()
    filtersObs.subscribe((data: any) => {
      this.filters = data.data.filters[0].categories
    })
  }

  /**
   * Add the Selection to a Set if checked/ Remove the Selection from a Set if unchecked
   * @param id number
   * @param event Event Trigger from HTML Input Element
   */
  changeCheck(id: number, event: any) {
    event.target.checked
      ? this.selectionsSet.add(id)
      : this.selectionsSet.delete(id)
    this.selections = Array.from(this.selectionsSet)
  }

  /**
   * Proceed to Step-2 : Factors
   * Store the present state of selected filters in sessionStorage
   */
  proceed() {
    // store the current filters to localStorage
    sessionStorage.setItem('currentFilters', JSON.stringify(this.filters))
    sessionStorage.setItem(
      'currentSelectionsSet',
      JSON.stringify(this.selections),
    )
    this.router.navigate(['qualiexplore/factors'], {
      queryParams: { ids: JSON.stringify(this.selections) },
    })
  }

  /**
   * Reset All Filters and previously stored Filters in `sessionStorage`
   */
  reset() {
    sessionStorage.clear()
    this.selections = []
    this.selectionsSet.clear()
    this.showFilters()
  }
}
