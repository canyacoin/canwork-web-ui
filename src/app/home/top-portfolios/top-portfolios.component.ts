import { Component } from '@angular/core'
import { TopPortfoliosService } from 'app/shared/constants/home-page'

@Component({
  selector: 'home-top-portfolios',
  templateUrl: './top-portfolios.component.html',
})
export class TopPortfoliosComponent {
  topPortfoliosSection = TopPortfoliosService
  portfolioClass =
    'rounded-[12px] select-none h-full hover:brightness-50 transition-all duration-300 cursor-pointer'
}
