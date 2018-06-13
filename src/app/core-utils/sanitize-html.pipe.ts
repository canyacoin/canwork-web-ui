import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {

    constructor(public _sanitizer: DomSanitizer) { }

    transform(v: string): SafeHtml {
        if (v) {
            return this._sanitizer.bypassSecurityTrustHtml(v);

        }
        return '';
    }
}
