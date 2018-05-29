
            <div *ngIf="action.colors && action.colors.length > 0" class='cover1-box'>
                <div class='cover1-wave -one' [ngStyle]="{'background': action.colors[0] }"></div>
                <div class='cover1-wave -two' [ngStyle]="{'background': action.colors[1] }"></div>
                <div class='cover1-wave -three' [ngStyle]="{'background': 'linear-gradient(to bottom, ' + action.colors[2] + ', rgba(221, 238, 255, 0) 80%, rgba(255, 255, 255, 0.5))' }"></div>
            </div>

            <div *ngIf="action.colors && action.colors.length > 0" class="cover2-box">

                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%"
                height="100%" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
                <defs>
                    <linearGradient id="bg">
                    <stop offset="0%" [ngStyle]="{ 'stop-color': action.colors[0] }"></stop>
                    <stop offset="50%" [ngStyle]="{ 'stop-color': action.colors[1] }"></stop>
                    <stop offset="100%" [ngStyle]="{ 'stop-color': action.colors[2] }"></stop>
                    </linearGradient>
                    <path id="wave" fill="url(#bg)" d="M-363.852,502.589c0,0,236.988-41.997,505.475,0
s371.981,38.998,575.971,0s293.985-39.278,505.474,5.859s493.475,48.368,716.963-4.995v560.106H-363.852V502.589z" />
                </defs>
                <g>
                    <use xlink:href='#wave' opacity=".3">
                    <animateTransform attributeName="transform" attributeType="XML" type="translate" dur="10s" calcMode="spline" values="270 230; -334 180; 270 230"
                        keyTimes="0; .5; 1" keySplines="0.42, 0, 0.58, 1.0;0.42, 0, 0.58, 1.0" repeatCount="indefinite"
                    />
                    </use>
                    <use xlink:href='#wave' opacity=".6">
                    <animateTransform attributeName="transform" attributeType="XML" type="translate" dur="8s" calcMode="spline" values="-270 230;243 220;-270 230"
                        keyTimes="0; .6; 1" keySplines="0.42, 0, 0.58, 1.0;0.42, 0, 0.58, 1.0" repeatCount="indefinite"
                    />
                    </use>
                    <use xlink:href='#wave' opacty=".9">
                    <animateTransform attributeName="transform" attributeType="XML" type="translate" dur="6s" calcMode="spline" values="0 230;-140 200;0 230"
                        keyTimes="0; .4; 1" keySplines="0.42, 0, 0.58, 1.0;0.42, 0, 0.58, 1.0" repeatCount="indefinite"
                    />
                    </use>
                </g>
                </svg>
            </div>





<ng-container *ngIf="reaction.answers | max: 'value' as result"> 
        <span *ngIf="result.value > 0" class="fw-500">&nbsp;&nbsp;&nbsp;&nbsp;{{ result.answer }}&nbsp;{{ result.value }}</span>
      </ng-container>




 // this.usersCollectionRef(`users/${camelCase(uid)}`).valueChanges().subscribe( (data: any) => {
    //   if (data && (!data.avatar || !data.avatar.uri) ) {
    //     data['avatar']['uri'] = 'assets/img/placeholder.png';
    //   }
    //   this.userModel = data;

      // Reactions
      // this.afDb.object(`reactions/${camelCase(uid)}`).valueChanges().subscribe( (reactions: any) => {
      //   const name: string = this.userModel.name.substr(0, this.userModel.name.indexOf(' '));
      //   if ( !reactions ) {
      //     reactions = [
      //       {
      //         uid: uid,
      //         id: 'service',
      //         question: `What do you love about ${name}\'s service?`,
      //         total: 0,
      //         answers: [
      //           { answer: 'Unique', value: 0, active: localStorage.getItem(`${uid}Unique`) },
      //           { answer: 'Great quality', value: 0, active: localStorage.getItem(`${uid}Great quality`) },
      //           { answer: 'Solid value', value: 0, active: localStorage.getItem(`${uid}Solid value`) },
      //           { answer: 'It\'s not for me', value: 0, active: localStorage.getItem(`${uid}It\'s not for me`) },
      //         ]
      //       },
      //       {
      //         uid: uid,
      //         id: 'provider',
      //         question: `${name} is...`,
      //         total: 0,
      //         answers: [
      //           { answer: 'Versatile', value: 0, active: localStorage.getItem(`${uid}Versatile`) },
      //           { answer: 'Creative', value: 0, active: localStorage.getItem(`${uid}Creative`) },
      //           { answer: 'Knowledgeable', value: 0, active: localStorage.getItem(`${uid}Knowledgeable`) },
      //           { answer: 'Not sure', value: 0, active: localStorage.getItem(`${uid}Not sure`) }
      //         ]
      //       },
      //       {
      //         uid: uid,
      //         id: 'recommended',
      //         question: 'Will you continue to use this service?',
      //         total: 0,
      //         answers: [
      //           { answer: 'Yes, I will continue to use.', value: 0, active: localStorage.getItem(`${uid}Yes, I will continue to use.`) },
      //           { answer: 'No, thanks.', value: 0, active: localStorage.getItem(`${uid}No, thanks.`) },
      //         ]
      //       }
      //     ];
      //   }
      //   this.reactionsModel = reactions;
      //   console.log('reactions', this.reactionsModel);
      // });
    // });

    // Portfolio
    // this.afDb.list(`works/${camelCase(uid)}`).valueChanges().subscribe( (data: any) => {
    //   this.workModel = data;
    //   console.log('works', this.workModel);
    // });

    // Comments
    // this.afDb.list(`comments/${camelCase(uid)}`).valueChanges().subscribe( (data: any) => {
    //   data.map( (item) => {
    //     item['humanisedDate'] = moment(item.timestamp, 'x').fromNow();
    //   });
    //   this.commentsModel = data;
    //   console.log('comments', this.commentsModel);
    // });