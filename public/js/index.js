

GV={ swipers:{},initialize_page:{}}

GV.dates={
    "2023-12-18":{day:"Lundi",slots:["10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00","17:00:00"]},
    "2023-12-19":{day:"Mardi",slots:["08:00:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00","17:00:00"]},
}

GV.user_disponibility=[]
GV.deferredPrompt=null


const firebaseConfig = {
    apiKey: "AIzaSyAZuVXDC6TLWoQYnMhZ1uO_U-5LoTB_Dbo",
    authDomain: "aicbtob.firebaseapp.com",
    projectId: "aicbtob",
    storageBucket: "aicbtob.appspot.com",
    messagingSenderId: "148632971252",
    appId: "1:148632971252:web:8424d908ec9e33a234bba1"
};
  
const vapidKey = {
    publicKey: "BMr90_YT6VnmyuE_LhhJm2Reu3Up160x9a8bZVE-EynHuXX1WRmLu3xKPd6hYcVtRmMHsqMAWYJ6nFmX_W7wCfQ",
}
  


  
//! /////////////////////////////////////////////////////////// 
//! //////////////////!   READY   //////////////////////////
//! ///////////////////////////////////////////////////////////

$(document).ready(  async function () {

    moment.locale('fr');
    await get_session_id_cookies ()
    check_socket()

    await load_items ('appointment',{to_id:GV.session_id},  reload = true)
    await load_items ('appointment',{from_id:GV.session_id},  reload = true)


    await load_items ('companies',{is_deleted: 0},  reload = false)
    await load_items ('users',{is_deleted: 0},  reload = false)

    let data = await ajax('/loadNotifications',{id:GV.session_id}); 
    console.log(data)
    if(data.success){   
        index_items(data.reponses)
    }

    

    initialBadgeNotification()

    display_welcome_top_bar()

    display_appointments({status:1},'#confirmed_appointments_container',"2023-12-18")
    displayNearestAppointment()
   
    
    app_navigate_to("home_page");
    
 

    display_count_appointment({status:1},"#confirmed_appointments_count")
    display_count_appointment({status:0},"#pending_appointments_count")

    

    await notifyMe()


    check_if_wpa()
 

   

});



function check_if_wpa(){
   
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        // La PWA est déjà installée
       
        console.log('La PWA est déjà installée.');
    } else {
        // La PWA n'est pas encore installée
        if(!isIOS()){
            window.addEventListener('beforeinstallprompt', (event) => {
                alert(" beforeinstallprompt a été déclenché")
                console.log('L\'événement beforeinstallprompt a été déclenché.');
                // Empêcher l'affichage de l'invite automatique
                event.preventDefault();
               
                // Stocker l'événement pour l'utiliser plus tard
                GV.deferredPrompt = event;
              
                // Afficher votre propre popup pour proposer l'ajout à l'écran d'accueil
                showAddToHomeScreenPopup();
            });
    
        }else{
          
            $("#overlay").css("display","block")
            $("#wpa_popup_container_ios").css("display","grid")
        }
    
       
        console.log('La PWA n\'est pas encore installée.');
    }
}

function isIOS() {
    // Check if the user agent indicates iOS
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}


function showAddToHomeScreenPopup() {
    // Afficher votre propre popup
    const popupContainer = document.getElementById('wpa_popup_container');
    popupContainer.style.display = 'block';
    $("#overlay").css("display","block")

    // Ajouter un gestionnaire d'événements pour le bouton "Ajouter"
    const addButton = $('#add_wpa_btn');
    addButton.addEventListener('click', () => {
        alert("clicked")
        // L'utilisateur a choisi d'installer l'application
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              
                $("#overlay").css("display","none")
                console.log('L\'utilisateur a accepté l\'installation de l\'application.');
            } else {
                // $("#wpa_popup_container").css("display","none")
                $("#overlay").css("display","none")

                console.log('L\'utilisateur a refusé l\'installation de l\'application.');
            }
            deferredPrompt = null;
            // Masquer le popup après la décision de l'utilisateur
            popupContainer.style.display = 'none';
        });
    });

    // Vous pouvez ajouter d'autres actions pour gérer le bouton "Annuler" ou des interactions similaires
}




async function get_user_token(){
  
    messaging.getToken({ vapidKey: vapidKey.publicKey })
    .then( async (currentToken)  => {
      if (currentToken) {
        let data = await ajax('/update_notification_token',{user_id:GV.session_id,token:currentToken}); 
        console.log('Token:', currentToken);
        if(data.ok){
            
            console.log(`token updated ${currentToken}`)
        }
        // Envoyez ce token au backend pour l'enregistrement
      } else {
        console.log('Permission denied.');
      }
    })
    .catch((error) => {
      console.error('Erreur lors de la demande de permission:', error);
    });
}

