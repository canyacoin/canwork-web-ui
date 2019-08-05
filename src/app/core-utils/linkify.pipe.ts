import { Pipe, PipeTransform } from '@angular/core';

function linkify(text, userMessage) {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
  if (userMessage === false) {
    text = text.replace(urlRegex, '<a target="_blank" href="$1">$1</a>')
  } else {
    text = text.replace(
      urlRegex,
      '<a class="text-white" target="_blank" href="$1">$1</a>'
    )
  }
  return text
}

@Pipe({
    name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {
    transform(v: string, isWhite: boolean): string {
        if (v) {
          return linkify(v, isWhite);
        }
        return '';
    }
}

