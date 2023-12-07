const express = require('express');
const db = require("./db.js");
const fs = require('fs');
const {join} = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const body_parser = require('body-parser');
const path = require('path');
const multer=require('multer');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const {dbConfig}=require('./config');
const base_url = path.join(__dirname,'public/');
const moment = require('moment'); 
const cookieParser = require('cookie-parser')

const firebase = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");


let app = express();
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true}));
const sessionStore = new MySQLStore(dbConfig);
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    secure: false,
    httpOnly: true
  }
}));


app.use(cookieParser()); 
app.use(express.static(join(__dirname, '/public')));
// app.use(express.static(join(__dirname, '')));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
const upload_dir = join(__dirname,'public/img/uploads/');
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, './public/img/uploads/'),
	filename:    (req, file, cb) => cb(null, Date.now()+file.originalname)
});
  
const upload = multer({storage});
  


require('dotenv').config()



firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
  });

//! ///////////////////////////////////////////////////////////
//! //////////////////!   ROUTERS   //////////////////////////
//! ///////////////////////////////////////////////////////////




app.get([`/app`,], async (req, res,) => { 
	const {session_id} = req.cookies;
	console.log(session_id,"cookie")
	// console.log(req.cookies)
	if(req.session.loggedin==true){
		res.sendFile(base_url+'/app.html');
	
	}
	else{

		res.redirect("/login-user")

	}

});

app.get([`/login-user`,], async (req, res,) => { 

	const {session_id} = req.cookies;
	// console.log(session_id,"cookie",req.session.loggedin,"session")
	console.log(!session_id,"cookie")

	if(req.session.loggedin==true){
		res.redirect("/app")

	}
	else{
		res.sendFile(base_url+'/login_user.html');

	}


});

app.get([`/login-corporate`,], async (req, res,) => { 
	
		
	if(req.session.loggedin==true){
		res.redirect("/corporate")

	}
	else{
		res.sendFile(base_url+'/login_corporate.html');

	}


});

app.get([`/corporate`,], async (req, res,) => { 
	console.log(req.session.loggedin,"corporate session")
	if(req.session.loggedin==true){
		res.sendFile(base_url+'/corporate.html');

	}
	else{
		res.redirect("/login-corporate")

	}

});


app.get([`/login-admin`,], async (req, res,) => { 



	if(req.session.loggedin==true){
		res.redirect("/admin")


	}
	else{
		res.sendFile(base_url+'/login_admin.html');

	}

});

app.get([`/admin`,], async (req, res,) => { 
	// console.log(req.session.loggedin,"corporate session")
	if(req.session.loggedin==true){
		res.sendFile(base_url+'/admin.html');

	}
	else{
		res.redirect("/login-admin")

	}

});


 




//! ///////////////////////////////////////////////////////////
//! //////////////////!    classes   //////////////////////////
//! ///////////////////////////////////////////////////////////

 app.post(`/get_current_admin`, async (req, res,) => { 
						 
	// var user = await db.select("*","company",  {username: username});
	var current_admin=req.session.user
	res.send({"current_admin":current_admin, "success":true });
});


  
app.post(`/uploads`, upload.single('file'), (req, res, next) => {
	let file = req.file;
	let result = {};
	result['file_name'] = file.filename;  
	res.send(result);
});

//! ///////////////////////////////////////////////////////////
//! //////////////////!    administrateur    //////////////////////////
//! ///////////////////////////////////////////////////////////


  
  app.post(`/chart`, async (req, res,) => { 
	let information= await db.between();
	let informationday2= await db.between2();
	res.send({"information":{information, informationday2}, "success":true });
  });
  

app.post('/create_companies', async (req, res) =>{
	try{
	 
	  const {name,secteur, mail,  password, username, phone, role}=req.body.information;
	  var message = `Bonjour, nous vous informons que votre compte entreprise a été crée ,
username:  ${username}
password:  ${password}
Afin de vous y connecter veuillez vous rendre sur www.algeriainvestconference-btob.com.`
	  var subject = `Activation de votre compte B to B AIC - Algeria Invest Conference`	
	  const hash = await bcrypt.hash(password, 10);
	  console.log(hash)
	  var companies= await db.insert("company", {name: name,phone:phone,role: role ,secteur:secteur,mail:mail , password: hash, username:username});
	  main( message, mail, subject)  
	  res.send({"ok":true });
	}catch(e) {
	  console.log(e)
	  res.status(500).send('something broke!');
	}
	
});
  
  app.post(`/create_users`, async (req, res,) => { 
	var data = req.body
	let user= data.information
	var users= await db.insert("user",user)
	res.send({"ok":true });
	
  });
  //
  
  app.post(`/update_company`, async (req, res,) => { 
	var {id , company_info} = req.body;
	await db.update("company",company_info, {id} );
	res.send({"ok":true });
  });
  app.post(`/update_user`, async (req, res,) => { 
	var {id , user_info} = req.body;
	await db.update("user",user_info, {id} );
	res.send({"ok":true });
  });

