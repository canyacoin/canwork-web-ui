import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WalletInstallComponent } from './wallet-install.component'

describe('WalletInstallComponent', () => {
  let component: WalletInstallComponent
  let fixture: ComponentFixture<WalletInstallComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WalletInstallComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletInstallComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
