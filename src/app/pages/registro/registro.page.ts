import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  usuario= new UserInterface();
  usuarioLista: UserInterface[]=[];
  mercadoLista: any[]=[];
  formRegistro:any= FormGroup;
  usercreado: any;
  acepto: any;

  get nombre(){
    return this.formRegistro.get('nombre');
  }
  get email(){
    return this.formRegistro.get('email');
  }
  get celular(){
    return this.formRegistro.get('celular');
  }
  get apellido(){
    return this.formRegistro.get('apellido');
  }
  get granja(){
    return this.formRegistro.get('granja');
  }
  get localizacion(){
    return this.formRegistro.get('localizacion');
  }
  get password(){
    return this.formRegistro.get('password');
  }
  
  public errorMensaje = {
    nombre:[
      {type:'required', message: 'El nombre es requerido.'},
      {type:'minlength', message: 'El nombre debe tener mas de 2 caracteres.' }
    ],
    apellido:[
      {type:'required', message: 'El apellido es requerido.'},
      {type:'minlength', message: 'El apellido debe tener mas de 2 caracteres.' }
    ],
    celular:[
      {type:'required', message: 'El celular es requerido.'},
      {type:'minlength', message: 'El celular debe tener mas de 10 números.' },
      {type:'maxlength', message: 'El celular debe tener mas de 10 números.' }
    ],
    granja:[
      {type:'required', message: 'La granja es requerida.'},
      {type:'minlength', message: 'La granja debe tener mas de 2 caracteres.' }
    ],
    localizacion:[
      {type:'required', message: 'La localizacion es requerida.'}
    ],
    email:[
      {type:'required', message: 'El correo electrónico es requerido.'},
      {type:'pattern', message: 'Por favor ingrese un correo electrónico valido.' }
    ],
    password:[
      {type:'required', message: 'El password es requerido.'},
      {type:'minlength', message: 'El password debe tener mas de 6 caracteres.' }
    ]/* ,
    acepto:[
      {type: 'required', message: 'Es obligatorio aceptar.'}
    ] */
    
  }

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.crearFormulario();
   }

  ngOnInit() {
    

    /* this.auth.getLocalizacion().then(resp=>{
      this.mercadoLista = this.auth.listaMercados;
      console.log(this.mercadoLista);
    })  */      
  }

  crearFormulario(){
    this.formRegistro = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['',[Validators.required, Validators.minLength(2)]],
      granja: ['',[Validators.required, Validators.minLength(2)]],
      celular: ['',[Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      password: ['',[Validators.required, Validators.minLength(6)]],
      email: ['',[Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      localizacion: ['', Validators.required],      
    });
    
  }

  guardar(){ 
    this.acepto = document.getElementById('acepto'); 
    if(!this.formRegistro.valid){
      this.formRegistro.markAllAsTouched();
      return;
    }else{
      if(this.acepto.checked){
        this.usuario.Nombre = this.formRegistro.controls.nombre.value;
        this.usuario.Apellido = this.formRegistro.controls.apellido.value;
        this.usuario.Granja = this.formRegistro.controls.granja.value;
        this.usuario.Localizacion = this.formRegistro.controls.localizacion.value;
        this.usuario.Celular = this.formRegistro.controls.celular.value;
        this.usuario.Email = this.formRegistro.controls.email.value;
        this.usuario.Password = this.formRegistro.controls.password.value;
        //console.log(this.usuario);
        this.crearUser();      
      } else{
        this.auth.presentAlert('Atención', 'Para continuar debe aceptar las politicas de privacidad y proteccion de datos.');
        return;
      }
    }    
  }

  crearUser(){
    this.auth.crear(this.usuario).then(resp=>{
      this.usercreado = this.auth.uid;      
      if(this.usercreado == undefined){
        this.formRegistro.reset({
          localizacion: '',
        })
        return this.router.navigateByUrl('/inicio');
      }
      if(this.usercreado != ''){
        this.auth.getUser().then(resp=>{
          this.usuarioLista = this.auth.listaUser; 
          this.crearUsuario();
        });
      }
    })
  }

  crearUsuario(){       
    let codigoAlmacenado : any;
    let listaCodigos=[];
    let indexCodigo;
    let numCodigo;
    let aux: boolean = true;    
    if(this.usuarioLista.length){      
      for (let user of this.usuarioLista) {               
        if(user.Localizacion == this.formRegistro.controls.localizacion.value){                    
          listaCodigos.push(user.CodigoMostrar);
          aux = false;                    
        }      
      }
    }    
    if(!aux){     
      indexCodigo = listaCodigos.length-1;
      numCodigo = parseInt(listaCodigos[indexCodigo].slice(-3))+1;            
      codigoAlmacenado = (listaCodigos[indexCodigo].slice(0,3)) + numCodigo.toString().padStart(3,'0') ;
    }else{
      codigoAlmacenado = (this.formRegistro.controls.localizacion.value).slice(0,3) + '001';
    }
    this.usuario.CodigoMostrar = codigoAlmacenado;  
    //console.log(this.usuario.CodigoMostrar);       
    this.auth.crearUser(this.usuario, this.usercreado).then(resp=>{
      this.formRegistro.reset({
        localizacion: '',
      })
      this.auth.presentAlert('Buen trabajo', 'Su usuario se ha creado exitosamente!')      
      this.router.navigateByUrl('/inicio');
    })    
  }

  
}
