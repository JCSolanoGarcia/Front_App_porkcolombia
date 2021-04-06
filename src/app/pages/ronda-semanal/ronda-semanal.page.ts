import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { RondaInterface } from 'src/app/interfaces/ronda-interface';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-ronda-semanal',
  templateUrl: './ronda-semanal.page.html',
  styleUrls: ['./ronda-semanal.page.scss'],
})
export class RondaSemanalPage implements OnInit {

  ronda= new RondaInterface();
  usuario= new UserInterface();
  usuarioLista: UserInterface[]=[];
  productoLista: any[] =[];
  mercadoLista: any[]=[];
  entregaLista: any[]=[];
  rondaLista: any[]=[];
  idDocumentosUser: any;
  decision: any;
  numeroSemana: any;
  finSemana: any;
  fecha = new Date().toLocaleString();
  year = new Date().getFullYear();
  codigo: any;
  controlCantidad: boolean = false;
  controlPeso: boolean = false;
  controlPrecio : boolean = false;
  id: any;
  formRonda: any = FormGroup;
  opcionesEnviar =["Si", "No"];
  participo= false;

  get producto(){
    
    return this.formRonda.get('producto');
  }
  get cantidad(){
    return this.formRonda.get('cantidad');
  }
  get peso(){
    return this.formRonda.get('peso');
  }
  get precio(){
    return this.formRonda.get('precio');
  }
  get mercado(){
    return this.formRonda.get('mercado');
  }
  get entrega(){
    return this.formRonda.get('entrega');
  }
  get envia(){
    return this.formRonda.get('envia');
  }

