import { Injectable, Output} from "@angular/core";
import { StorageService } from "./storage.service";
declare const CVDOTOK: any;

@Injectable({
  providedIn: "root",
})
export class VdkcallBroadcastServiceService {
  @Output() public Broadcast: any;
  constructor() {}

  public initConfigure(): void {
    try {
      const user = StorageService.getUserData();

      this.Broadcast = new CVDOTOK.Broadcast({
        projectId: "739GDLR",//"1RN1RP",
        host: `${user.media_server_map.complete_address}`,
        stunServer: `${user.stun_server_map.complete_address}`,
        ignorePublicIP: true,
      });

      this.Broadcast.on("connected", (res) => {
        let user = StorageService.getUserData();
        console.log(
          "**** Broadcast ==== initConfigure: \n\n",
          user,
          user.ref_id.toString(),
          user.authorization_token.toString()
        );

        this.Broadcast.Register(
          user.ref_id.toString(),
          user.authorization_token.toString()
        );
      });
    } catch (e) {
      console.error(e);
    }
  }

  AcceptBroadcast(parms) {
    console.log("GC: AcceptBroadcast Method(): in service", parms);

    this.Broadcast.AcceptBroadcast(parms); //this.Client.AcceptBroadcast(parms)
  }
}
