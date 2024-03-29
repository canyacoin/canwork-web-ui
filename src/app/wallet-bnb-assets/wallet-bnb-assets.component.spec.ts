import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WalletBnbAssetsComponent } from './wallet-bnb-assets.component'

describe('WalletBnbAssetsComponent', () => {
  let component: WalletBnbAssetsComponent
  let fixture: ComponentFixture<WalletBnbAssetsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WalletBnbAssetsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletBnbAssetsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
