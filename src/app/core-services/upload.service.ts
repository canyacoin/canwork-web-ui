import { Injectable } from '@angular/core';
import {
    AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument
} from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';

import { Upload } from '../core-classes/upload';

export enum UploadCategory {
  jobs = 'jobs'
}
@Injectable()
export class UploadService {

  uploadsCollection: AngularFirestoreCollection<Upload>;
  uploads: Observable<Upload[]>;

  constructor(private afs: AngularFirestore, private storage: AngularFireStorage) {
    this.uploadsCollection = this.afs.collection<Upload>('uploads');
  }

  async uploadJobAttachmentToStorage(jobId: string, upload: Upload, file: File): Promise<Upload> {
    return new Promise<Upload>((resolve, reject) => {
      try {
        const storageRef = this.storage.ref(`uploads/${UploadCategory.jobs}/${jobId}/${upload.createdBy}/${upload.id}/${upload.name}`);
        const uploadTask = storageRef.put(file);
        uploadTask.snapshotChanges().subscribe((snap) => {
          upload.progress = (snap.bytesTransferred / snap.totalBytes) * 100;
          if (upload.progress === 100) {
            if (snap.downloadURL) { // firebase storage sometimes bugs and returns null url
              upload.url = snap.downloadURL;
              resolve(upload);
            } else {
              resolve(null);
            }
          }
        });
      } catch (e) {
        reject(null);
      }
    });
  }

  cancelJobAttachmentUpload(jobId: string, upload: Upload): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const storageRef = this.storage.ref(`uploads/${UploadCategory.jobs}/${jobId}/${upload.createdBy}/${upload.id}/${upload.name}`);
        storageRef.delete();
        resolve(true);
      } catch (e) {
        resolve(false);
      }
    });
  }
}
