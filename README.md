# Vdotok QuickStart Source for Group Call Demo
This is a demo project to demonstrate using  Group call demo with Angular 9+.

## Live Demo
 Fellow the link below to visit the live demo
 
  <a href="http://m2m.vdotok.com" target="_blank" title="Chat Demo">Live Demo</a> 
  
 
## Prerequisites

Node.js and npm are essential to Angular development. 
    
<a href="https://docs.npmjs.com/getting-started/installing-node" target="_blank" title="Installing Node.js and updating npm">
Get it now</a> if it's not already installed on your machine.
 
**Verify that you are running at least node `v4.x.x` and npm `3.x.x`**
by running `node -v` and `npm -v` in a terminal/console window.
Older versions produce errors.

We recommend [nvm](https://github.com/creationix/nvm) for managing multiple versions of node and npm.


## Project Signup and Project ID

Follow the link below register your self for chat server and get the project Id
	https://www.kuchtohoga.com/norgic/chatSDK/
  
## How to run it locally

Clone this repo into new project folder (e.g., `my-proj`).
```shell
git clone https://github.com/vdotok/JS-m2m.git
cd my-proj

```

## Install npm packages

> See npm and nvm version notes above

Install the npm packages described in the `package.json` and verify that it works:

```shell
npm install
npm run serve
```
Open browser application is running at <a href="http://localhost:4200" target="_blank" title="localhost">
http://localhost:4200</a> 

Create new account using sign up form and use the application

###  How to generate and install build 
Follow the commands below to build
 
```shell
   ng build 
   ng build --aot --configuration production --build-optimizer --outputHashing=all
```


### How to configure SDK.
You need to add SDK into your index.html file .After that decalar a variable in your component  orservice

```shell
declare const MVDOTOK: any;

```

user provided config to init SDK

```shell
    const Client = new MVDOTOK.Client({
      projectID: "****",
      secret: "********************",
    });
    Client.on("authenticated", (res) => {
      let user = StorageService.getUserData();
      this.Client.Register(user.ref_id.toString(), user.authorization_token.toString());
    });
```
### SDK Events


```
  Client.on("groupCall", (response) => {

    if (response.type == "CALL_RECEIVED") {
    <!-- when user received incomming call below is response that will be received -->
      <!--response = {
         call_type: "video"
         from: "09529f186637f2a67bc682a33b42af31"
         message: "Received a call"
         session: "many_to_many"
         type: "CALL_RECEIVED"
     } -->
       
    }

    if (response.type == "NEW_PARTICIPANT") {
     <!-- when new user accept a call then other user received this event -->
     
       <!--    
      response = {
           message: "New participant arrived."
           participant: "8fb657fb54417ebf1e2b8c2a04d1f1a2"
           type: "NEW_PARTICIPANT"
      }
      -->
    }

    if (response.type == "PARTICIPANT_LEFT") {
     <!-- when new user leave a call then other user received this event. Below is response that will be received -->
      <!--    
      response = {
        message: "Participant left."
        participant: "8fb657fb54417ebf1e2b8c2a04d1f1a2"
        type: "PARTICIPANT_LEFT"
      }
      -->
     
    }

    if (response.type == "PARTICIPANT_STATUS") {
     <!-- when user turn on off camara Below is response that will be received -->
         
    <!--    
       response = {
          audio_status: 1
          message: "Participant Status"
          participant: "09529f186637f2a67bc682a33b42af31"
          type: "PARTICIPANT_STATUS"
          video_status: 1
       }
    -->    
          
    }

});

```

### SDK Methods

**Start Video Call**
This method is used to start video call

```
   const params = {
      call_type: "video",
      localVideo: document.getElementById("localVideo"),
      to: [ref_id_Array],
    }
   Client.groupCall(params);
 ```
 
 
**Start Audio Call**
This method is used to start Audio call

```
   const params = {
      call_type: "video",
      localVideo: document.getElementById("localAudio"),
      to: [ref_id_Array],
    }
   Client.groupCall(params);
 ```

**join Group Call**

When receiver received incomming call.	

```
const params = {
      localVideo: document.getElementById("localVideo"),
      call_type: 'video'  //audio
  }
  Client.joinGroupCall(params);
```


