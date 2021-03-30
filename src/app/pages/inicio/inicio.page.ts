import { Component, OnInit } from '@angular/core';

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
    }
  ]

  constructor() { }

  ngOnInit() {
  }

}