async function notifyMe() {
    if (!("Notification" in window)) {
      // Check if the browser supports notifications
    //   alert("This browser does not support mobile notification");
      console.log("This browser does not support mobile notification")
    } else if (Notification.permission === "granted") {
        app = firebase.initializeApp(firebaseConfig);
        messaging = app.messaging()

       console.log(Notification.permission)
        await get_user_token()
      // Check whether notification permissions have already been granted;
      // if so, create a notification
    //   const notification = new Notification("Hi there!");
      // …
    } else if (Notification.permission !== "denied") {
      // We need to ask the user for permission
      $(".popup_notification, #overlay").css("display","grid")

      Notification.requestPermission().then(async (permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
            app = firebase.initializeApp(firebaseConfig);
            messaging = app.messaging()
           await get_user_token()
        //   const notification = new Notification("Hi there!");
          // …
        }
      });
    }
  
    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them anymore.
  }

  onClick("#authorize_notifications", async function(){
    $(".popup_notification").css("display","none")
   

    })

  onClick(".exit_wpa_popup", async function(){
    $("#overlay").css("display","none")
    $("#wpa_popup_container_ios").css("display","none")
   
    })



//! /////////////////////////////////////////////////////////// 
//! //////////////////!  GENERAL  //////////////////////////
//! ///////////////////////////////////////////////////////////







function app_navigate_to(page_name){


    $(".page, #bars_menu_container, #overlay").css('display','none')

    $(`.page[data-id="${page_name}"]`).css('display','block')
    if(!GV.initialize_page[page_name]) return;
    GV.initialize_page[page_name]();
    GV.page_name = page_name


} 



onClick(".link_app", function(){
    if(!$(this).data('id')) return;
    sendDataToFlutter('vibrate')
    $('.link_app').removeClass('selected_link_app')
    $(this).addClass('selected_link_app')
    app_navigate_to($(this).data('id'));
  })

function display_welcome_top_bar(){
    if(GV.session_id=="")return
    let first_name = GV.users[GV.session_id].first_name
    let last_name= GV.users[GV.session_id].last_name

    let html=`<div>${last_name} ${first_name}</div>`
    $('#welcome_top_bar').html("")
    $('#welcome_top_bar').html(html)
}  
 
function display_appointments(filters,$selector,selected_date){
    // let selected_date=$('.toggle_confirmed_date.active').data('id'); //Ex: 2021-11-07
    let content=GV.dates[selected_date];
    let html="";
    let empty=0;
    // console.log(content)

    for(var time of content.slots){
        let datetime=`${selected_date} ${time}`;
        filters.start=datetime
        empty+=get_html_appointment(filters)

        html+=`
        ${get_html_appointment(filters)}
        `
    }
   
    $($selector).html("")
  
    if(empty=="0"){
        console.log("je suis là")
        $($selector).html(`<div class="w100 grid center" style="padding:45px 0px;color:gray">Aucun element trouvé</div>`)
    }else{
        $($selector).html(html)

    }


}  

function get_html_appointment(filters){

    var html=""

  
    for( var element of Object.values(GV.appointment)){

        if(!element)continue
        if(!check_appointments_filters (element, filters))continue
        let user_id=element.from_id == GV.session_id  ?  element.to_id : element.from_id 
        let user=GV.users[user_id]
        var  start_date=element.start
        var formated_start_hour= moment(start_date).format('HH[H]mm');
        let formated_start_date= moment(start_date).calendar();
        if(filters.status==1){
          
            html+=`
            <div class="appointment_element center" data-id="${element.id}">
                <div class="w100"  style="display:grid;grid-template-columns:45px 1fr;gap:10px">
                    <div class="user_avatar"><img src="./img/uploads/${user.picture}"></div>
                    <div class="w100">
                        <div class="bold">${element.from_id == GV.session_id ? GV.users[element.to_id].last_name : GV.users[element.from_id].last_name} ${element.from_id == GV.session_id ? GV.users[element.to_id].first_name : GV.users[element.from_id].first_name}</div>
                        <div style="font-size:14px">${element.from_id == GV.session_id ? GV.users[element.to_id].poste : GV.users[element.from_id].poste } à ${element.from_company_id==GV.users[GV.session_id].id_company ? GV.companies[element.to_company_id].name : GV.companies[element.from_company_id].name}</div>
                    </div>
                </div>
                <div class="w100" style="background-color:#87878733;padding:7px;display:grid;grid-template-columns:1fr 1fr;margin-top:15px;border-radius:10px">
                    <div class="w100" style="display:flex;place-item:center;gap:10px;color:#767676">
                        <i class="fa-regular fa-calendar" style="place-self: center;"></i>
                        <div>${formated_start_date}</div>
                    </div>
                    <div style="display:flex;place-item:center;gap:10px;color:#767676">
                        <i class="fa-regular fa-clock" style="place-self: center;"></i>
                        <div>${formated_start_hour} à ${addMinutesToTime(start_date, 30) }</div>
                    </div>
                   
                </div>
                
            </div>
    
            `
         
        }else if(filters.status==0){
            console.log(user,"je suis user")
            html+=`
            <div class="pending_appointment_element center" data-id="${element.id}">
                <div class="w100"  style="display:grid;grid-template-columns:45px 1fr;gap:10px">
                    <div class="user_avatar"><img src="./img/uploads/${user.picture}"></div>
                    <div class="w100">
                        <div class="bold">${user.first_name} ${user.last_name}</div>
                        <div style="font-size:14px">${element.from_id == GV.session_id ? GV.users[element.to_id].poste : GV.users[element.from_id].poste } à ${element.from_company_id==GV.users[GV.session_id].id_company ? GV.companies[element.to_company_id].name : GV.companies[element.from_company_id].name}</div>
                    </div>
                </div>
                <div class="w100" style="background-color:#87878733;padding:7px;display:grid;grid-template-columns:1fr 1fr;margin-top:15px;border-radius:10px">
                    <div class="w100" style="display:flex;place-item:center;gap:10px;color:#767676">
                        <i class="fa-regular fa-calendar" style="place-self: center;"></i>
                        <div>${formated_start_date}</div>
                    </div>
                    <div style="display:flex;place-item:center;gap:10px;color:#767676">
                        <i class="fa-regular fa-clock" style="place-self: center;"></i>
                        <div>${formated_start_hour} à ${addMinutesToTime(start_date, 30) }</div>
                    </div>

                </div>
            

            </div>

            `
            
        }
        // console.log(html.length)
       
    }
    return html
  

}

