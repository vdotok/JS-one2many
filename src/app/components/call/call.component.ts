import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FindArrayObject, isMobile } from 'src/app/shared/helpers/helpersFunctions';
import { BaseService } from 'src/app/shared/services/base.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { timer, Subscription } from "rxjs";
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import FormsHandler from 'src/app/shared/FormsHandler/FormsHandler';
import { ClipboardService } from 'ngx-clipboard';
import { VdkCallService } from 'src/app/shared/services/vdkcall.service';

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


  @ViewChild('IncommingBroadcastCall ') IncommingBroadcastCall: TemplateRef<any>;
  @ViewChild('receiverBroadcastCall') receiverBroadcastCall: TemplateRef<any>;
  @ViewChild('videoBroadcast') videoBroadcast: TemplateRef<any>;

  @ViewChild('searchInput') searchInput: ElementRef;
  currentUserName = StorageService.getAuthUsername();
  currentUserData = StorageService.getUserData();
  threadType = 'THREAD';
  screen = 'LISTING';
  dialogRef: any;
  loading = true;
  groupForm: FormGroup;
  AllGroups = [];
  AllUsers = [];
  countDownTime: Subscription;
  callTime = 0;
  groupOutgoingVideoCall = false;
  sdkconnected = false;
  PUBLIC_URL = '';
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
      IncommingBroadcastCall: this.IncommingBroadcastCall,
      receiverBroadcastCall: this.receiverBroadcastCall,
      videoBroadcast: this.videoBroadcast
    }
    return templateList[this.calling.templateName];
  }

  broadcastSettings = {
    features: [
      {
        name: 'screen_sharing_with_app_audio',
        title: 'screen sharing with app audio',
        selected: false
      },
      {
        name: 'screen_sharing_with_mic_audio',
        title: 'screen sharing with mic audio',
        selected: false
      },
      {
        name: 'camara',
        title: 'camara',
        selected: false
      }
    ],
    broadcastType: ''
  }

  StartBroadcast = false;
  creatingyourURL = false;

  constructor(
    private _fb: FormBuilder,
    public vdkCallService: VdkCallService,
    private svc: BaseService,
    private router: Router,
    public dialog: MatDialog,
    private changeDetector: ChangeDetectorRef,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private clipboardApi: ClipboardService
  ) {
    this.groupForm = this._fb.group({
      'group_id': new FormControl('', [Validators.required]),
      'group_title': new FormControl('', [Validators.required, Validators.maxLength(100)]),
    }, { updateOn: 'change' });
    this.vdkCallService.initConfigure();
  }

  ngOnInit() {
    this.svc.post('AllUsers').subscribe(v => {
      if (v && v.status == 200) {
        this.AllUsers = v.users;
      }
    });

    this.vdkCallService.Client.on("register", response => {
      console.error("register response", response);
    });

    this.vdkCallService.Client.on("connected", response => {
      this.sdkconnected = true;
      console.error("connected response", response);
      if (!this.AllGroups.length) {
        this.getAllGroups();
      }
    });

    this.vdkCallService.Client.on("call", response => {
      console.error("call response", response);
      switch (response.type) {
        case "CALL_RECEIVED":
          this.screen = 'MAIN'
          this.calling.callerName = this.findUserName(response.from);
          this.calling.templateName = response.call_type == 'video' ? 'IncommingBroadcastCall' : 'groupIncommingAudioCall';
          this.changeDetector.detectChanges();
          this.calling.call_type = response.call_type;
          this.changeDetector.detectChanges();
          break;
        case "CALL_STATUS":
          const displaystyle = response.video_status ? 'block' : 'none';
          if (document.getElementById('remoteVideo')) document.getElementById('remoteVideo').style.display = displaystyle;
          break;
        case "CALL_ACCEPTED":
          this.startWatch();
          break;
        case "PUBLIC_URL":
          this.creatingyourURL = false;
          this.StartBroadcast = false;
          this.calling.templateName = 'videoBroadcast';
          this.PUBLIC_URL = response.url;
          this.changeDetector.detectChanges();
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
    this.changeDetector.detectChanges();
  }

  inCall(): boolean {
    return this.calling.templateName != 'noCall'
  }

  acceptcall() {
    this.calling.templateName = this.calling.call_type == 'video' ? 'receiverBroadcastCall' : 'groupOngoingAudioCall';
    this.changeDetector.detectChanges();
    setTimeout(() => {
      this.changeDetector.detectChanges();
      this.groupOutgoingVideoCall = false;
      const localVideo = document.getElementById("remoteVideo");
      this.vdkCallService.AcceptBroadcast(localVideo);
      this.startWatch();
      this.changeDetector.detectChanges();
    });
  }

  startWatch() {
    if (!this.callTime) {
      this.countDownTime = timer(0, 1000).subscribe(() => ++this.callTime);
    }
  }

  changeSettings(filed) {
    this.settings[filed] = !this.settings[filed];
    console.error("changeSettingschangeSettingschangeSettings", this.settings[filed])
    switch (filed) {
      case 'isOnInProgressCamara':
        this.settings[filed] ? this.vdkCallService.setCameraOn() : this.vdkCallService.setCameraOff();
        const displaystyle = this.settings[filed] ? 'block' : 'none';
        // const displayNamestyle = this.settings[filed] ? 'none' : 'block';
        document.getElementById('BroadCastLocalVideo').style.display = displaystyle;
        // document.getElementById('localNameHolder').style.display = displayNamestyle;
        break;
      case 'isOnInProgressMicrophone':
        this.settings[filed] ? this.vdkCallService.setMicUnmute() : this.vdkCallService.setMicMute();
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

  selectFeature(i) {
    if (i == 0) {
      this.broadcastSettings.features[1].selected = false;
    } else if (i == 1) {
      this.broadcastSettings.features[0].selected = false;
    }
    this.broadcastSettings.features[i].selected = !this.broadcastSettings.features[i].selected;
  }

  isValidFeatureSelection() {
    return this.broadcastSettings.broadcastType && !(this.broadcastSettings.features[0].selected && this.broadcastSettings.features[1].selected) && this.broadcastSettings.features.filter(e => e.selected).length;
  }

  copyText() {
    this.clipboardApi.copyFromContent(this.PUBLIC_URL);
    this.toastr.success("Copied to Clipboard");
  }

  broadCast() {
    if (!this.isValidFeatureSelection()) return;
    this.calling.templateName = 'videoBroadcast';
    setTimeout(() => {
      const participants = this.activeChat['participants'].filter(g => g.ref_id != this.currentUserName).map(g => g.ref_id);
      const params = {
        call_type: "video",
        localVideo: document.getElementById("BroadCastLocalVideo"),
        to: [...participants],
      };
      this.vdkCallService.Broadcasting(params);
    });
  }

  submitFeatures() {
    if (!this.isValidFeatureSelection()) return;
    this.creatingyourURL = false;
    this.StartBroadcast = true;
  }

  createURl() {
    this.creatingyourURL = true;
    setTimeout(() => {
      this.creatingyourURL = false;
      this.StartBroadcast = false;
      this.calling.templateName = 'videoBroadcast';
      this.publicBroadcast();
    }, 1000);
  }

  publicBroadcast() {
    console.error(this.isVideoBroadCast());
    setTimeout(() => {
      const participants = this.activeChat['participants'].filter(g => g.ref_id != this.currentUserName).map(g => g.ref_id);
      const params = {
        call_type: "video",
        localVideo: document.getElementById("BroadCastLocalVideo"),
        to: [...participants],
      };
      this.vdkCallService.PulicBroadCast(params);
    });

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

}
