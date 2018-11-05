import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

export class FeatureToggle {
  featureName: string;
  enabled: boolean;
  subFeatures: Map<string, boolean>;
}

@Injectable()
export class FeatureToggleService {
  featureToggleCollection: AngularFirestoreCollection<any>;

  constructor(
    private afs: AngularFirestore) {
    this.featureToggleCollection = this.afs.collection<any>('features');

  }

  async getFeatureConfig(featureName: string): Promise<FeatureToggle> {
    const feature = await this.featureToggleCollection.ref
      .where('featureName', '==', featureName)
      .limit(1).get();

    return new Promise<FeatureToggle>((resolve, reject) => {
      if (feature.empty) {
        resolve(null);
      } else {
        resolve(feature.docs.pop().data());
      }
    });
  }
}

