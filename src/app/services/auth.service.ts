import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import {Router } from '@angular/router';
import { AlertController, LoadingController, ToastController} from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { switchMap} from 'rxjs/operators';
import { UserInterface } from '../interfaces/user-interface';
import { RondaInterface } from '../interfaces/ronda-interface';


declare global {
  interface Date {
      getWeek (start?: Date) : [Date, Number]
  }
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<UserInterface>;
  user: UserInterface;
  userToken: any; 
  listaUser : any = [];
  listaIdUser : any=[];
  listaMercados : any = [];
  listaRangos : any = [];
  listaProducto : any = [];
  listaEntrega : any = [];
  estadoRonda: any = [];
  usuarioParticipa: any =[];
  listaRondaHistorica: any=[];
  numeroSemana: any; 
  finSemana: any;
  years:any= [];
  listaSemanas: any =[];
  listaOtra: any = [];
  uid: any;
  usuario;

  constructor(
    private afs: AngularFirestore,
    private afauth: AngularFireAuth,
    private router: Router,
    private loadingController: LoadingController,
    private toastcr: ToastController,
    private alertCtrl: AlertController
  ) {
    this.user$ = this.afauth.authState.pipe(
      switchMap( user => {
       
        if(user){
          return this.afs.doc<UserInterface>(`user/ ${user.uid}`).valueChanges();         
        }else{
          return of(null);
        }
      })
    )
    this.estaAutenticado(); 
    this.generarFechas();
   }

   generarFechas(){
    Date.prototype.getWeek = function(start: any){
      var d: any = new Date(+this);  //Creamos un nuevo Date con la fecha de "this".
      d.setHours(0, 0, 0, 0);   //Nos aseguramos de limpiar la hora.
      d.setDate(d.getDate() + 4 - (d.getDay() || 7)); // Recorremos los días para asegurarnos de estar "dentro de la semana"         
      start = start || 0;
      var onejan: any = new Date(this.getFullYear(), 0, 1);
      var week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);//Finalmente, calculamos redondeando y ajustando por la naturaleza de los números en JS:
      var today = new Date(this.setHours(0, 0, 0, 0));
      var day = today.getDay() - start;
      var date = today.getDate() - day;
      var StartDate = new Date(today.setDate(date));
      var EndDate = new Date(today.setDate(date + 6));
      return [EndDate, (week-1)];
    }    
    let fechas = new Date().getWeek();
    this.numeroSemana = fechas[1];
    this.finSemana = fechas[0].toLocaleString('en-US');  
  }

  async seguridad(data, userActivo){
    const loading = await this.loadingController.create({
      message: `Autenticando....`,
      spinner: `crescent`,
      showBackdrop: true,
    });
    loading.present();
    let abc = data.user?.email;
    let idtoken:any = data.user?.refreshToken;
    if(!data.user.emailVerified){
      loading.dismiss();
      this.presentAlert('Atención', 'Este correo electrónico aun no ha sido verificado! Revise la bandeja de entrada de su correo electrónico.')
      this.afauth.signOut();
    }else if(userActivo==true){
      this.guardarToken(idtoken);
      this.estaAutenticado();
      loading.dismiss();
      this.presentAlert('Bienvenido', abc)
      if( data.user?.uid == 'GMKCSg38KnOgzcbW2aB52Tzb3bp1'){
        this.router.navigateByUrl('/admin');   
      }else{
        this.router.navigateByUrl(`/ronda-semanal/${data.user?.uid}`);
      }                       
    }else{
      loading.dismiss();
      this.presentAlert('Atención', 'Estamos en proceso de verificación de los datos suministrados, pronto podrá acceder.')
    }
  }

  async signIn(email, password){
    let userActivo:boolean = false;
    this.afauth.setPersistence(firebase.default.auth.Auth.Persistence.LOCAL)
    .then(()=>{
      this.afauth.signInWithEmailAndPassword(email, password).then((data)=>{
        //Valida el estado de los usuarios para permitirles participar en la ronda
        this.getUser().then(resp=>{
          for(let user of this.listaUser){
            if(user.IdUsuario == data.user?.uid){
              if(user.Estado == "Activo"){                
                userActivo = true;
              }else{
                userActivo = false;
              }
            }
          }
          this.seguridad(data,userActivo);
        })        
      })
      .catch(error=>{
        this.presentAlert('Error', 'Correo o contraseña incorrectos.')
      })
    })
    .catch(error=>{
      this.presentAlert('Error', 'Algo anda mal, verifica los datos y vuelve a intentarlo.')
    })
  }// fin sign In

  async crear(dato: UserInterface){  
    return await this.afauth.createUserWithEmailAndPassword(dato.Email,dato.Password).then(userCredential =>{
      this.uid = userCredential.user.uid;
      userCredential.user?.sendEmailVerification();      
      return this.uid;
    }).catch(error=>{     
      this.presentAlert('Atención', 'El correo electrónico ingresado ya esta registrado o tiene un formato incorrecto, utilice otro correo y vuelva a intentarlo.');
    })   
  }

  async eliminarUser(mail, pass){
    this.afauth.setPersistence(firebase.default.auth.Auth.Persistence.LOCAL)
    .then(()=>{
      this.afauth.signInWithEmailAndPassword(mail, pass).then((data)=>{
        data.user.delete().then(ar=>{
          this.router.navigateByUrl('/registro');
          return;
        })          
      })
      .catch(error=>{        
        this.presentAlert('Error', 'Ha ocurrido un error.');
      })
    })
    .catch(error=>{      
      this.presentAlert('Error', 'Ha ocurrido un error.');
    })
  }

  async crearUser(datos: UserInterface ){
    const userTemp1={
      Nombre : datos.Nombre,
      Apellido : datos.Apellido,
      Celular: datos.Celular,
      Granja: datos.Granja,
      Email: datos.Email,
      Localizacion : datos.Localizacion,
      CodigoMostrar : datos.CodigoMostrar,
      Estado: datos.Estado,
      IdUsuario: datos.IdUsuario
    }    
    return await this.afs.collection('Usuarios').doc().set(userTemp1).then(resp=>{
      this.presentAlert('Atención', 'Usuario creado exitosamente, para continuar revise la bandeja de entrada de su correo electrónico.');
     }).catch(error=>{
      this.presentAlert('Atención', 'Ha ocurrido un error, por favor vuelve a intentarlo más tarde.')
    })
  }

  recuperarContrasena(usuario: string){
    return this.afauth.sendPasswordResetEmail(usuario).then(resp=>{
      this.presentAlert('Atencion', 'Revise la bandeja de entrada de su correo electrónico para continuar.')
      this.router.navigateByUrl('/login');
    })
  } 
  
  async signOut(){
    const loading = await this.loadingController.create({
      spinner:`crescent`,
      showBackdrop: true,
    })
    loading.present();
    this.afauth.signOut()
    .then(()=>{
      loading.dismiss();
      this.router.navigate(['/login']);
      //console.log("Deberia volver a login");
    })
  }

  async setRonda(ronda: RondaInterface){
    return await this.afs.collection('RondaHistorica').doc().set({
            Producto : ronda.Producto,
            Cantidad : ronda.Cantidad,
            Peso: ronda.Peso,
            Precio: ronda.Precio,
            Comentario: ronda.Comentario,
            Mercado: ronda.Mercado,
            Entrega: ronda.Entrega,
            Usuario: ronda.Usuario,
            Fecha: ronda.Fecha,
            Year: ronda.Year,
            Semana: ronda.Semana,
            UltimoDia: ronda.UltimoDia,            
    }).then(resp=>{
      this.presentAlert('Buen trabajo', 'Registro creado exitosamente!') 
    })
  }

  setEstadoRonda(estado:string){
    this.afs.collection('Estado').doc('1').set({Estado:estado, id:'1'});
  }

  async getUser(){        
    return this.afs.collection('Usuarios').get().forEach((element) => {
      this.listaUser.length=0;
      this.listaOtra=(element.docs);
      (element.docs).forEach((i:any)=>{        
        this.listaUser.push(i.data());
        this.listaIdUser.push(i.id);                             
        return this.listaUser;
      })       
    })   
  }

  async getRondaHistorica(){
    let anio:any=[];
    let sem: any=[];   
    this.listaRondaHistorica =[];    
    return await this.afs.collection('RondaHistorica').get().forEach((element) => {
      this.listaRondaHistorica.lenght = 0;
      (element.docs).forEach((i:any)=>{        
        this.listaRondaHistorica.push(i.data()); 
        anio.push(i.data().Year);
        sem.push(i.data().Semana);
        this.years = Array.from(new Set(anio));
        this.years.sort((a: any,b: any) =>a-b);
        this.listaSemanas = Array.from(new Set(sem));
        this.listaSemanas.sort((a: any,b: any) =>a-b);               
        return this.listaRondaHistorica;
      })       
    })        
  }

  getLocalizacion(){    
    this.listaMercados= [];    
    return this.afs.collection('Mercados').get().forEach((element) => {
      (element.docs).forEach((i:any)=>{
        this.listaMercados.push(i.data().Nombre);
        return this.listaMercados;
      })       
    })        
  }

  getProducto(){  
    this.listaProducto = [];      
    return this.afs.collection('Productos').get().forEach((element) => {
      (element.docs).forEach((i:any)=>{
        this.listaProducto.push(i.data());        
        return this.listaProducto;
      })       
    })           
  }

  getEntrega(){  
    this.listaEntrega = [];      
    return this.afs.collection('Entrega').get().forEach((element) => {
      (element.docs).forEach((i:any)=>{
        this.listaEntrega.push(i.data());        
        return this.listaEntrega;
      })       
    })           
  }

  getEstadoRonda(){
    this.estadoRonda = [];
    return this.afs.collection('Estado').get().forEach((element) => {
      (element.docs).forEach((i:any)=>{      
        this.estadoRonda=i.data().Estado;        
        return this.estadoRonda;
      })       
    })  
  }

  async salidaForzada(){
    return await this.afauth.signOut().then(()=>{    
      localStorage.clear(); 
      this.router.navigateByUrl('/inicio');
    })
  }

  async logOut(){
    return await this.afauth.signOut().then(()=>{    
      localStorage.clear();
      this.presentAlert('Señor Porcicultor', 'Gracias por participar y compartir su información.') 
      this.router.navigateByUrl('/inicio');
    })
  }

  private guardarToken(idToken: string){
    this.userToken = idToken;
    localStorage.setItem('token', idToken);
    let hoy = new Date();
    hoy.setSeconds(3600);
    localStorage.setItem('expira', hoy.getTime().toString());
  }

  estaAutenticado():boolean{
    this.userToken= localStorage.getItem('token');
    if(this.userToken == ''){
      return false;      
    }
    const expira=Number(localStorage.getItem('expira'));
    const expiraDate = new Date();
    expiraDate.setTime(expira);
    if(expiraDate > new Date()){
      return true;
    }else{
      return false;
    }
  }

  async presentAlert(a: string, b: string) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      backdropDismiss: false,
      header: a,
      message: b,
      buttons: ['OK']
    });
    await alert.present();
  }
  
  async toast(message, status){
    const toast = await this.toastcr.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }
}
