import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] =[]
  pushListener = new EventEmitter<OSNotificationPayload>();
  userId : string;

  private _storage: Storage | null = null;
  constructor(
    private oneSignal: OneSignal,
    private storage: Storage,
    private http: HttpClient,
  ) {
    this.init();
    this.cargarMensajes();
   }
   async init() {
     //this.getNewReleases();
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  async getMensajes(){
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  async deleteMensaje(){
    await this.storage.remove('mensajes');
    this.mensajes = [];
    this.guardarMensajes();
  }

  confiracionInicial(){
    this.oneSignal.startInit('333eabbc-5a73-4e56-9375-7fb8f9461a86', '531521260136');
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
    // do something when notification is received
    console.log('notificación recibida', noti);
    this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (noti) => {
      // do something when a notification is opened
      console.log('notificación abierta', noti);
      await this.notificacionRecibida(noti.notification)
    });
    //codigo del suscriptor

    this.oneSignal.getIds().then(info=>{
      this.userId= info.userId
    })

    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification){
    await this.cargarMensajes();
    const payload = noti.payload;
    const existePush = this.mensajes.find( mensaje=> mensaje.notificationID === payload.notificationID)
    if(existePush){
      return;
    }
    console.log('mensaje aqui');
    
    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);
    await this.guardarMensajes();
  }

  guardarMensajes(){
    this.storage.set('mensajes', this.mensajes);
    console.log("mensaje guardado");
    
  }

  async cargarMensajes(){
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }
}
