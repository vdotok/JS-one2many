import { Injectable, Output } from '@angular/core';
import { StorageService } from './storage.service';
import { PROJECT_ID } from 'src/constants/const';
declare const CVDOTOK: any;

@Injectable()
export class VdkCallService {
  @Output() public Client: any;
  @Output() public Broadcast: any;

  constructor() { }

  public initConfigure(): void {
    
    try {
      const user = StorageService.getUserData();
      this.Client = new CVDOTOK.Client({
        projectId: PROJECT_ID,
        host: `${user.media_server_map.complete_address}`,
        stunServer: `${user.stun_server_map.complete_address}`,
        ignorePublicIP: true
      });
      // this.Broadcast = new CVDOTOK.Broadcast({
      //   projectId: "1RN1RP",
      //   host: `${user.media_server_map.complete_address}`,
      //   stunServer: `${user.stun_server_map.complete_address}`,
      //   ignorePublicIP: true
      // });
      this.Client.on("connected", (res) => {

        let user = StorageService.getUserData();
        console.log("**** initConfigure: \n\n", user, user.ref_id.toString(), user.authorization_token.toString());

        this.Client.Register(
          user.ref_id.toString(),
          user.authorization_token.toString()
        );
      });


      // this.Broadcast.on("connected", (res) => {
      //   let user = StorageService.getUserData();
      //   console.log("**** bbbbbbb ==== initConfigure: \n\n", user, user.ref_id.toString(), user.authorization_token.toString());

      //   this.Broadcast.Register(
      //     user.ref_id.toString(),
      //     user.authorization_token.toString()
      //   );
      // });


    } catch (e) {
      console.error(e)
    }
    
  }

  groupCall(params): void {
    this.Client.GroupCall(params);
  }

  joinGroupCall(params): void {
    this.Client.JoinGroupCall(params);
  }

  leaveGroupCall(): void {
    this.Client.LeaveGroupCall();
  }

  setCameraOn(): void {
    this.Client.SetCameraOn();
  }

  setCameraOff(): void {
    this.Client.SetCameraOff();
  }

  setMicMute(): void {
    this.Client.SetMicMute();
  }

  setMicUnmute(uuid): void {
    this.Client.SetMicUnmute(uuid);
  }

  setParticipantVideo(participant, vidio) {
    this.Client.SetParticipantVideo(participant, vidio);
  }

  Broadcasting(parms) {
    this.Client.Broadcasting(parms)
  }

  AcceptBroadcast(parms) {
    console.log("GC: AcceptBroadcast Method(): in service", parms);


    this.Broadcast.AcceptBroadcast(parms)//this.Client.AcceptBroadcast(parms)
  }

  PulicBroadCast(parms) {
    this.Client.PulicBroadCast(parms)
  }

  EndPulicBroadCast() {
    this.Client.EndCall();
  }
}
