import { AngularEditorConfig } from '@kolkov/angular-editor'

export function customAngularEditorConfig(): AngularEditorConfig {
  let angularConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'How do you intend to deliver on this job',
    defaultParagraphSeparator: '',
    defaultFontName: 'General Sans',
    defaultFontSize: '3',
    fonts: [{ class: 'font-sans', name: 'General Sans' }],
    customClasses: [],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      [
        'undo',
        'redo',
        'subscript',
        'superscript',
        'strikeThrough',
        'indent',
        'outdent',
        'heading',
        'fontName',
      ],
      [
        'fontSize',
        'textColor',
        'backgroundColor',
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode',
      ],
    ],
  }
  return angularConfig
}