function display_appointment_details_drawer(id_appointment){
    openDrawer()
    let appointment=GV.appointment[id_appointment]
    let user_id=appointment.from_id == GV.session_id  ?  appointment.to_id : appointment.from_id 
    let user=GV.users[user_id]
    let company_id=appointment.from_company_id == user.id_company  ?  appointment.to_company_id : appointment.from_company_id
    let company=GV.companies[company_id]



    var  start_date=appointment.start
    var formated_start_hour= moment(start_date).format('HH[H]mm');
    let formated_start_date= moment(start_date).calendar();
    let buttons_html="" 
   if(appointment.from_id != GV.session_id && appointment.status==0) buttons_html=`<div id="decline_btn"  class="cursor" style="border: solid 2px rgb(255, 255, 255);padding: 8px 25px;border-radius: 8px;" data-id="${appointment.id}">Décliner</div>
    <div id="confirm_btn" class="cursor" style="background-color: #DF7241;padding: 8px 25px;border-radius: 8px;" data-id="${appointment.id}">Accepter</div>`
    if(appointment.status!=0) buttons_html=`<a class="cursor" style="background-color: #DF7241;padding: 8px 25px;border-radius: 8px;" href="tel:${user.phone}">Appeler</a>`  

    let html=`
    <div class="drawer_header">
        <div class="" style="grid-template-columns: 100px 1fr;height: fit-content;">
            <div></div>
            <span class="material-symbols-outlined exit" style="font-size: 35px">arrow_back_ios</span>
        </div>
        <div class="w100 h100" style="display:flex;place-items: center;place-self: center;flex-direction: column;gap: 10px;">
            <div class="user_avatar"><img src="./img/uploads/${user.picture}"></div>
            <div>
                <div style="font-size: 21px;text-align:center">${user.first_name} ${user.last_name}</div>
                <div style="text-align:center">${user.poste} à ${company.name}</div>
            </div>
            <div class="details_appointment_drawer_buttons" style="display:flex;gap:20px;">
                ${buttons_html}
            </div>
        </div>
        
    </div>
    <div class="drawer_body">
        <div class="w100" style="background-color:#87878733;padding:15px;display:grid;grid-template-columns:1fr 1fr;place-items: center;">
            <div class="w100" style="display:flex;place-content:center;gap:10px;color:#767676">
                <i class="fa-regular fa-calendar" style="place-self: center;"></i>
                <div>${formated_start_date}</div>
            </div>
            <div style="display:flex;place-content:center;gap:10px;color:#767676">
                <i class="fa-regular fa-clock" style="place-self: center;"></i>
                <div>${formated_start_hour} à ${addMinutesToTime(start_date, 30) }</div>
            </div>
        
        </div>
        <div class="w100" style="padding:20px">
            <div>Message</div>
            <div style="width: 100%;min-height: 110px;padding: 15px;border-radius: 8px;background-color: rgb(246, 246, 246);"></div>
        </div>
    </div>

    `
    $("#appointment_details_drawer").html()
    $("#appointment_details_drawer").html(html)
}


function check_appointments_filters (appointment,filters){
    // console.log(appointment.status !=filters.status,"merde")
    // console.log(filters,appointment.status,appointment.status !=filters.status)
    var formated_appointment_start= moment(appointment.start).format('YYYY-MM-DD HH:mm:ss'); 
    // console.log(formated_appointment_start)
      if(!filters) filters={};

      if(filters.from  && appointment.from_id !=filters.from) return false;
      if(filters.to && appointment.to_id!=filters.to) return false;
      if(filters.status !=undefined && appointment.status !=filters.status) return false;
      if(filters.start && formated_appointment_start!=filters.start) return false;
      if(filters.day && appointment.day !=filters.day ) return false;

      return true;  
    }
      
  

function find_information_from_obj(obj,information){
    if(!obj)return
    // var new_obj=obj[id]
    var find= obj[information]
    console.log(find)
    return find

}


//! /////////////////////////////////////////////////////////// 
//! //////////////////!  HOME PAGE  //////////////////////////
//! ///////////////////////////////////////////////////////////
GV.initialize_page.home_page= async function(){

    await load_items ('appointment',{to_id:GV.session_id},  reload = true)
    await load_items ('appointment',{from_id:GV.session_id},  reload = true)


    await load_items ('companies',{is_deleted: 0},  reload = false)
    await load_items ('users',{is_deleted: 0},  reload = false)

    let date=$('#home_page').find(".selected_date_filter_btn").data("id")
    // display_count_appointment()
    display_count_appointment({status:1},"#confirmed_appointments_count")
    display_count_appointment({status:0},"#pending_appointments_count")
    display_appointments({status:1},'#confirmed_appointments_container',date)
    displayNearestAppointment()

}

