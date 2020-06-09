import { Injectable } from '@angular/core'
import { Observable, of, zip } from 'rxjs'
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http'
import { Issue, Repository, DecoratedIssue } from '@class/git'
import { environment } from '@env/environment'

@Injectable()
export class GitService {

  constructor(
    private http: HttpClient,
  ) { }
  
  /** Get an issue decorated with repository language from GitHub or GitLab */
  getDecoratedIssue(issueUrl: string): Observable<DecoratedIssue> {
    let tokenLab = environment.gitlab.token
    let project = ''
    let issue = ''
    let repo = 'unknown'
    let reLab = /https:\/\/gitlab\.com\/(.*)\/-\/issues\/(\d*)/gmi
    let reHub = /https:\/\/github\.com\/(.*)\/issues\/(\d*)/gmi
    let splittedLab = reLab.exec(issueUrl)
    let splittedHub = reHub.exec(issueUrl)
    let issueApiUrl = ''
    let repositoryApiUrl = ''
    if (!!splittedLab) repo = 'lab'
    if (!!splittedHub) repo = 'hub'
    
    if (repo == 'unknown') {
      let result = {error: 'Wrong url format'} 
      return of(result as DecoratedIssue)

    }     
    
    // all good, go on
    if (repo == 'hub') {
      project = splittedHub[1]
      issue = splittedHub[2]
      issueApiUrl = `https://api.github.com/repos/${project}/issues/${issue}`
      repositoryApiUrl = `https://api.github.com/repos/${project}`
    } else if (repo == 'lab') {
      project = splittedLab[1]
      issue = splittedLab[2]    
      issueApiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(project)}/issues/${issue}?access_token=${tokenLab}`
      repositoryApiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(project)}/languages?access_token=${tokenLab}`
    }
   
    
    return zip(this.http.get<Issue>(issueApiUrl), this.http.get<Repository>(repositoryApiUrl)).pipe(
      map(([issueResp, repositoryResp]) => {
        let result: DecoratedIssue
        result = <any>Object.assign({}, issueResp)
        if (repo == 'hub') {
          result.description = issueResp.body // normalize field name
          result.language = repositoryResp.language
        }
        if (repo == 'lab') {
          // handle GitLab languages, get first one (more relevant)
          let langLab = ''
          let key = ''
          if (!!repositoryResp) {
            for (let k in repositoryResp) { 
                key = k; 
                break; 
            }
            if (!!key) langLab = key
          }
          result.language = langLab
        }
        result.inputValues = {
          provider: `Git${repo.charAt(0).toUpperCase() + repo.slice(1)}`,
          project: project,
          issue: issue,
        }
        result.error = ''
        return result
      }),
    )
    

  }  
  
  
}
