import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { FindArrayObject, isMobile } from 'src/app/shared/helpers/helpersFunctions';
import { BaseService } from 'src/app/shared/services/base.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { timer, Subscription } from "rxjs";
import { ToastrService } from 'ngx-toastr';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import FormsHandler from 'src/app/shared/FormsHandler/FormsHandler';
import { ClipboardService } from 'ngx-clipboard';
import { VdkCallService } from 'src/app/shared/services/vdkcall.service';
import { VdkcallBroadcastServiceService } from 'src/app/shared/services/vdkcall-broadcast-service.service';


// =========== Public Broadcast ===========//
// => screen share 

// => camera



// =========== Group Broadcast ===========//

@Component({
  selector: 'call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit {
  @ViewChild('noCall') noCall: TemplateRef<any>;
  @ViewChild('groupIncommingAudioCall') groupIncommingAudioCall: TemplateRef<any>;
  @ViewChild('groupOutgoingAudioCall') groupOutgoingAudioCall: TemplateRef<any>;
  @ViewChild('groupOngoingAudioCall') groupOngoingAudioCall: TemplateRef<any>;


  @ViewChild('IncomingBroadcastCall') IncomingBroadcastCall: TemplateRef<any>;
  @ViewChild('receiverBroadcastCall') receiverBroadcastCall: TemplateRef<any>;
  @ViewChild('videoBroadcast') videoBroadcast: TemplateRef<any>;
  @ViewChild('screenSharingBroadcast') screenSharingBroadcast: TemplateRef<any>;

  //@ViewChild('searchInput') searchInput: ElementRef;
  currentUserName = StorageService.getAuthUsername();
  currentUserData = StorageService.getUserData();
  threadType = 'THREAD';
  screen = 'LISTING';
  dialogRef: any;
  loading = true;
  groupForm: UntypedFormGroup;
  AllGroups = [];
  AllUsers = [];
  countDownTime: Subscription;
  callTime = 0;
  groupOutgoingVideoCall = false;
  sdkconnected = false;
  PUBLIC_URL = '';
  public_broadcast_uuid = "";
  activeChat: any = {
    chatHistory: []
  };
  calling = {
    participant: [],
    call_type: 'video',
    templateName: 'noCall',
    callerName: ''
  }
  settings = {
    isOnInProgressCamara: true,
    isOnInProgressMicrophone: true
  }

  get selectedTemplate() {
    const templateList = {
      noCall: this.noCall,
      groupIncommingAudioCall: this.groupIncommingAudioCall,
      groupOutgoingAudioCall: this.groupOutgoingAudioCall,
      groupOngoingAudioCall: this.groupOngoingAudioCall,
      IncomingBroadcastCall: this.IncomingBroadcastCall,
      receiverBroadcastCall: this.receiverBroadcastCall,
      videoBroadcast: this.videoBroadcast,
      screenSharingBroadcast: this.screenSharingBroadcast
    }
    return templateList[this.calling.templateName];
  }

  broadcastSettings = {
    features: [
      // {
      //   name: 'screen_sharing_with_app_audio',
      //   title: 'screen sharing with app audio',
      //   selected: false
      // },
      // {
      //   name: 'screen_sharing_with_mic_audio',
      //   title: 'screen sharing with mic audio',
      //   selected: false
      // },
      {
        name: 'screen_sharing_with_app_audio', 
        title: 'screen sharing with app audio',
        selected: false,
      },
      {
        name: 'camara',
        title: 'camera with mic audio', //camara
        selected: false
      },
      // {
      //   name: "dummy",
      //   title: "dummy"
      // }
    ],
    broadcastType: ''
  }

  StartBroadcast = false;
  creatingyourURL = false;
  videoElem;
  logElem;

  constructor(
    private _fb: UntypedFormBuilder,
    public vdkCallService: VdkCallService,
    public vcbs: VdkcallBroadcastServiceService,

    private svc: BaseService,
    private router: Router,
    public dialog: MatDialog,
    private changeDetector: ChangeDetectorRef,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private clipboardApi: ClipboardService
  ) {
    //this.vcbs.initConfigure();


    this.groupForm = this._fb.group({
      'group_id': new UntypedFormControl('', [Validators.required]),
      'group_title': new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
    }, { updateOn: 'change' });
    this.vdkCallService.initConfigure();
    // this.vcbs.initConfigure();

  }

  ngOnInit() { 
    console.log("**** ngOnInit called\n");
       
    // this.vcbs.initConfigure();

    this.svc.post('AllUsers').subscribe(v => {
      if (v && v.status == 200) {
        this.AllUsers = v.users;
      }
    });

    this.vdkCallService.Client.on("register", response => {
      console.error("**** Register response\n", response);
    });

    this.vdkCallService.Client.on("connected", response => {
      this.sdkconnected = true;
      console.log("**** connected response", response);

      if (!this.AllGroups.length) {
        this.getAllGroups();
      }
    });

    this.vdkCallService.Client.on("call", response => {
      console.error("**** Call response\n\n", response);
      switch (response.type) {
        case "CALL_RECEIVED":
          this.screen = 'MAIN'
          this.calling.callerName = this.findUserName(response.from);
          this.calling.templateName = response.callType == 'video' ? 'IncomingBroadcastCall' : 'groupIncommingAudioCall'; //response.call_type
          this.changeDetector.detectChanges();
          this.calling.call_type = response.callType; //response.call_type
          this.changeDetector.detectChanges();
          break;
        case "CALL_STATUS":
          
          const displaystyle = response.video_status ? 'block' : 'none';

          //if (document.getElementById('remoteVideo') === null) { //if (document.getElementById('remoteVideo'))
            document.getElementById('remoteVideo').style.display = displaystyle;

          console.log("GC CALL_STATUS:\n\n\n ", document.getElementById('remoteVideo') , response, "\n", displaystyle);

          //}
          break;
        case "CALL_ACCEPTED":
          this.startWatch();
          break;
        case "PUBLIC_URL":
          this.creatingyourURL = false;
          this.StartBroadcast = false;
          this.calling.templateName = 'videoBroadcast';
          this.PUBLIC_URL = response.url;
          this.public_broadcast_uuid = response.uuid;
          this.changeDetector.detectChanges();
          break;


        case "NEW_PARTICIPANT":
          console.error("**** NEW_PARTICIPANT => COUNT =  ", this.vdkCallService.Client.getParticipantsCount(this.public_broadcast_uuid), "\n\n", this.vdkCallService.Client.participantsInCall[this.public_broadcast_uuid]);
          break;
        case "SESSION_BREAK":
          console.error("**** SESSION_BREAK => COUNT = ", this.vdkCallService.Client.getParticipantsCount(this.public_broadcast_uuid));
          break;
        case "CALL_ENDED":
          console.error("**** SESSION_CANCEL => COUNT =  ", this.vdkCallService.Client.getParticipantsCount(this.public_broadcast_uuid)); 
          this.public_broadcast_uuid = "";

          break;    
      }
    });

  }
  ngAfterViewInit(): void {
    this.vdkCallService.Client.on("authentication_error", (res: any) => {
      this.toastr.error("SDK Authentication Error", "Opps");
    });
  }





  deleteGroup(group) {
    this.loading = true;
    const playload = {
      group_id: group.id
    }
    this.svc.post('DeleteGroup', playload).subscribe(v => {
      if (v && v.status == 200) {
        this.loading = false;
        this.getAllGroups();
        this.toastr.success('The group has been deleted!', 'Success!');
      }
    });
  }

  openModal(content, group) {
    if (group.auto_created) {
      alert("You Can not change personal group name");
      return;
    }
    group['group_id'] = group.id
    this.groupForm.reset(group);
    this.dialogRef = this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      windowClass: 'dark-modal'
    });
  }

  editGroup() {
    FormsHandler.validateForm(this.groupForm);
    if (this.groupForm.invalid || this.loading) return;
    const playload = this.groupForm.value;
    this.loading = true;
    this.svc.post('RenameGroup', playload).subscribe(v => {
      if (v && v.status == 200) {
        this.getAllGroups();
        this.dialogRef.close();
        this.loading = false;
        this.toastr.success('The group has been updated!', 'Success!');
      }
    });
  }

  getAllGroups() {
    this.loading = true;
    this.svc.get('AllGroups').subscribe(v => {
      this.loading = false;
      if (v && v.status == 200) {
        this.AllGroups = v.groups.map(chat => {
          chat['chatTitle'] = chat.auto_created ? chat.participants[0]['full_name'] : chat.group_title;
          chat['key'] = chat.channel_key;
          chat['channel'] = chat.channel_name;
          chat['ref_id'] = chat['participants'] && chat['participants'][0].ref_id;
          return chat;
        });
        this.activeChat = this.AllGroups.length ? this.AllGroups['0'] : {};
      }
      this.changeDetector.detectChanges();
    });
  }

  findUserName(ref_id) {
    const user = FindArrayObject(this.AllUsers, 'ref_id', ref_id);
    return user ? user.full_name : 'Group A';
  }

  changeSidebar($event) {
    this.threadType = $event;
    if (this.threadType == 'THREAD') {
      this.getAllGroups();
    }
  }

  newGroup() {
    this.threadType = 'GROUP';
    this.changeDetector.detectChanges();
  }

  logout() {
    StorageService.clearLocalStorge();
    this.router.navigate(['login']);
  }


  //====================================== CALLLLLLLLLLLL =====================================//
  rejectedCall() {
    this.calling.templateName = 'noCall';
    this.changeDetector.detectChanges();
  }

  resetCall() {
    this.settings = {
      isOnInProgressCamara: true,
      isOnInProgressMicrophone: true
    }
    this.calling = {
      participant: [],
      call_type: 'video',
      templateName: 'noCall',
      callerName: ''
    }
    this.callTime = 0;
    this.screen = 'LISTING';
    this.groupOutgoingVideoCall = false;
    this.PUBLIC_URL = '';
    this.broadcastSettings.broadcastType = '';
    this.broadcastSettings.features.map(item => item.selected = false);
    if (this.countDownTime) this.countDownTime.unsubscribe();
    this.changeDetector.detectChanges();
  }

  stopCall() {
    this.calling.templateName = 'noCall';
    this.resetCall();
    this.vdkCallService.EndPulicBroadCast();
    this.changeDetector.detectChanges();
  }

  inCall(): boolean {
    return this.calling.templateName != 'noCall'
  }

  acceptcall() {
    // this.vcbs.initConfigure();

    console.log("GC accept call\n", this.calling, "\n", document.getElementById("remoteVideo"));
    
    this.calling.templateName = this.calling.call_type == 'video' ? 'receiverBroadcastCall' : 'groupOngoingAudioCall';
    this.changeDetector.detectChanges();
    setTimeout(() => {
      this.changeDetector.detectChanges();
      this.groupOutgoingVideoCall = false;
      const localVideo = document.getElementById("remoteVideo");
      console.log("GC localVideo:\n","\n", document.getElementById("remoteVideo"), localVideo);

      this.vdkCallService.AcceptBroadcast(localVideo);
      this.startWatch();
      this.changeDetector.detectChanges();
    });
  }
  //====================================== CALLLLLLLLLLLL =====================================//






  startWatch() {
    if (!this.callTime) {
      this.countDownTime = timer(0, 1000).subscribe(() => ++this.callTime);
    }
  }
  changeSettings(filed) {
    console.log("000 changeSettings:\n ", this.settings, "\n\n", filed);
    
    this.settings[filed] = !this.settings[filed];
    //console.error("000 changeSettingschangeSettingschangeSettings", this.settings[filed])
    switch (filed) {
      case 'isOnInProgressCamara':
        this.settings[filed] ? this.vdkCallService.setCameraOn() : this.vdkCallService.setCameraOff();
        const displaystyle = this.settings[filed] ? 'block' : 'none';
        // const displayNamestyle = this.settings[filed] ? 'none' : 'block';
        document.getElementById('BroadCastLocalVideo').style.display = displaystyle;
        // document.getElementById('localNameHolder').style.display = displayNamestyle;
        break;
      case 'isOnInProgressMicrophone':
        this.settings[filed] ? this.vdkCallService.setMicUnmute(this.public_broadcast_uuid) : this.vdkCallService.setMicMute();
        const enabled = this.settings[filed];
        const audiotrack: any = (<HTMLInputElement>document.getElementById("localAudio"));
        if (audiotrack && audiotrack.audioTracks) {
          audiotrack.audioTracks[0].enabled = enabled;
        }
        break;
    }
  }
  isHideThread() {
    return isMobile() ? this.screen != 'LISTING' : false;
  }
  isHideChatScreen() {
    return isMobile() ? this.screen != 'MAIN' : false;
  }
  isValidFeatureSelection() {
    /*console.log("selected final result: \n\n",this.broadcastSettings.broadcastType,"\n\n", this.broadcastSettings.features[0].selected, "\n\n", this.broadcastSettings.features[1].selected, "\n\n", this.broadcastSettings.features.filter(e => e.selected), "\n\n\n0or1: ",
    this.broadcastSettings.broadcastType && 
    (this.broadcastSettings.features[0].selected || this.broadcastSettings.features[1].selected) && this.broadcastSettings.features.filter(e => e.selected).length
    );*/
    

    //Previously added condition
    // return this.broadcastSettings.broadcastType && 
    // !(this.broadcastSettings.features[0].selected && this.broadcastSettings.features[1].selected) && this.broadcastSettings.features.filter(e => e.selected).length;
    
    //Newly added condition
    return this.broadcastSettings.broadcastType && 
    (this.broadcastSettings.features[0].selected || this.broadcastSettings.features[1].selected) && this.broadcastSettings.features.filter(e => e.selected).length;
  }
  copyText() {
    this.clipboardApi.copyFromContent(this.PUBLIC_URL);
    this.toastr.success("Copied to Clipboard");
  }
  sharescreen() {
    setTimeout(() => {
      this.startCapture();
    });
  }




  // ************************************************ ---- PUBLIC BROADCASTING ---- ***********************************************************//
  //PB- Choosing camera with mic OR screen share with audio:
  selectFeature(i) { 
    // if (i == 0) {
    //   this.broadcastSettings.features[1].selected = false;
    // } else if (i == 1) {
    //   this.broadcastSettings.features[0].selected = false;
    // }
    this.broadcastSettings.features[i].selected = !this.broadcastSettings.features[i].selected;
    console.log("selected: \n\n", i, "\n\n", this.broadcastSettings.features[i]);

  }


  //PB- When user selects "Public Broadcast" option + click "continue"=> it then shows popup of creating url which calls createURL() 
  submitFeatures() {
    if (!this.isValidFeatureSelection()) return;
    this.creatingyourURL = false;
    this.StartBroadcast = true;
  } 


  //PB-
  createURl() {
    console.log(" ****  ========= creating url");
    this.creatingyourURL = true;
    setTimeout(() => {
      console.log("creating url timeot");
      this.creatingyourURL = false;
      this.StartBroadcast = false;
      this.calling.templateName = 'videoBroadcast';
      this.publicBroadcast();
    }, 4000);
  }


  //PB- FINALLY - When public broadcast starts:
  publicBroadcast() {
    console.log("**** === PUBLIC BROADCAST === \n\n", {"Broadcast Type":  this.broadcastSettings.broadcastType, "Screen sharing": this.broadcastSettings.features[0].selected, "Camera with mic": this.broadcastSettings.features[1].selected});
    let type_of_video;
    if (this.broadcastSettings.features[1].selected ){
      type_of_video = "video";
    } else if (this.broadcastSettings.features[0].selected) {
      type_of_video = "screen";
    }
    setTimeout(() => {
      const participants = this.getChatParticipants();
      const params = {
        call_type: "video",
        video: 1,
        audio: 1,
        videoType: type_of_video,//"video", //"screen" == screen_sharing_case,,,,,,, "video" == camera_with_mic_audio_case
        localVideo: document.getElementById("BroadCastLocalVideo"),
        to: [...participants],
      };
      //return;
      this.vdkCallService.PulicBroadCast(params);
    });
  }
  // ************************************************ ---- PUBLIC BROADCASTING ---- ***********************************************************//






  // ************************************************ ---- GROUP BROADCASTING ---- ***********************************************************//
  //GB- When user selects "Group Broadcast" option + click "continue"

  broadCast() {
    console.log("**** GROUP BROADCAST: \n\n", "Camera: ", this.isVideoBroadCast(), "\nScreen Share: ", this.isScreenSharingBroadCast());
    
    if (this.isVideoBroadCast()) {
      this.videoBroadCast();
    } else if (this.isScreenSharingBroadCast()) {
      this.screenBroadCast();
    }
  }


  videoBroadCast() {
    console.log("**** videoBroadCast() called");
    if (!this.isValidFeatureSelection()) return;
    this.calling.templateName = 'videoBroadcast';
    setTimeout(() => {
      const participants = this.getChatParticipants();
      const params = {
        video: 1,
        audio:1,
        videoType: "video",
        localVideo: document.getElementById("BroadCastLocalVideo"),
        to: [...participants],
        dummy: "hehe"
      };
      console.log("**** Video BC Params: \n\n", params);
      this.vdkCallService.Broadcasting(params);
    });
  }
  screenBroadCast() {
    console.log("**** screenBroadCast() called");
    if (!this.isValidFeatureSelection()) return;
    this.calling.templateName = 'screenSharingBroadcast';
    setTimeout(() => {
      const participants = this.getChatParticipants();
      const params = {
        video: 1,
        audio:1,
        videoType: "screen",
        localVideo: document.getElementById("BroadCastLocalVideo"),
        to: [...participants],
      };
      console.log("**** Screen share BC Params: \n\n", params);

      try {
        this.vdkCallService.Broadcasting(params);
      } catch (e) {
        console.error(e);
      }
    });
  }
  // *****************************************************************************************************************************************//


















  private getChatParticipants() {
    let participants = [];
    if (this.activeChat && this.activeChat['participants'] && this.activeChat['participants'].length) {
      participants = this.activeChat['participants'].filter(g => g.ref_id != this.currentUserName).map(g => g.ref_id);
    }
    return participants;
  }
  
  isMobile() {
    return window.innerWidth < 768
  }

  backScreen() {
    this.threadType = "THREAD";
    this.screen = "CHAT";
    this.changeDetector.detectChanges();
  }

  setActiveChat(group) {
    this.activeChat = group;
  }

  isVideoBroadCast(): boolean {
    const features = this.broadcastSettings.features.filter(item => item.selected);
    return features.length == 1 && features[0].name == "camara";
  }

  isScreenSharingBroadCast(): boolean {
    const features = this.broadcastSettings.features.filter(item => item.selected);
    return features.length == 1 && features[0].name != "camara";
  }

  isVideoAndScreenBroadCast(): boolean {
    const features = this.broadcastSettings.features.filter(item => item.selected);
    return features.length > 1
  }


  startCapture() {
    if (!this.isValidFeatureSelection()) return;
    //these changes need to do in sdk level for reference only
    // this.logElem = "";
    // var displayMediaOptions = {
    //   video: {
    //     cursor: "always"
    //   },
    //   audio: false
    // };
    // let videoElem: any = document.getElementById("screenShareVideo");
    // const mediaDevices = navigator.mediaDevices as any;
    // let stream = await navigator.mediaDevices.getUserMedia({ "video": true });
    // // let stream = await navigator.mediaDevices.d
    // // let stream = await mediaDevices.getDisplayMedia();
    // videoElem.srcObject = stream;
    const participants = this.getChatParticipants();
    const params = {
      call_type: "video",
      localVideo: document.getElementById("screenShareVideo"),
      to: [...participants],
    };
    this.vdkCallService.Broadcasting(params);
  }

  stopCapture() {
    let tracks = this.videoElem.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    this.videoElem.srcObject = null;
  }

}