onClick(".date_filter_btn",function(){
    sendDataToFlutter('vibrate')

    $('.date_filter_btn').removeClass('selected_date_filter_btn')
    $(this).addClass('selected_date_filter_btn')

    display_appointments({status:$(this).data("status")},$(this).data("target"),$(this).data('id'))
})



function display_count_appointment(filters,$selector){

    var i=0
    for( var element of Object.values(GV.appointment)){
        if(!check_appointments_filters (element, filters))continue
        i=i+1
       
    }
    console.log(i,"get count")
    $(`${$selector}`).html("")
    $(`${$selector}`).html(i)
}


onClick('.appointment_element', function(){
    if(!$(this).data("id"))return
    if($(this).hasClass("ph-item"))return
    display_appointment_details_drawer($(this).data("id"))

});

onClick('.exit', function(){

    closeDrawer()

});

function displayNearestAppointment(){

   let html=""
   let next_appointment= getNextClosestAppointment()
   console.log("je suis le prochain rendez-vous",next_appointment) 
   if(next_appointment){
        var formated_next_appointment_start= moment(next_appointment.start).format('YYYY-MM-DD HH:mm:ss'); 
        let filters={status:1,start:formated_next_appointment_start}
    
        html=`${ get_html_appointment(filters)
        }`
 
   }else{
    html=`<div class="w100 grid center" style="padding:45px 0px;color:gray">Aucun element trouvé</div`
   }
   $("#nextClosestAppointment").html()
   $("#nextClosestAppointment").html(html)

}


function getNextClosestAppointment() {
    // Obtenez la date et l'heure actuelles
    var now = moment();
    console.log("now", now);

    // Initialisez une variable pour stocker le rendez-vous le plus proche
    var closestAppointment = null;

    // Parcourez tous les rendez-vous dans l'objet JSON
    Object.values(GV.appointment).forEach(function(appointment) {
        var appointmentDate = moment(appointment.start);
        // console.log("appointment date", appointmentDate);

        // Assurez-vous que le rendez-vous est à venir (la date et l'heure sont postérieures à maintenant)
        if (appointmentDate.isAfter(now)) {
            // Si c'est le premier rendez-vous ou s'il est plus proche que celui actuellement stocké, mettez à jour closestAppointment
            if (!closestAppointment || appointmentDate.isBefore(moment(closestAppointment.start))) {
                closestAppointment = appointment;
            }
        }
    });

    return closestAppointment;
}




//! /////////////////////////////////////////////////////////// 
//! //////////////////!  COMPANIES PAGE  //////////////////////////
//! ///////////////////////////////////////////////////////////
GV.initialize_page.companies_page=function(){
    display_companies({})


}

$(document).on("keyup",".search_bar", function() {
    var key = $(this).val().toLowerCase();
    display_companies({key})
  });
  

function display_companies(filters){
    let html=""
    for(var element of Object.values(GV.companies)){
        var company_name=element.name
        if(!check_company_filter(filters,element))continue
        html+=`
        <div class="company_element cursor"  data-id="${element.id}">
            <div class="circle">${company_name.charAt(0).toUpperCase()}</div>
            <div class="w100">
                <div class="bold text_color1">${element.name}</div>
                <div class="text text_color4">${element.secteur}</div>
                <div class="text text_color4">${element.country}</div>
            </div>
        </div>
        `
        $('#companies_container').html("") 

       $('#companies_container').html(html) 
    }

    
}

function check_company_filter(filters,company){

    if(filters.key && !company.name.toLowerCase().includes(filters.key)) return false;
    return true

}

onClick(".company_element", function(){
    sendDataToFlutter('vibrate')
    display_company($(this).data("id"))
    app_navigate_to("company_page");

})


//! /////////////////////////////////////////////////////////// 
//! //////////////////!  PROFIL PAGE  //////////////////////////
//! ///////////////////////////////////////////////////////////

GV.initialize_page.profil_page=function(){

    displayDetailProfil()
}

onClick('#edit-profil-data', function(e){
    e.stopPropagation()
    $('#overlay , #side_menu').css('display','grid')
    displaySideProfil()
})
onClick('#edit-company-data', function(e){
    e.stopPropagation()
    $('#overlay , #side_menu').css('display','grid')
    displaySideCompany()
})


onClick('#update_profil', async function(e){
    $('#overlay , #side_menu').css('display','none')
    await update($(this).data('id'), "users", "#form_user" ,GV.users)
    displayDetailProfil()
})
onClick('#update_company', async function(e){
    $('#overlay , #side_menu').css('display','none')
    await update($(this).data('id'), "companies", "#form_company" ,GV.companies)
    displayDetailProfil()
})

onClick('.close, .exit', async function(e){
    $('#overlay , #side_menu').css('display','none')
})
$(document).on("change", "#fileInput", async function () {
    let file = this.files[0];
    upload_image(file, ".fileInput",async (e, res) => {
      if (res == "load") {
        console.log("%s uploaded successfuly: ", e.file_name);
        GV.image_name = e.file_name;
        var data = await ajax("/edit_picture_user", { id: GV.session_id, picture: GV.image_name });
        if(data.ok){
            index_items(data.reponses)
            displayDetailProfil()
        }
      }
      if (res == "error") {
        console.log("An error happened: ", e);
      }
    });
  });

