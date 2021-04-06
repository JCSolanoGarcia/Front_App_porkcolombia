import { ApplicationRef, Component, OnInit } from '@angular/core';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { PushService } from 'src/app/services/push.service';

interface Componente{
  icon: string;
  name: string;
  redirectTo: string;
}

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  componentes: Componente[]=[
    
    {
      icon: 'person-add-outline',
      name: 'Registrarme',
      redirectTo: '/registro'
    },
    {
      icon: 'log-in-outline',
      name: 'Ingresar',
      redirectTo: '/login'
    },
    {
      icon: 'help-circle-outline',
      name: 'Ayuda',
      redirectTo: '/ayuda'
    },
    {
      icon: 'mail-unread-outline',
      name: 'Mensajes',
      redirectTo: '/alert'
    }
  ]
  
  constructor(
    public pushService: PushService,
  ) { }

  ngOnInit() {
  }

}