  public errorMensaje = {
    producto:[
      {type:'required', message: 'El producto es requerido'}
    ],
    cantidad:[
      {type:'required', message: 'La cantidad es requerida'},
      {type:'min', message: 'La cantidad debe ser mayor a 1' },
      {type:'max', message: 'La cantidad debe ser menor a 10000' }
    ],
    peso:[
      {type:'required', message: 'El peso es requerido'},
      {type:'min', message: 'El peso debe ser superior a 69 Kilos' },
      {type:'max', message: 'El peso debe ser inferior a 131 Kilos' }
    ],
    precio:[
      {type:'required', message: 'El precio es requerido'}
    ],
    mercado:[
      {type:'required', message: 'El mercado es requerido'}
    ],
    entrega:[
      {type:'required', message: 'El lugar de entrega es requerido'}
    ],
    envia:[
      {type:'required', message: 'Este campo es requerido'}
    ]    
  }

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private alertCtrl: AlertController
  ) {    
    this.crearFormulario();    
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.consultaEstado();
    //this.cargarDatos();       
  } 

  consultaEstado(){
    this.auth.getEstadoRonda().then(()=>{
      console.log(this.auth.estadoRonda);
      if(this.auth.estadoRonda == 'Inactivo'){
        this.auth.presentAlert('Señor porcicultor', 'En este momento no esta permitido ingresar registros a la ronda, gracias.')
        this.auth.salidaForzada();
      }else{
        this.cargarDatos();
      }
       
    })
  }

  cargarDatos(){
    this.numeroSemana = this.auth.numeroSemana;
    this.auth.getProducto().then(resp=>{
      this.productoLista = this.auth.listaProducto;
      //console.log(this.productoLista);      
    })
    this.auth.getLocalizacion().then(resp=>{
      this.mercadoLista = this.auth.listaMercados;
      //console.log(this.mercadoLista);      
    })    
    this.auth.getRondaHistorica().then(()=>{
      this.rondaLista = this.auth.listaRondaHistorica;
      //console.log(this.rondaLista);      
    })    
    this.auth.getUser().then(resp=>{
      this.usuarioLista = this.auth.listaUser;
      let i = 0
      //console.log(this.usuarioLista);      
      for(let user of this.usuarioLista){  
        //console.log('uno');         
        if(this.id == user.IdUsuario){ 
          //console.log('dos');
          this.usuario = {
            ...user
          }
          for(let ronda of this.rondaLista){
            //console.log('tres');
            if(ronda.Usuario == this.usuario.CodigoMostrar && ronda.Year == this.year && ronda.Semana == this.numeroSemana){
              this.participo = true;              
            }
          }
          this.idDocumentosUser = this.auth.listaIdUser[i];
          //console.log('prueba',this.usuario);
          //console.log('prueba',this.idDocumentosUser);
          localStorage.setItem('codigo', user.CodigoMostrar);
        }
        i++;
      }       
    })
    this.auth.getEntrega().then(resp=>{
      this.entregaLista = this.auth.listaEntrega;
      //console.log(this.entregaLista);
      this.userParticipo();      
    })    
     
    this.finSemana = this.auth.finSemana;    
    this.codigo = localStorage.getItem('codigo');
    this.ronda.Usuario = this.codigo;   
  }

  userParticipo(){
    if(this.participo){
      this.auth.presentAlert('Señor porcicultor', 'Usted ya participo durante la ronda de la semana en curso, solo se permite una participación por semana, gracias.')
      this.auth.salidaForzada();
    }
  }

  crearFormulario(){
    this.formRonda = this.fb.group({
      producto: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(2), Validators.max(10000)]],
      precio: ['', [Validators.required, Validators.minLength(2)]],
      peso: ['', [Validators.required, Validators.min(70), Validators.max(130)]],
      mercado: ['', Validators.required],
      entrega: ['', Validators.required],
      comentario: [''],
      envia: ['', Validators.required]
    });    
  }

  guardar(){   
    if(this.formRonda.invalid){
      this.auth.presentAlert('Atención', 'Es necesario diligenciar todos los campos obligatorios *');
      this.formRonda.markAllAsTouched();
      return;
    }   
    this.enviarProducto();  
  }

  enviarProducto(){ 
    let precioNo = document.getElementById('precio');
    if(this.formRonda.controls.producto.value == 'Cerdo en Pie'){
      if(this.formRonda.controls.precio.value >= 5000 && this.formRonda.controls.precio.value <= 8500){
        this.controlPrecio = false;
      }else {
        this.controlPrecio = true;
        this.auth.presentAlert('Atención', 'El precio que esta registrando esta por fuera del rango establecido para el producto seleccionado');
        precioNo?.focus();
        return;
      }
    } else if(this.formRonda.controls.producto.value != 'Cerdo en Pie' && this.formRonda.controls.producto.value != ''){
      if(this.formRonda.controls.precio.value >= 7000 && this.formRonda.controls.precio.value <= 12000){
        this.controlPrecio = false;
      }else{
        this.controlPrecio = true;
        this.auth.presentAlert('Atención', 'El precio que esta registrando esta por fuera del rango establecido para el producto seleccionado');
        precioNo?.focus();
        return;
      }
    }  
    this.ronda.Fecha = this.fecha;
    this.ronda.Semana = this.numeroSemana;
    this.ronda.UltimoDia = this.finSemana;
    this.ronda.Producto = this.formRonda.controls.producto.value;
    this.ronda.Cantidad = this.formRonda.controls.cantidad.value;
    this.ronda.Precio = this.formRonda.controls.precio.value;
    this.ronda.Peso = this.formRonda.controls.peso.value;
    this.ronda.Mercado = this.formRonda.controls.mercado.value;
    this.ronda.Entrega = this.formRonda.controls.entrega.value;
    this.ronda.Comentario = this.formRonda.controls.comentario.value;
    console.log(this.ronda);
    this.presentAlertConfirm();          
  }

  continuarRegistro(){
    this.auth.setRonda(this.ronda).then(resp=>{
      this.auth.presentAlert('Buen trabajo', 'Registro creado exitosamente!!!');      
      //this.usuarioParticipa();         
      if(this.formRonda.controls.envia.value == 'Si'){
        console.log("Continua...");
        this.formRonda.reset({
          producto:'',
          mercado:'',
          entrega:'',
          envia: '',
        });                      
      }else{
        console.log("Saliendo...");
        this.formRonda.reset({
          producto:'',
          mercado:'',
          entrega:'',
          envia: '',
        });
        this.auth.logOut();
      }                  
    }) 
  }

  async presentAlertConfirm() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: '¿Esta seguro?',
      message: '¿Esta seguro de registrar estos datos?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            //console.log('Confirm Cancel: blah');
            return;
          }
        }, {
          text: 'Ok',
          handler: () => {
            //console.log('Confirm Okay');
            this.continuarRegistro()
          }
        }
      ]
    });
    await alert.present();
  }
}