function displaySideProfil (){
        var side = {id : "form_user", title_add: "Ajouter" , title_update: "Modifier votre profil",  btn_update: "update_profil" }
        var arr = [
          {data_id : 'first_name', selector : 'input', type : 'text', label : "Prénom : ", id : ''},
          {data_id : 'last_name', selector : 'input', type : 'text', label : "Nom : ", id : ''},
          {data_id : 'phone', selector : 'input', type : 'number', label : "N° téléphone : ", id : ''},
          {data_id : 'email', selector : 'input', type : 'text', label : "Email : ", id : ''},
          {data_id : 'poste', selector : 'input', type : 'text', label : "Fonction : ", id : ''},
       
        ]
        displaySide(arr, side,GV.session_id,GV.users[GV.session_id])
      
       
}
function displaySideCompany (){
        var side = {id : "form_company", title_add: "Ajouter" , title_update: "Modifier votre Entreprise",  btn_update: "update_company" }
        var arr = [
          {data_id : 'name', selector : 'input', type : 'text', label : "Entreprise : ", id : ''},
          {data_id : 'country', selector : 'input', type : 'text', label : "Pays : ", id : ''},
          {data_id : 'phone', selector : 'input', type : 'number', label : "N° téléphone : ", id : ''},
          {data_id : 'email', selector : 'input', type : 'text', label : "Email : ", id : ''},
          {data_id : 'secteur', selector : 'input', type : 'text', label : "Secteur : ", id : ''},
          {data_id : 'description', selector : 'textarea', type : 'text', label : "Présentation de l'entreprise: ", id : ''},
       
        ]
        displaySide(arr, side,GV.users[GV.session_id].id_company,GV.companies[GV.users[GV.session_id].id_company])
      
       
}

function displayDetailProfil(){
    
    var html= `
        <div class="padding20 " style="font-size: 25px; text-align: center;">
            <div class="header-admin-image" > <img src="/img/uploads/${GV.users[GV.session_id].picture ? GV.users[GV.session_id].picture : 'default-user.jpg'}"></div>
            <div style=" padding-top: 20px; ">${GV.users[GV.session_id].first_name} ${GV.users[GV.session_id].last_name}</div>

            <label class="uploads-pic" style="color: gray; font-size: 14px; padding: 5px 15px" for="fileInput" >
                Modifier ma photo
                <input type="file" id="fileInput" style="display:none;">
            </label>
        </div>

        <div class="list_header show-detail ">
            
        <div class="d-flex" style="font-size: 18px; font-weight: 500; color: #252525;">Mes Informations  
                <div id="length_done" style="padding-left: 10px; color: rgb(89, 71, 61);"> </div> 
            </div>
            <div class="icon_add ">                    
                <i class="fa-solid fa-chevron-up"></i>                    
            </div>
            <div id=""class="list_control_detail list" >

                <div class="input-detail-profil" style="">${GV.users[GV.session_id].first_name} </div>       
                <div class="input-detail-profil" style="">${GV.users[GV.session_id].last_name}</div>       
                <div class="input-detail-profil" style="">${GV.users[GV.session_id].email ? GV.users[GV.session_id].email : 'Votre adresse email'}</div>       
                <div class="input-detail-profil" style="">${GV.users[GV.session_id].phone ? GV.users[GV.session_id].phone : 'Votre N° téléphone'}</div>       
                <div class="input-detail-profil" style="">${GV.users[GV.session_id].poste}</div>           

                <div id="edit-profil-data" style="color: white;padding: 10px;text-align: center; background: #b24c1d; cursor: pointer;">Modifier</div>
            </div>
        </div>
        <div class="list_header show-detail ">
            
            <div class="d-flex" style="font-size: 18px; font-weight: 500; color: #252525;"> Les Informations de mon entreprise
                <div id="length_done" style="padding-left: 10px; color: rgb(89, 71, 61);"> </div> 
            </div>
            <div class="icon_add ">                    
                <i class="fa-solid fa-chevron-up"></i>                    
            </div>
            <div id=""class="list_control_detail list" >                               
                <div class="input-detail-profil" style="">${GV.companies[GV.users[GV.session_id].id_company].name}</div>  
                <div class="input-detail-profil" style="">${GV.companies[GV.users[GV.session_id].id_company].secteur ? GV.companies[GV.users[GV.session_id].id_company].secteur : 'Secteur'}</div>  
                <div class="input-detail-profil" style="">${GV.companies[GV.users[GV.session_id].id_company].country ? GV.companies[GV.users[GV.session_id].id_company].country : 'Pays'}</div>  
                <div class="input-detail-profil" style="">${GV.companies[GV.users[GV.session_id].id_company].email ? GV.companies[GV.users[GV.session_id].id_company].email: 'E-mail'}</div>  
                <div class="input-detail-profil" style="">${GV.companies[GV.users[GV.session_id].id_company].phone ? GV.companies[GV.users[GV.session_id].id_company].phone :'N° téléphone'}</div>  
                <div class="input-detail-profil" style="">${GV.companies[GV.users[GV.session_id].id_company].nif} </div> 
                <div class="input-detail-profil" style="text-align: justify;">${GV.companies[GV.users[GV.session_id].id_company].description ? GV.companies[GV.users[GV.session_id].id_company].description : "Présenation de l'entrepris"}</div>  
                <div id="edit-company-data" style="color: white;padding: 10px;text-align: center; background: #b24c1d; cursor: pointer;">Modifier</div>

            </div>
        </div>
   `

   $('#detail_profil').html(html)
}

