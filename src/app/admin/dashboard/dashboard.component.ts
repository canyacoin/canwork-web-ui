import { Component, OnDestroy, OnInit } from '@angular/core'
import { AuthService } from '@service/auth.service'
import { User } from '@class/user'
import { UserService } from '@service/user.service'
import { environment } from '@env/environment'
import { saveAs } from 'file-saver'
const algoliasearch = require('algoliasearch')

  
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit, OnDestroy {
  
  pageLoaded = false
  currentUser: User
  private algoliaSearch
  private algoliaIndex
  algoIndex = environment.algolia.indexName
  algoId = environment.algolia.appId
  algoKey = environment.algolia.apiKey
  isSending = false
  error = false
  algoliaHits = {}
  isAdminIntoDb = false

  constructor(
    private authService: AuthService,
    private userService: UserService      
  ) {
    this.algoliaSearch = algoliasearch(this.algoId, this.algoKey)
    this.algoliaIndex = this.algoliaSearch.initIndex(this.algoIndex)    

  }

  async ngOnInit() {
    this.authService.currentUser$.subscribe(
      async (user: User) => {
        if (this.currentUser !== user) {
          this.pageLoaded = true
          this.currentUser = user // will use for the feature: makeMeAdmin
          this.isAdminIntoDb = this.authService.isAdminIntoDb()
        }
      }
    )    
   
  }
  
  setAdminIntoDb(newStatus: boolean) {
    this.isSending = true    
    this.isAdminIntoDb = newStatus
    this.currentUser["isAdmin"] = this.isAdminIntoDb
    this.userService.saveUser(this.currentUser)
    this.authService.setUser(this.currentUser)
    this.isSending = false              
  }
  
  downloadFile(data: any, fileName: String) {
      const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
      const header = Object.keys(data[0]);
      let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(header.join(','));
      let csvArray = csv.join('\r\n');

      var blob = new Blob([csvArray], {type: 'text/csv' })
      saveAs(blob, fileName);
  }  
  
  extractProvidersEthNoBnbWithFirestore() {
    this.isSending = true


    this.userService.getUsersWithEthAddress().then(result => {
      /*
      we don't have email here
      filter only results with type Provider and no bnbAddress
      (we cannot do it from firestore cause we don't have the compound index)
      */
      let filtered = result.filter((row:any) => {
        if (row.type != 'Provider') return false
        return (!row.hasOwnProperty('bnbAddress'))
      })
      let selected = filtered.map((row:any) => {
        return {
          address: row.address|| '',
          bio: row.bio|| '',
          category: row.category|| '',
          description: row.description || '',
          ethAddress: row.ethAddress|| '',
          bnbAddress: row.bnbAddress|| '',
          name: row.name|| '',
          slug: row.slug|| '',
          timezone: row.timezone|| '',
          title: row.title|| '',
          type: row.type|| '',
          verified: row.verified|| false,          
        }
        
      })
      this.downloadFile(selected, "ProvidersEthNoBnbWithFirestore.csv")
      this.isSending = false

    })     
    
  }
  
  
  
  
  extractProvidersEthNoBnbWithAlgoliaFinal() {
    //filter only results with type Provider and no bnbAddress
    let result = []
    let hitsHash = this.algoliaHits
    Object.keys(hitsHash).forEach(function (page) {
      hitsHash[page].hits.forEach((item) => {
        result.push(item)
      })
    });
    let filtered = result.filter((row:any) => {
      if (row.type != 'Provider') return false
      return (!row.hasOwnProperty('bnbAddress'))
    })    
    let selected = filtered.map((row:any) => {
      return {
        address: row.address|| '',
        bio: row.bio|| '',
        category: row.category|| '',
        description: row.description || '',
        email: row.email || '', // not on firestore invocation
        ethAddress: row.ethAddress|| '',
        bnbAddress: row.bnbAddress|| '',
        name: row.name|| '',
        slug: row.slug|| '',
        timezone: row.timezone|| '',
        title: row.title|| '',
        type: row.type|| '',
        verified: row.verified|| false,
        work: row.work || '', // not on firestore invocation
        
      }
      
    })
    this.downloadFile(selected, "ProvidersEthNoBnbWithAlgolia.csv")
    this.isSending = false
  }
  
  
  extractProvidersEthNoBnbWithAlgolia() {
    // here we have email but do we have all results?
    this.isSending = true
    
    this.algoliaHits = {};
    this.algoliaIndex.search({ query: '0x' }).then(res => {
      let numPages = res.nbPages
      let pagesProcessed = 0
      for (var i=0; i<numPages; i++) {
        this.algoliaIndex.search({ query: '0x', page: i }).then(res => {
          this.algoliaHits[res.page] = res
          pagesProcessed++
          if (pagesProcessed == numPages) this.extractProvidersEthNoBnbWithAlgoliaFinal()
        })
        
        
      }

    })

  
    
  }  

  ngOnDestroy() {

  }  
  
}
