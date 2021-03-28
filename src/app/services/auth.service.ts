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
  listaProducto : any = [];
  listaEntrega : any = [];
  estadoRonda: any = [];
  usuarioParticipa: any =[];
  listaRondaHistorica: any=[];
  total= 0;
  participantes = 0;
  numeroSemana: any; 
  finSemana: any;
  years:any= [];
  listaSemanas: any =[];
  listaOtra: any = [];
  uid: any;

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
        console.log("user", user.email);
        if(user){
          return this.afs.doc<UserInterface>(`user/ ${user.uid}`).valueChanges();         
        }else{
          return of(null);
        }
      })
    )

    this.estaAutenticado();
    //this.getProducto();
    //this.getEntrega();    
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
      var EndDate = new Date(today.setDate(date + 5));
      return [EndDate, (week-1)];
    }    
    let fechas = new Date().getWeek();
    this.numeroSemana = fechas[1];
    this.finSemana = fechas[0].toLocaleString();
  }

   async signIn(email, password){
    const loading = await this.loadingController.create({
      message: `Autenticando....`,
      spinner: `crescent`,
      showBackdrop: true,
    });
    loading.present();
    this.afauth.setPersistence(firebase.default.auth.Auth.Persistence.LOCAL)
    .then(()=>{
      this.afauth.signInWithEmailAndPassword(email, password).then((data)=>{
        let abc = data.user?.email;
        let idtoken:any = data.user?.refreshToken;
        if(!data.user.emailVerified){
          this.presentAlert('Atención', 'Este correo electrónico aun no ha sido verificado! Revise la bandeja de entrada de su correo electrónico')
          this.afauth.signOut();
        }else{
          this.guardarToken(idtoken);
          this.estaAutenticado();
          loading.dismiss();
          this.presentAlert('Bienvenido', abc)
          if( data.user?.uid == 'GMKCSg38KnOgzcbW2aB52Tzb3bp1'){
            this.router.navigateByUrl('/alert');   
          }else{
            this.router.navigateByUrl(`/ronda-semanal/${data.user?.uid}`);
          }                       
        }
      })
      .catch(error=>{
        this.presentAlert('Error', 'Correo o contraseña incorrectos')
      })
    })
    .catch(error=>{
      this.presentAlert('Error', 'Algo anda mal, verifica los datos y vuelve a intentarlo')
    })
  }// fin sign In

  async crear(dato: UserInterface){  
    return await this.afauth.createUserWithEmailAndPassword(dato.Email,dato.Password).then(userCredential =>{
      this.uid = userCredential.user?.uid;
      userCredential.user?.sendEmailVerification();
      this.presentAlert('Atención', 'Usuario creado exitosamente, para continuar revise la bandeja de entrada de su correo electrónico')
      return this.uid;
    }).catch(error=>{
      this.presentAlert('Atención', 'El correo electrónico ingresado ya esta registrado, utilice otro correo y vuelva a intentarlo')
    })   
  }

  async crearUser(datos: UserInterface, uid: string ){
    const userTemp1={
      Nombre : datos.Nombre,
      Apellido : datos.Apellido,
      Celular: datos.Celular,
      Granja: datos.Granja,
      Email: datos.Email,
      Localizacion : datos.Localizacion,
      CodigoMostrar : datos.CodigoMostrar,
      Estado: datos.Estado,
      IdUsuario: uid,
      Participa : false,
    }    
    return await this.afs.collection('Usuarios').doc().set(userTemp1).then(resp=>{
      
     }).catch(error=>{
      this.presentAlert('Atención', 'Ha ocurrido un error, por favor vuelve a intentarlo más tarde')
    })
  }

  recuperarContrasena(usuario: string){
    return this.afauth.sendPasswordResetEmail(usuario).then(resp=>{
      this.presentAlert('Atencion', 'Revise la bandeja de entrada de su correo electrónico para continuar')
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
      console.log("Deberia volver a login");
    })
  }

  /* async setUserParicipa(user: UserInterface,id: string){    
    const participa={
      Nombre : user.Nombre,
      Apellido : user.Apellido,
      Celular: user.Celular,
      Granja: user.Granja,
      Email: user.Email,
      Localizacion : user.Localizacion,
      CodigoMostrar : user.CodigoMostrar,
      Estado: user.Estado,
      IdUsuario: user.IdUsuario,
      Participa : true,
    }   
    return await this.afs.collection('Usuarios').doc(id).set(participa).then(resp=>{
      console.log('ok');      
     })
  } */

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
      this.presentAlert('Buen trabajo', 'Registro creado exitosamente!!!') 
    })
  }

  getUser(){        
    return this.afs.collection('Usuarios').get().forEach((element) => {
      this.listaUser.length=0;
      this.listaOtra=(element.docs);
      (element.docs).forEach((i:any)=>{        
        this.listaUser.push(i.data());
        this.listaIdUser.push(i.id)
        if(!i.data().Participa && i.data().Estado == 'Activo'){
          this.usuarioParticipa.push(i.data());
          this.total ++;
        }
        if(i.data().Participa && i.data().Estado == 'Activo'){
          this.participantes ++;
        }                                    
        return this.listaUser;
      })       
    })   
  }

  getRondaHistorica(){        
    return this.afs.collection('RondaHistorica').get().forEach((element) => {
      (element.docs).forEach((i:any)=>{
        if(i.data().Semana == this.numeroSemana){
          this.listaRondaHistorica.push(i.data());
        }        
        return this.listaRondaHistorica;
      })       
    })        
  }

  getLocalizacion(){        
    return this.afs.collection('Mercados').get().forEach((element) => {
      (element.docs).forEach((i:any)=>{
        this.listaMercados.push(i.data().Nombre);
        return this.listaMercados;
      })       
    })        
  }

  getProducto(){        
    return this.afs.collection('Productos').get().forEach((element) => {
      (element.docs).forEach((i:any)=>{
        this.listaProducto.push(i.data());        
        return this.listaProducto;
      })       
    })           
  }

  getEntrega(){        
    return this.afs.collection('Entrega').get().forEach((element) => {
      (element.docs).forEach((i:any)=>{
        this.listaEntrega.push(i.data());        
        return this.listaEntrega;
      })       
    })           
  }

  async salidaForzada(){
    return await this.afauth.signOut().then(()=>{    
      localStorage.clear();
      this.presentAlert('Señor porcicultor', 'Usted ya participo durante la ronda de la semana en curso, solo se permite una participación por semana, gracias.') 
      this.router.navigateByUrl('/inicio');
    })
  }

  logOut(){
    return this.afauth.signOut().then(()=>{    
      localStorage.clear();
      this.presentAlert('Atencion', 'Gracias por participar') 
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