onClick(".show-detail",function () {
    let selector = $(this).children(".list");
  
    if ($(selector).hasClass("show")){
    $(selector).removeClass("show");
    $(this).find(".icon_add i").removeClass("fa-chevron-down").addClass("fa-chevron-up");
    } else {
    $(selector).addClass("show");  
    $(this).find(".icon_add i").removeClass("fa-chevron-up").addClass("fa-chevron-down");
    }
  });






//! /////////////////////////////////////////////////////////// 
//! //////////////////!  COMPANY PAGE  //////////////////////////
//! ///////////////////////////////////////////////////////////
GV.initialize_page.company_page=function(){

   
}

onClick(".back", function(){
    sendDataToFlutter('vibrate')
    app_navigate_to("companies_page");

})

function display_company(id){
    let company=GV.companies[id]
    $('#company_page_container').html("")
    let html=`
    <div class="w100 grid header_company_page ">
        <div class="w100 back" style="padding: 25px 0px;"><span class="material-symbols-outlined " style="font-size: 35px">arrow_back_ios</span></div>
        <div class="padding20">
            <div class="title_bg">${company.name}</div>
            <div>${company.secteur}</div>
        </div>
    </div>
    <div class="w100 padding10 bold" style="color:gray">A propos de l'entreprise:</div>
    <div class="w100" style="background-color:#f5f5f5;padding:15px;border-radius:8px;margin:10px 0px;color:${company.description==null?"#989898":"gray"}" >${company.description!=null?company.description:"Cette  entreprise n'a pas ajouté de présentation"}</div>
    <div class="w100 padding10 bold" style="color:gray">Collaborateurs:</div>
    <div id="users_company_container" class="w100 h100" style="padding: 20px 10px;background-color:#f5f5f5;height:fit-content">
       ${get_html_company_users(company.id)} 
    </div>

    `
    $('#company_page_container').html(html)

}

function get_html_company_users(id_company){
        let  html=''
        for(element of Object.values(GV.users)){
            if(element.id_company!= id_company)continue 
            html+=`
            <div class="user_company_element w100 cursor" style="background-color:white;margin-bottom:10px" data-id="${element.id}">
                <div class="user_avatar"><img src="./img/uploads/${element.picture}"></div>
                <div class="w100">
                    <div>${element.last_name} ${element.first_name}</div>
                    <div class="text_color3">${element.poste}</div>
                </div>
                <div><span class="material-symbols-outlined">new_label</span></div>
            </div>
            `

        }
        if(html.length==0){
            html=`<div class="grid text_gray padding20">${GV.companies[id_company].name} n'a pas de collaborateurs diponibles le moment !</div>`
        }
        return html
}




onClick(".user_company_element",  function(){
    sendDataToFlutter('vibrate')
    display_side_menu_appointment($(this).data("id"))
    $('#side_menu_appointment').css('display','grid')

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
   

      }else{

        $("#overlay").css("display","grid")
    }

    get_user_disponibility("2023-12-18",$(this).data("id"))

})
  

onClick('#overlay, .exit', function(){
    sendDataToFlutter('vibrate')
    var target= $(this).data('id')
    console.log(target)
    $('#overlay').css('display', 'none')
    $(`${target}`).css('display', 'none')
    
    

});





//! /////////////////////////////////////////////////////////// 
//! //////////////////!  PICKUP APPOINTMENT   //////////////////////////
//! ///////////////////////////////////////////////////////////



 function display_side_menu_appointment(user_id){
    $('#side_menu_appointment').html("")
    let user=GV.users[user_id]

    let html=`
    <div class="header_side_menu line_bottom">
        <div id="skip_btn" class="exit text_color3" data-id="#side_menu_appointment"><span class="material-symbols-outlined">arrow_back_ios</span></div>
        <div class="title text_color3">${user.last_name} ${user.first_name}</div>
        <div class="title text_color3"></div>
    </div>
    <div class="body_side_menu_appointment">
        <div class="w100">
            <div class="" style="font-size: 19px;">Sélectionnez une date </div>
            <div class="w100 days_element_container">
                <div class="day_btn selected_day_btn" data-id="2023-12-18" data-user="${user_id}">Lundi <br> 18/12</div>
                <div class="day_btn" data-id="2023-12-19" data-user="${user_id}">Mardi <br> 19/12</div>
            </div>
        </div>
        <div class="w100 h100 ">
            <div class="padding10" style="font-size: 19px;">Créneaux horaires disponibles</div>
            <div id="time_slots_container" class="w100">
 
            </div>

        </div>
    </div>
    <div class="w100 grid center line_top">
        <div class="error_side_menu" style="color:red;padding:5px 10px;text-align:center"></div>
        <div id="request_appointment_btn" class="button p_color" data-id="${user_id}" >Demander un rendez-vous</div>
    </div>

    `
    $('#side_menu_appointment').html(html)
}