//! ///////////////////////////////////////////////////////////
//! //////////////////!   PICKUP APPOINTMENT  //////////////////////////
//! ///////////////////////////////////////////////////////////

  app.post(`/get_unavailability`, async (req, res,) => {
		var {user_id,current_user} =req.body

		
		var unavailability = await get_users_unavailability(user_id,current_user)
		console.log(unavailability,"ça marche !")

		res.send({"ok":true ,unavailability});
			// user from || to 
  })


  async function get_users_unavailability(user_id,current_user){
	let user_unavailability=[]
	let current_user_unavailability=[]

	var user_appointments = await db.searchById('appointment',user_id, "indexed");
	var current_user_appointments =await db.searchById('appointment',current_user, "indexed");



	for(let element of  Object.values(user_appointments)){

		user_unavailability.push(moment(element.start).format('YYYY-MM-DD HH:mm:ss'))
	}

	for( let element of  Object.values(current_user_appointments)){
		current_user_unavailability.push(moment(element.start).format('YYYY-MM-DD HH:mm:ss'))
	}

	var new_array = [...user_unavailability,...current_user_unavailability]
	let unavailability= [...new Set(new_array)]
	return unavailability

  }
  
  app.post(`/update_appointments_status`, async (req, res,) => {
	console.log('im on update appointments')

	var {user_id,current_user,appointment,obj} =req.body

	let appointment_id=appointment.id
	let appointment_start=moment(appointment.start).format('YYYY-MM-DD HH:mm:ss')

	if(obj.status=="1"){
		
		var unavailability = await get_users_unavailability(user_id,current_user)

		console.log(unavailability,"ça marche !")
		for(dateTime of unavailability){
			if(dateTime == appointment.start){
				console.log("slot not disponible")
				res.send({"ok":false ,error:"slot not disponible"});
			}
		}
	
			await db.update("appointment",obj, {id:appointment_id});


			let user_appointments = await db.searchById2('appointment',user_id, "indexed","0",appointment_start);
			let current_user_appointments = await db.searchById2('appointment',current_user, "indexed","0",appointment_start);
			
			
			for(let element of Object.values(user_appointments)){
				if(!element)continue
				let appointment_id=element.id
				await db.update("appointment",{status:2}, {id:appointment_id});
			}

			for(let element of Object.values(current_user_appointments)){
				if(!element)continue
				let appointment_id=element.id
				await db.update("appointment",{status:2}, {id:appointment_id});
			}

			try {
				
				let from_user=await db.select('*', "users", {id:current_user}, "row");
				let user_to_notify=await db.select('*', "users", {id:user_id}, "row");
				let user_token=user_to_notify.token
				await send_push_notification(user_token,"Demande de rendez-vous acceptée",`Votre demande de rendez-vous avec ${from_user.first_name} ${from_user.last_name} a été acceptée.`)

				res.send({"ok":true});
			} catch (error) {
				res.send({"ok":false});
				
			}

			console.log(user_appointments,'user appointments')
			console.log(current_user_appointments,'user appointments')

	
			
		
	
	}

	
	
});



//! ///////////////////////////////////////////////////////////
//! //////////////////!   GENERAL   //////////////////////////
//! ///////////////////////////////////////////////////////////

app.post(`/add_to_database`, async (req, res,) => {

    let {obj, table_name } = req.body;	
	console.log(obj,table_name,"je suis add to data")
    try {

		if(table_name=="companies"){
			var password = obj.password_backup
			const hash = await bcrypt.hash(password, 10);
			obj.password = hash
		}
		if(table_name=="users"){
			if(obj.password_backup){
				var password = obj.password_backup
				const hash = await bcrypt.hash(password, 10);
				obj.password = hash
				
			}
			var item_exist= await check_item_exist(table_name,{phone:obj['phone']})
			console.log(item_exist,'item_existe')
			
			if(item_exist==true){
				// check_item_exist(table_name,key,item)
				res.send({"ok":false, "error":"Ce numéro de téléphone existe déjà"});
				return
			}
		}
		var id= await db.insert(table_name, obj);
		var result = await db.select('*', table_name, {id: id}, "indexed");

		if(table_name=="appointment"){
			try {
				let from_user=await db.select('*', "users", {id:obj.from_id}, "row");
				let user_to_notify=await db.select('*', "users", {id:obj.to_id}, "row");
				let user_token=user_to_notify.token
				await send_push_notification(user_token,"Nouvelle demande de rendez-vous.",`Vous avez reçu une nouvelle demande de rendez-vous de la part de ${from_user.first_name} ${from_user.last_name}`)
				

			} catch (error) {
				console.log(error)
			}
		}

		if(table_name=="users"){
			try {
				
				await mailCompteUser(obj.email,obj.phone,obj.password_backup)

			} catch (error) {
				console.log(error)
			}
		}




		res.send({"reponses":result, "id":id,"ok":true})
    } catch (error) {
        console.log(error)		
        res.send({"ok":false, "error":error});
    }
});



