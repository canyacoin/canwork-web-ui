import { Injectable } from '@angular/core';
import {
    AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument
} from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs';

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
          upload.progress = Math.floor((snap.bytesTransferred / snap.totalBytes) * 100);
          if (upload.progress === 100) {
            upload.filePath = `uploads/${UploadCategory.jobs}/${jobId}/${upload.createdBy}/${upload.id}/${upload.name}`;
               /**
                *  firebase storage sometimes bugs out and returns null url.
                *
                *  the solution right now is to save the filePath,
                *  and get the uploaded file's download URL later, on the job details page,
                *  the only page where you can download the file, anyway.
                *  By the time the user got to the job details page, the file would've already
                *  been stored on firestore, so this should get us around the async issue.
                *  Not the most sophisticated solution, but it's one that works for now.
                *
                *  - Wie
                */
            if (snap.downloadURL) {
               upload.url = snap.downloadURL;
            }
            resolve(upload);
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