async function get_user_disponibility(selected_date,user_id){

    await get_user_unavailability(user_id)

    $('#time_slots_container').html("")

    let content=GV.dates[selected_date];
    let html=""
   
    for(var time of content.slots){
        let datetime=`${selected_date} ${time}`; // check each datetime ex: 2022-05-30 10:00.00
        let displayed_time=moment(datetime).format('HH:mm ')
        if(!check_user_disponibility(datetime,selected_date))continue
        html+=`<div class="time_slot" data-id="${datetime}">${displayed_time}</div>`
    }
    $('#time_slots_container').html(html)
}


function check_user_disponibility(datetime,selected_date){
    if(GV.unavailability.length==0)return true
    let time_now = moment().format('HH:mm');
    let time=moment(datetime).format('HH:mm');
    let today=moment().format('YYYY-MM-DD')
    for(let i in GV.unavailability){
        console.log(GV.unavailability[i], datetime,i)
        if( GV.unavailability[i]==datetime)return false 
        if(time_now > time && selected_date == today )return false

      
    }
    return true
      
}

async function  get_user_unavailability(user_id){
    GV.unavailability=""
    try{
        let data = await ajax('/get_unavailability',{user_id,current_user:GV.session_id});  
        GV.unavailability=data.unavailability;
       }catch(e){
           $('.loading-container').append('<div class="loading-error">Une erreur s\'est produite</div>');
          //  setTimeout(function(){ init_page(name); },2000);
       }

}

onClick('.day_btn', async function(){
    sendDataToFlutter('vibrate')
    $('.day_btn').removeClass('selected_day_btn')
    $(this).addClass('selected_day_btn')

    await get_user_disponibility($(this).data("id"),$(this).data("user"))


});

onClick('.time_slot', function(){
    sendDataToFlutter('vibrate')
    $('.time_slot').removeClass('selected_time_slot')
    $(this).addClass('selected_time_slot')
});


onClick('#request_appointment_btn', async function(){
   console.log(GV.session_id)
   $(".error_side_menu").html("")
  
    if(!GV.session_id)return 
 
    if($('#time_slots_container').find('div.selected_time_slot').length ==0){
        $(".error_side_menu").html(`Erreur: Veuillez selectionner un créneau horaire.`)
        
    }else{
        updateButtonStatus($("#request_appointment_btn"), "loading","Demander un rendez-vous")
        display_app_notification("0")
        let myObj={
            to_id:$(this).data('id'),
            from_id:GV.session_id,
            start:$('#time_slots_container').find('div.selected_time_slot').data("id"),
            to_company_id:GV.users[$(this).data('id')].id_company,
            from_company_id:GV.users[GV.session_id].id_company,
        }
    
        console.log(myObj)
    
        var data = await ajax('/send_appointment_request', {obj:myObj});
        if(data.ok){
            updateButtonStatus($("#request_appointment_btn"), "success","Demander un rendez-vous")
            display_app_notification("1")
            index_items(data.reponses)
    
        }else{
            display_app_notification("2","Erreur lors de l'envoie de la demande")
        }
        // await add("appointment","",GV.appointment,myObj)
    
    
    
    }
       




});


function check_selected_time_slot(){

}

  //! /////////////////////////////////////////////////////////// 
//! //////////////////!  APPOINTMENTS PAGE  //////////////////////////
//! ///////////////////////////////////////////////////////////


GV.initialize_page.appointments_page= async function(){
    await load_items ('appointment',{to_id:GV.session_id},  reload = true)
    await load_items ('appointment',{from_id:GV.session_id},  reload = true)


    await load_items ('companies',{is_deleted: 0},  reload = false)
    await load_items ('users',{is_deleted: 0},  reload = false)


    let date=$('#appointments_page').find(".selected_date_filter_pending_btn").data("id")
    display_appointments({status:"0",to:GV.session_id},'#pending_appointments_container',date)

}



onClick(".switch_btn",function(){
    sendDataToFlutter('vibrate')
    $('.switch_btn').removeClass("selected_switch_btn")
    $(this).addClass("selected_switch_btn")
    let filtred_by=$(this).data("id")
    let date=$('#appointments_page').find(".selected_date_filter_pending_btn").data("id")

    if(filtred_by=="to_user"){

        display_appointments({status:"0",to:GV.session_id},'#pending_appointments_container',date)

    }else{

        display_appointments({status:"0",from:GV.session_id},'#pending_appointments_container',date)

    }



});




async function update_appointments_status(appointment,obj){
    try{
        let user_id=appointment.from_id == GV.session_id  ?  appointment.to_id : appointment.from_id 
        let data = await ajax('/update_appointments_status',{user_id,current_user:GV.session_id,appointment,obj}); 
        console.log(data,"je suis data")
        if(data.ok==true){
            
            display_app_notification("1")
            return {ok:"ok"}
        }
      
       }catch(e){
           $('.loading-container').append('<div class="loading-error">Une erreur s\'est produite</div>');
           display_app_notification("2",`<div class=""><div>Un problème est survenu !</div><div class="text_color4" style="font-size:15px!important">veuillez relancer l'application</div><div>`)

          //  setTimeout(function(){ init_page(name); },2000);
        }

}