app.post('/send_session_name', async (req, res,) => {

	res.send( {"userid": req.session.id });
});


app.post('/load_items', async (req, res,) => {
    let result = {};
    let {table_name, where} = req.body
    result[table_name] = await db.select('*', table_name, where, "indexed");
	res.send({"reponses":result, "success":true });

});

app.post(`/update_to_database`, async (req, res,) => {
    let {id, obj, table_name } = req.body;
    try {
		
		if(table_name=="accounts"){
			var password = obj.backup_psw
			const hash = await bcrypt.hash(password, 10);
			obj.hash = hash
		}
		if(table_name=="exposants" && obj.password != '' && obj.status != 'Oui'){
			console.log(obj.password)
			var password = obj.password
			const hash = await bcrypt.hash(password, 10);
			obj.hash = hash
		}
	

        await db.update(table_name,obj, {id} );
        var result = await db.select('*', table_name, {id: id}, "indexed");

		if(table_name=="companies" && obj.user_limit){
			let email=obj.email
			try {
				// await mailCompteCorporate(email)
			  } catch (error) {
				console.log(error);
			  }
			 
		}
		res.send({"reponses":result, "id":id,"ok":true})

    } catch (error) {
        res.send({"ok":false, "error":error});
    }
});
app.post(`/edit_user_disabled`, async (req, res,) => {
    let {id} = req.body;
	let result = {}
    try {
		console.log(req.body, id)

        await db.update('users',{is_deleted : 1 }, {id_company : id} );
         result['users'] = await db.select('*', 'users', {is_deleted : 0 }, "indexed");

		res.send({"reponses":result, "id":id,"ok":true})

    } catch (error) {
        res.send({"ok":false, "error":error});
    }
});
console.log('')
app.post(`/update_notification_token`, async (req, res,) => {
    let {token, user_id} = req.body;
	let result = {}
    try {
		console.log(req.body, " je suis update notification")

        await db.update('users',{token : token }, {id : user_id} );
         result['users'] = await db.select('*', 'users', {id : user_id }, "indexed");

		res.send({"reponses":result, "id":id,"ok":true})

    } catch (error) {
        res.send({"ok":false, "error":error});
    }
});
app.post(`/edit_picture_user`, async (req, res,) => {
    let {id, picture} = req.body;
	let result = {}
    try {
		console.log(req.body, id)

        await db.update('users',{picture : picture }, {id : id} );
         result['users'] = await db.select('*', 'users', {id : id }, "indexed");

		res.send({"reponses":result, "id":id,"ok":true})

    } catch (error) {
        res.send({"ok":false, "error":error});
    }
});


app.post(`/delete_from_database`, async (req, res,) => {
	console.log('delete function')

    let {id,table_name} = req.body;
	console.log('delete function')

    try {
        await db.delete(table_name,{id});
        res.send({"ok":true});
		console.log('delete function')

    } catch (error) {
        console.log(error)
        res.send({"ok":false, "error":error});
    }
});


async function check_item_exist(table_name,item){

	

	var result = await db.select('*', table_name, item, "indexed");
	console.log(Object.keys(result).length==0,"condition")

	if(Object.keys(result).length===0){
		return false
	}else{
		return true
	}
		
};


async function mailAppointment(type,user_id){
	console.log('test send my mail::: ')

	var data= await db.select("*","users",  {id:user_id});
	var user=data[0]


	var mailOption = {
		from: `contact@algeriainvestconference-btob.com`,
		to: user.email, 
	}

	if (type=="confirmation"){
		mailOption.subject="Confirmation de rendez-vous AIC B2B"
		mailOption.text="Un de vos rendez-vous demandé à été confirmé, veuillez vous connecter sur la plateforme afin de voir les détails https://algeriainvestconference-btob.com/login-user" 
	}else if (type=="nouveau"){
		mailOption.subject="Nouveau rendez-vous AIC B2B"
		mailOption.text="Vous avez reçu une nouvelle demande de rendez-vous, veuillez vous connecter sur la plateforme B2B afin d'en savoir plus. https://algeriainvestconference-btob.com/login-user"

	}
	
		mailConfig(mailOption)
	
}



