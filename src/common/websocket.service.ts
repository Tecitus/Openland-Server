import ws from 'ws';
import https from 'https';
/* eslint-disable */
export class WebSocketService
{
    public websocket : ws.Server;

    constructor(httpsserver:https.Server)
    {
        this.Init(httpsserver);
    }

    Init(httpsserver:https.Server)
    {
        this.websocket = new ws.Server({
            server: httpsserver
        });
        webSocketService = this;
        this.websocket.on("connection", (ws, request)=>{
            ws.on('txconfirm',(msg)=>{
                undefined;
            })
        })
    }
}

export let webSocketService : WebSocketService;