onClick("#confirm_btn",async function(){
    // sendDataToFlutter('vibrate')
    updateButtonStatus($("#confirm_btn"), "loading","Accepter")
    var obj={ status:1}
  let res= await update_appointments_status(GV.appointment[$(this).data("id")],obj)
   if(res.ok){
        updateButtonStatus($("#confirm_btn"), "success","Accepter")
        closeDrawer()
        await load_items ('appointment',{to_id:GV.session_id},  reload = true)
        await load_items ('appointment',{from_id:GV.session_id},  reload = true)
        $("#appointment_details_drawer").css("display","none")
        let date=$('#appointments_page').find(".selected_date_filter_pending_btn").data("id")
        
        display_appointments({status:"0",to:GV.session_id},'#pending_appointments_container',date)
    
 
   }else{
    console.log("error updating appointment")
   }


});

onClick("#decline_btn",async function(){
    

    var obj={status:2}
    await update($(this).data('id'), "appointment", "" ,GV.appointment,obj)
    let date=$('#appointments_page').find(".selected_date_filter_pending_btn").data("id")
    $("#appointment_details_drawer").css("display","none")

    display_appointments({status:"0",to:GV.session_id},'#pending_appointments_container',date)

});


onClick('.pending_appointment_element', function(){
    if(!$(this).data("id"))return
    if($(this).hasClass("ph-item"))return
    
    display_appointment_details_drawer($(this).data("id"))

});



onClick(".date_filter_pending_btn",function(){
    sendDataToFlutter('vibrate')

    $('.date_filter_pending_btn').removeClass('selected_date_filter_pending_btn')
    $(this).addClass('selected_date_filter_pending_btn')
    let filtred_by=$('#appointments_page').find(".selected_switch_btn").data("id")
    if(filtred_by=="to_user"){
        display_appointments({status:"0",to:GV.session_id},$(this).data("target"),$(this).data('id'))

    }else{
        display_appointments({status:"0",from:GV.session_id},$(this).data("target"),$(this).data('id'))

    }

})


//! /////////////////////////////////////////////////////////// 
//! //////////////////!  USER SIDE MENU   //////////////////////////
//! ///////////////////////////////////////////////////////////


onClick(".profil_side_menu_btn",function(){
    sendDataToFlutter('vibrate')
    $("#profil_side_menu").css("display","grid")

});

onClick(".close_profil_side_menu_btn",function(){
    sendDataToFlutter('vibrate')
    $("#profil_side_menu").css("display","none")

});

onClick("#logout_btn, .logout_btn",async function(){
    sendDataToFlutter('vibrate')
 
   var options = {
    type: "POST",
    url: `/logOut`,
    cache: false,
  };
  var received_data = await $.ajax(options);
  if(received_data.success){
    $.cookie("session_id",null, { path: '/app' });

    window.location.href='/login-user'
  }
  
});

onClick("#privacy_btn",async function(){
    sendDataToFlutter('vibrate')
});







//! /////////////////////////////////////////////////////////// 
//! //////////////////! PUSH NOTIFICATIONS  //////////////////////////
//! ///////////////////////////////////////////////////////////







// messaging.onMessage((payload) => {
//     console.log("Message received:", payload);
//     // Gérez l'affichage de la notification côté client
//     // (Utilisez le service worker si nécessaire)
//   });
  

// $('.pending_appointment_element').focus(function(){
//     alert()
// })





        // Check if user has seen the message already
// const hasSeenInstallPopup = localStorage.getItem("hasSeenInstallPopup");

// // Detects if device is on iOS 
// const isIos = () => {
//   const userAgent = window.navigator.userAgent.toLowerCase();
//   return /iphone|ipad|ipod/.test( userAgent );
// }

// // Detects if device is in standalone mode
// const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

// // Checks if should display install popup notification:
// if (!hasSeenInstallPopup && isIos() && !isInStandaloneMode()) {
//   showInstallMessage();
//   localStorage.setItem("hasSeenInstallPopup", true);
// }



// let products={
//     "1":{id:"1",name:"robinet",category:"bricollage"},
//     "2":{id:"2",name:"robinet",category:"bricollage"},
//     "3":{id:"3",name:"robinet",category:"bricollage"},
// }

// let  selectedProducts=[]

// onClick(".mon-boutton",function(){
//     var product_id=$(this).data("id") // recuperer l'id du poduit depuis le data id du boutton
//     selectedProducts.push(product_id) // ajouter le produits au tableau (base de donnée)

//     display_cart()// appeler la fonction de display du cart  
//     display_products_cart() // appeler la fonction de display des produits selectionnés dans le cart 


// })


// function display_products_cart(){
//     let html=""
//     $("#mon-container").html("")

//     // je  loop sur mon tableau des produits selectionnés 
//     for(let id of selectedProducts){
//         var product=products[id]// je récupére mon produits depuis ma base en fonction de l'id des produits selectionnés, ex selectedProducts=[1,3];  products[1] ==> résultat     "1":{id:"1",name:"robinet",category:"bricollage"},
//         var product_name=product.name
//         html+=`

//         `
//     }

//     $("#mon-container").html(html)
// }