async function mailCompteUser(email,username,password){
	console.log('test send my mail::: ')

	
	
		var mailOption = {
		  from: `contact@algeriainvestconference-btob.com`,
		  to: email, 
		  subject: `Compte utilisateur AIC B2B`  , 
		  
		  html:`
		  <div style="padding : 10px;"  > 
			<div style="text-align: center; font-weight: 600; color: #1f1f3a ;padding: 15px; font-size: 30px;">Compte Utilisateur AIC B2B</div><br>
		<div style="text-align: center; padding: 15px;">      
		<img style="height: 150px;text-align: center;" src=""https://algeriainvestconference-btob.com/img/logo_aic_color.jpg" alt=""><br></div><br>
			<div style="text-align: center; font-weight: 500; color: #1f1f3a ;padding: 15px 20px; font-size: 20px;">Votre compte utilisateur AIC B2B a été crée</div>	  
			<div style="text-align: center; font-weight: 400; color: #1f1f3a ;padding: 0px 20px; font-size: 15px;">Voici vos identifiants : <br> - Username : ${username}<br>- Password:${password}</div>	  
			<div id="open" style="border-radius: 8px;padding: 10px;margin: 15px auto; display: grid;place-items: center; width:100px;  color: white; background-color:#ac542c; text-decoration: none;font-weight: bold;text-align: center;"><a  href="https://algeriainvestconference-btob.com/login-user" target="_blank"><div style="font-weight: bold; color: white"  >Lien</div></a></div>	  
		  </div>
		  `
		}
		mailConfig(mailOption)
	
	 
		
}


async function mailCompteCorporate(email){
	console.log('test send my mail::: ')

	
	
		var mailOption = {
		  from: `contact@algeriainvestconference-btob.com`,
		  to: email, 
		  subject: `Augmentation de la limite utilisateur`  , 
		  
		  html:`
		  <div style="padding : 10px;"  > 
			<div style="text-align: center; font-weight: 600; color: #1f1f3a ;padding: 15px; font-size: 30px;">limite comptes utilisateurs</div><br>
		<div style="text-align: center; padding: 15px;">      
		<img style="height: 150px;text-align: center;" src=""https://algeriainvestconference-btob.com/img/logo_aic_color.jpg" alt=""><br></div><br>
			<div style="text-align: center; font-weight: 400; color: #1f1f3a ;padding: 0px 20px; font-size: 15px;">Vous pouvez maintenant vous connecter sur votre espace AIC corporate et ajouter de nouveaux utilisateurs</div>	  
			<div id="open" style="border-radius: 8px;padding: 10px;margin: 15px auto; display: grid;place-items: center; width:100px;  color: white; background-color:#ac542c; text-decoration: none;font-weight: bold;text-align: center;"><a  href="https://algeriainvestconference-btob.com/login-corporate" target="_blank"><div style="font-weight: bold; color: white"  >Lien</div></a></div>	  
		  </div>
		  `
		}
		mailConfig(mailOption)
	
	 
		
	  }




	  async function mailConfig(option){
  
		let transporter = nodemailer.createTransport({
		  name: 'mail.algeriainvestconference-btob.com',
			host: 'mail.algeriainvestconference-btob.com',
			port: 465,
			secure: true,
			auth: {
			  user: "contact@algeriainvestconference-btob.com",
			  pass: "contact022", 
			},
			debug: true,
			logger : true
		  });
	  
		return new Promise((resolve, reject) => {
		  transporter.verify(function(error, success){
			if(error){
			  console.log(error);
			  reject("Could not verify");
			}else{
			 
			
			  console.log('server is ready to send message ')
			  transporter.sendMail(option, (error, info) => {
				if(error){
				  console.log(error);
				  let log=` <br> Mail non envoyé à ${option.to}, date: ${Date.now()},id_mail: ${info.messageId}, error : ${error} <br>`
				  fs.appendFile('./myLogs.txt',log, function (err) {
					if (err) throw err;
					// print output
					console.log('Saved logs!');
				  });
				  reject(error);
				}
				// var info_mail= info.messageId
				console.log('Message sent : %s', info.messageId);
				let log=` <br>Mail envoyé à ${option.to}, date: ${Date.now()},id_mail: ${info.messageId} <br>`
				fs.appendFile('./sendedMails.txt',log, function (err) {
				  if (err) throw err;
				  // print output
				  console.log('Saved logs!');
				});
				resolve();
			  })
			}
		  })
		});
	  
	   } 
	  


