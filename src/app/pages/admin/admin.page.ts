import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { RondaInterface } from 'src/app/interfaces/ronda-interface';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { AuthService } from 'src/app/services/auth.service';

import * as XLSX from 'xlsx';
import { ChartDataSets, ChartOptions, ChartType, Chart } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  @ViewChild('barCanvas') private barCanvas: ElementRef;  
  barChart: any;
  @ViewChild('barCanvas1') private barCanvas1: ElementRef;
  barChart1: any;
  
  numeroSemana: any; 
  year =new Date().getFullYear();
  listaMercados:any=[];
  rondaSemanal: any =[];
  conteoPieBog= 0;
  conteoCalienteBog = 0;
  conteoFriaBog = 0;
  conteoPieAnt= 0;
  conteoCalienteAnt = 0;
  conteoFriaAnt = 0;
  conteoPieVal= 0;
  conteoCalienteVal = 0;
  conteoFriaVal = 0;
  conteoPieEje= 0;
  conteoCalienteEje = 0;
  conteoFriaEje = 0;
  conteoPieCos= 0;
  conteoCalienteCos = 0;
  conteoFriaCos = 0;
  conteoPieBogP= 0;
  conteoCalienteBogP = 0;
  conteoFriaBogP = 0;
  conteoPieAntP= 0;
  conteoCalienteAntP = 0;
  conteoFriaAntP = 0;
  conteoPieValP= 0;
  conteoCalienteValP = 0;
  conteoFriaValP = 0;
  conteoPieEjeP= 0;
  conteoCalienteEjeP = 0;
  conteoFriaEjeP = 0;
  conteoPieCosP= 0;
  conteoCalienteCosP = 0;
  conteoFriaCosP = 0;

  estadoActual: any;

  rondaLista : RondaInterface[]=[];
  usuarioLista: UserInterface[]=[];
  participantes : number = 0;
  totalUsuarios: number = 0;
  siParticipa: any[]=[];
  participa: any[]=[];
  idUsuariosLista: any[]=[];
  noParticipa: any[]=[];
  listaUser: any[]=[];

  title= 'exportExcel';
  fileName = 'Usuarios Sin Registro.xlsx'

  listaYear: any=[];
  semanaLista: any =[];
  rondaLista1: any=[];
  anio: any='';
  sem: any ='';
  flag= false;
  yearSel: any;
  weekSel: any;

  title1= 'exportExcel';
  fileName1 = 'Ronda Semanal.xlsx'
  constructor(
    private auth: AuthService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.cargarLocalizacion();        
  }

  diferenciaDeArreglos(arr1: any[], arr2: any[]){
    return arr1.filter(elemento => arr2.indexOf(elemento) == -1);
    }

  cargaEstado(){
    this.auth.getEstadoRonda().then((a)=>{
      this.estadoActual = this.auth.estadoRonda;
    });
  }

  consulta(){
    this.usuarioLista.length = 0;
    this.auth.getUser().then(resp=>{      
      this.usuarioLista = this.auth.listaUser;
    });
    this.auth.getRondaHistorica().then(()=>{ 
      this.rondaSemanal =  this.auth.listaRondaHistorica;  
      for(let user of this.usuarioLista){
        this.idUsuariosLista.push(user.CodigoMostrar);
        this.totalUsuarios ++;        
        for(let ronda of this.rondaSemanal){        
          if(ronda.Semana == this.numeroSemana && ronda.Year == 2021){           
            if(user.CodigoMostrar == ronda.Usuario && user.Estado == "Activo"){
              this.participa.push(user.CodigoMostrar);
            }
          }
        }
      }
      this.datos();
    })
  }

  datos(){
    this.siParticipa = Array.from(new Set(this.participa));
    this.participantes= this.siParticipa.length; 
    if(this.siParticipa.length != 0){
      this.noParticipa = this.diferenciaDeArreglos(this.siParticipa, this.idUsuariosLista);
    }else{
      this.noParticipa = this.diferenciaDeArreglos(this.idUsuariosLista, this.siParticipa);
    }
    for(let user of this.usuarioLista){
      for(let p of this.noParticipa){
        if(user.CodigoMostrar != 'Bog001' && p == user.CodigoMostrar){
          this.listaUser.push(user);          
        }
      }      
    }    
  }

  cargarLocalizacion(){
    this.auth.getLocalizacion().then(resp=>{
      this.listaMercados= this.auth.listaMercados;      
      this.cargaEstado();
      this.usuarioLista.length =0;
      this.consulta();
      setTimeout(() => {
        this.consultarRondaActual();
      }, 1500);    
      //this.consultarRondaActual();
      this.numeroSemana = this.auth.numeroSemana;
      this.cargaInicial();      
    });
  }

  consultarRondaActual(){
    console.log(this.rondaSemanal);    
    for(let registro of this.rondaSemanal){        
      if(registro.Semana == this.numeroSemana && registro.Year == this.year){
        if(registro.Producto == 'Cerdo en Pie' && registro.Mercado == 'Bogotá'){
          this.conteoPieBog ++;
        }
        if(registro.Producto == 'Canal Caliente' && registro.Mercado == 'Bogotá'){
          this.conteoCalienteBog ++;
        }
        if(registro.Producto == 'Canal Fría' && registro.Mercado == 'Bogotá'){
          this.conteoFriaBog ++;
        }
        if(registro.Producto == 'Cerdo en Pie' && registro.Mercado == 'Antioquia'){
          this.conteoPieAnt ++;
        }
        if(registro.Producto == 'Canal Caliente' && registro.Mercado == 'Antioquia'){
          this.conteoCalienteAnt ++;
        }
        if(registro.Producto == 'Canal Fría' && registro.Mercado == 'Antioquia'){
          this.conteoFriaAnt ++;
        }
        if(registro.Producto == 'Cerdo en Pie' && registro.Mercado == 'Valle del Cauca'){
          this.conteoPieVal ++;
        }
        if(registro.Producto == 'Canal Caliente' && registro.Mercado == 'Valle del Cauca'){
          this.conteoCalienteVal ++;
        }
        if(registro.Producto == 'Canal Fría' && registro.Mercado == 'Valle del Cauca'){
          this.conteoFriaVal ++;
        }
        if(registro.Producto == 'Cerdo en Pie' && registro.Mercado == 'Eje Cafetero'){
          this.conteoPieEje ++;
        }
        if(registro.Producto == 'Canal Caliente' && registro.Mercado == 'Eje Cafetero'){
          this.conteoCalienteEje ++;
        }
        if(registro.Producto == 'Canal Fría' && registro.Mercado == 'Eje Cafetero'){
          this.conteoFriaEje ++;
        }
        if(registro.Producto == 'Cerdo en Pie' && registro.Mercado == 'Costa Atlántica'){
          this.conteoPieCos ++;
        }
        if(registro.Producto == 'Canal Caliente' && registro.Mercado == 'Costa Atlántica'){
          this.conteoCalienteCos ++;
        }
        if(registro.Producto == 'Canal Fría' && registro.Mercado == 'Costa Atlántica'){
          this.conteoFriaCos ++;
        }                 
      }
    } 
    this.consultarRondaAnterior();         
  }

  consultarRondaAnterior(){    
    for(let registro of this.rondaSemanal){
        //this.numeroSemana
      if(registro.Semana == (this.numeroSemana-1) && registro.Year == this.year){
        if(registro.Producto == 'Cerdo en Pie' && registro.Mercado == 'Bogotá'){
          this.conteoPieBogP ++;
        }
        if(registro.Producto == 'Canal Caliente' && registro.Mercado == 'Bogotá'){
          this.conteoCalienteBogP ++;
        }
        if(registro.Producto == 'Canal Fría' && registro.Mercado == 'Bogotá'){
          this.conteoFriaBogP ++;
        }
        if(registro.Producto == 'Cerdo en Pie' && registro.Mercado == 'Antioquia'){
          this.conteoPieAntP ++;
        }
        if(registro.Producto == 'Canal Caliente' && registro.Mercado == 'Antioquia'){
          this.conteoCalienteAntP ++;
        }
        if(registro.Producto == 'Canal Fría' && registro.Mercado == 'Antioquia'){
          this.conteoFriaAntP ++;
        }
        if(registro.Producto == 'Cerdo en Pie' && registro.Mercado == 'Valle del Cauca'){
          this.conteoPieValP ++;
        }
        if(registro.Producto == 'Canal Caliente' && registro.Mercado == 'Valle del Cauca'){
          this.conteoCalienteValP ++;
        }
        if(registro.Producto == 'Canal Fría' && registro.Mercado == 'Valle del Cauca'){
          this.conteoFriaValP ++;
        }
        if(registro.Producto == 'Cerdo en Pie' && registro.Mercado == 'Eje Cafetero'){
          this.conteoPieEjeP ++;
        }
        if(registro.Producto == 'Canal Caliente' && registro.Mercado == 'Eje Cafetero'){
          this.conteoCalienteEjeP ++;
        }
        if(registro.Producto == 'Canal Fría' && registro.Mercado == 'Eje Cafetero'){
          this.conteoFriaEjeP ++;
        }
        if(registro.Producto == 'Cerdo en Pie' && registro.Mercado == 'Costa Atlántica'){
          this.conteoPieCosP ++;
        }
        if(registro.Producto == 'Canal Caliente' && registro.Mercado == 'Costa Atlántica'){
          this.conteoCalienteCosP ++;
        }
        if(registro.Producto == 'Canal Fría' && registro.Mercado == 'Costa Atlántica'){
          this.conteoFriaCosP ++;
        }              
      }
    }      
    this.barChartMethod();   
  }

  barChartMethod() {
    // Now we need to supply a Chart element reference with an object that defines the type of chart we want to use, and the type of data we want to display.
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [this.listaMercados[0],this.listaMercados[1],this.listaMercados[2],this.listaMercados[3],this.listaMercados[4] ],
        datasets: [
          {
            label: 'Cerdo en Pie',
            backgroundColor: [
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            hoverBackgroundColor: [
              '#FFCE56',
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#FF6384'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            data: [this.conteoPieAnt, this.conteoPieEje,this.conteoPieVal, this.conteoPieCos, this.conteoPieBog],
            
            borderWidth: 1
          },
          {
            label: 'Canal Caliente',
            data: [this.conteoCalienteAnt, this.conteoCalienteEje,this.conteoCalienteVal, this.conteoCalienteCos, this.conteoCalienteBog],
            backgroundColor: [
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            hoverBackgroundColor: [
              '#FFCE56',
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#FF6384'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          },
          {
            label: 'Canal Fría',
            data: [this.conteoFriaAnt, this.conteoFriaEje,this.conteoFriaVal, this.conteoFriaCos, this.conteoFriaBog],
            backgroundColor: [
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            hoverBackgroundColor: [
              '#FFCE56',
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#FF6384'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }
        ],
      },
     
    });
    this.barChart1 = new Chart(this.barCanvas1.nativeElement, {
      type: 'bar',
      data: {
        labels: [this.listaMercados[0],this.listaMercados[1],this.listaMercados[2],this.listaMercados[3],this.listaMercados[4] ],
        datasets: [
          {
            label: 'Cerdo en Pie',
            backgroundColor: [
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            hoverBackgroundColor: [
              '#FFCE56',
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#FF6384'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            data: [this.conteoPieAntP, this.conteoPieEjeP, this.conteoPieValP, this.conteoPieCosP, this.conteoPieBogP],
            
            borderWidth: 1
          },
          {
            label: 'Canal Caliente',
            data: [this.conteoCalienteAntP, this.conteoCalienteEjeP, this.conteoCalienteValP, this.conteoCalienteCosP, this.conteoCalienteBogP],
            backgroundColor: [
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            hoverBackgroundColor: [
              '#FFCE56',
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#FF6384'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          },
          {
            label: 'Canal Fría',
            data: [this.conteoFriaAntP, this.conteoFriaEjeP, this.conteoFriaValP, this.conteoFriaCosP, this.conteoFriaBogP],
            backgroundColor: [
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            hoverBackgroundColor: [
              '#FFCE56',
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#FF6384'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }
        ],
      },     
    });
  }

  cargaInicial(){
    this.auth.getRondaHistorica().then(resp=>{      
      this.listaYear= this.auth.years;
      this.semanaLista = this.auth.listaSemanas;
      console.log(this.listaYear);
      console.log(this.semanaLista);      
    })        
  }

  cargaExcel(){    
    if(!this.weekSel && !this.yearSel){
      this.auth.presentAlert('Atención', 'Recuerde seleccionar un año y una semana!!!');
    }else{    
      for(let registro of this.rondaSemanal){ 
        console.log(registro);                     
        if(registro.Semana == this.weekSel && registro.Year == this.yearSel){
          this.rondaLista1.push(registro);
        }
      }
      console.log(this.rondaLista1);  
      setTimeout(() => {
        this.exportToExcel1();
      }, 2000);      
    }    
  }

  exportToExcel1(): void{
    let element = document.getElementById('excel-table1');
    const ws = XLSX.utils.table_to_sheet(element);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Reporte Semanal');
    XLSX.writeFile(wb,this.fileName1);
  }

  exportToExcel(): void{
    let element = document.getElementById('excel-table');
    let ws = XLSX.utils.table_to_sheet(element);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Sin Registros');
    XLSX.writeFile(wb,this.fileName);
  }
  
  async presentAlertConfirm() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: '¿Esta seguro?',
      message: 'Este cambio afecta el acceso a la ronda',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            return;
          }
        }, {
          text: 'Ok',
          handler: () => {
            if(this.estadoActual =='Activo'){
              this.auth.setEstadoRonda('Inactivo');     
            }else{
              this.auth.setEstadoRonda('Activo'); 
            }   
            this.cargaEstado();
          }
        }
      ]
    });
    await alert.present();
  }
}