//! ///////////////////////////////////////////////////////////
//! //////////////////!   AUTHENTIFICATIONS    //////////////////////////
//! ///////////////////////////////////////////////////////////


// app.post('/register', async (req, res) =>{
// 	try{
// 		const {name,email, password, username,secteur,type}=req.body;
// 		const hash = await bcrypt.hash(password, 10);
// 		if(type="compagnies"){
// 			await db.insert("compagnies", {name:name,email: email, password:hash,password_backup:password, secteur:secteur,username:email});

// 		}else{

// 			await db.insert("accounts", {email: email, hash: hash, username:username});

// 		}

// 		console.log(hash)
// 		res.status(200).json('all good');
// 	}catch(e) {
// 		console.log(e)
// 		res.status(500).send('something broke!');
// 	}
	
// });


app.post('/auth', async (req, res) => {
    
    try{
      var {email, password, type}=req.body;
	  if(type == "admin"){
		var user = await db.select("*","admin",  {email: email,});
        if(user.length != 0){
          const validPass = await bcrypt.compare(password, user[0].password);
          if (validPass == true) {    
			console.log(user[0].id,"je suis le user id")
              req.session.email = email;
              req.session.id = user[0].id;
              req.session.loggedin = true;
              req.session.CurrentUser = user[0]
			  res.cookie("session_id",user[0].id,{
										path: '/app',
										
									})
              res.send({ok:'ok', route : 'app'})             
          }else{
            res.send('mistak in password')  
          }
        }else{
          
            res.send('/');
        }
	  }else if(type == "users"){
		var user = await db.select("*","users",  {email: email, is_deleted: 0});
        console.log(user);
        if(user.length != 0){
          const validPass = await bcrypt.compare(password, user[0].password);
          if (validPass == true) {    
			console.log(user[0].id,"je suis le user id")
              req.session.email = email;
              req.session.id = user[0].id;
              req.session.loggedin = true;
              req.session.CurrentUser = user[0]
			  res.cookie("session_id",user[0].id,{
										path: '/app',
										
									})
              res.send({ok:'ok', route : 'app'})             
          }else{
            res.send('mistak in password')  
          }
        }else{
          
            res.send('/');
        }
	  }
       
   }
   catch(e) {
       console.log(e)
       res.send('/');
   }
});

app.post('/register', async (req, res) => {
	
	try{
	  var {user_data,company_data, type}=req.body;
	  console.log(user_data,company_data, type)
	  if(type.type == 'company'){
		var company=await db.select("*","companies",  {nif: company_data.nif , is_deleted: 0},"row");
	  }else if(type.type == 'organisme'){
		var company=await db.select("*","companies",  {name: company_data.name, is_deleted: 0},"row");

	  }
	  if(company){
		let company_id=company.id
		user_data.id_company=company_id
		let password = user_data.password_backup
		const hash = await bcrypt.hash(password, 10);
		user_data.password = hash
		var user_id= await db.insert("users", user_data);

	  }else{
		var company_id= await db.insert("companies", company_data);
		console.log(company_id,"je suis company id")
		user_data.id_company=company_id
		let password = user_data.password_backup
		const hash = await bcrypt.hash(password, 10);
		user_data.password = hash

		var user_id= await db.insert("users", user_data);
		console.log(user_id)

		
	  }
	  res.send({"success":true})
   }
   catch(e) {
	   console.log(e)
	   res.send({"error":"Indentifiants invalides"});
   }
});


app.post(`/logOut`, async (req, res,) => { 

	if(req.session){
		req.session.destroy(err => {
			if (err) {	
				console.log(err)
			  res.status(400).send('Unable to log out')
			} else {
			  res.send({"success":true})
			}
		  });
	}

});

//! ///////////////////////////////////////////////////////////
//! //////////////////!   FIREBASE NOTIFICATIONS  //////////////////////////
//! ///////////////////////////////////////////////////////////


	function send_push_notification(user_token,title,body){
		const message = {
			notification: {
			  title: title,
			  body: body,
			},
			token: user_token, // Le token récupéré côté frontend
		  };
		  
		  firebase.messaging().send(message)
			.then((response) => {
			  console.log("Successfully sent message:", response);
			})
			.catch((error) => {
			  console.error("Error sending message:", error);
			});
	}


let port = process.env.PORT;
if (port == null || port == "") {
  port = 80;
}
app.listen(port, () => console.log("running on ", port));