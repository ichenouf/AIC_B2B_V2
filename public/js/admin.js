

GV={initialize_page:{},}

//! /////////////////////////////////////////////////////////// 
//! //////////////////!   READY   //////////////////////////
//! ///////////////////////////////////////////////////////////

$(document).ready(  async function () {
    moment.locale('fr');
    // get_session_id_cookies ()

    await load_items ('companies',{},  reload = false)

    await load_items ('users',{},  reload = false)
    await load_items ('appointment',{},  reload = false)
    setTimeout(function(){
      $('#loading_page').hide();
    },1400)
  
      searchBar("#companies_table_body")
      displayCompanies()
      display_count_appointment({status:1},"#confirmed_appointments_count")
      display_count_appointment({},"#appointments_count")
      display_count_appointment({},"#appointments_count")

    $("#corporate_count").html(Object.keys(GV.companies).length)
    $("#users_count").html(Object.keys(GV.users).length)
      displayFiltredCompanies()
 
});





function displayPopup(title,message,type){
  $('#popup').html("")

    let html = `
    <div class="modal_notification_header bold">
    ${type=="success"?'<span class="material-symbols-outlined text_green ">task_alt</span>':'<span class="material-symbols-outlined text_red">sms_failed</span>'}
    <div class="message">${title}</div>
    <span class="material-symbols-outlined">close</span>
  </div>
  <div id="body_message" class="w100 h100  text_left">
  ${message==""?"Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium libero suscipit esse, cupiditate molestias commodi distinctio sint praesentium officiis itaque aliquam.":message}
  </div>
    <div class="grid " style="grid-template-columns: 1fr 100px ;">
    <div class="w100"></div>
    <div id="popup_btn" class="button color4 text_white">OK</div>
</div>
    
    `
    
  $('#popup').html(html)
  $('#popup, #overlay').css("display",'grid')

}


function check_creation_user_limit(){

    var limit= GV.companies[GV.session_id].user_limit
    var number_of_users=$("#users_table_body > div").length
    if(number_of_users >= limit)return false 
    return true
}









onClick(".nav_link", function(){
    if(!$(this).data('id')) return;
    $('.nav_link_container').removeClass('selected_nav_link')
    $(this).parent('.nav_link_container').addClass('selected_nav_link')
    navigate_to($(this).data('id'))

  })
  
  
  onClick("#popup_btn", function(){
    $('#popup, #overlay').css('display','none')
  })


$('.account_icon').on({
  mouseenter: function () {
    $('#account_float_menu').fadeIn()
      //stuff to do on mouse enter
  },
  mouseleave: function () {
    setTimeout(function(){  $('#account_float_menu').fadeOut() },2000);
    
  }
});
  



  onClick('#overlay, .exit', function(){
    $('#overlay').css('display', 'none')
    $('#side_menu').css('display', 'none')  
  })

  //! /////////////////////////////////////////////////////////// 
//! //////////////////!  HOME PAGGE  //////////////////////////
//! ///////////////////////////////////////////////////////////
GV.initialize_page.home_page= async function(){
    await load_items ('companies',{},  reload = false)

    await load_items ('users',{},  reload = false)
    await load_items ('appointment',{},  reload = false)

    display_count_appointment({status:1},"#confirmed_appointments_count")
    display_count_appointment({},"#appointments_count")
    display_count_appointment({},"#appointments_count")

    $("#corporate_count").html(Object.keys(GV.companies).length)
    $("#users_count").html(Object.keys(GV.users).length)
      displayFiltredCompanies()


}


function displayFiltredCompanies(){
    let html=""
    for( let element of Object.values(GV.companies)){

        if(element.user_limit != 0) continue

        let formated_date=moment(element.date).format('YYYY-MM-DD'); 

        html+=`
        <div class="table_item">
            <div class="text_gray bold">${element.name}</div>
            <div class="text_gray bold">${formated_date}</div>
            <div class="text_gray bold edit_profil"><span class="material-symbols-outlined title_bg bold text_black " >more_vert</span>
                <div class="contextual_menu shadow">
                    <div class="w100 padding10 line_bottom contextual_item update_item" data-id="${element.id}">
                        <div><span class="material-symbols-outlined manage_user" >edit</span></div>
                        <div class="w100 text">Editer</div>
                    </div>
                    <div class="w100 padding10 contextual_item delete_item" data-id="${element.id}" >
                        <span class="material-symbols-outlined">delete_forever </span>
                        <div class="w100 text manage_user ">Supprimer</div>
                    </div>
                
                </div>
            </div>
        </div>

        `
    }
    $("#pending_companies_table_body").html('')
    $("#pending_companies_table_body").html(html)
}
   
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


function check_appointments_filters (appointment,filters){
    // console.log(appointment.status !=filters.status,"merde")
    console.log(filters,appointment.status,appointment.status !=filters.status)
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
      


  //! /////////////////////////////////////////////////////////// 
//! //////////////////!  COMPANIES PAGE //////////////////////////
//! ///////////////////////////////////////////////////////////
GV.initialize_page.companies_page= async function(){

    displayCompanies()
}


onClick('.logout', async function(){
  

  var options = {
    type: "POST",
    url: `/logOut`,
    cache: false,
  };
  var received_data = await $.ajax(options);
  if(received_data.success){
    window.location.href='/login-admin'
  }
  
});




onClick('.edit_profil', function(){

  $('.edit_profil').find('.contextual_menu').css("display","none")
  $(this).find('.contextual_menu').css("display","block")


})

onClick('.update_item',  function(){
  console.log($(this).data('id'))
  display_company_side_menu($(this).data('id'),GV.companies[$(this).data('id')])


})

onClick('.delete_item', async function(){
  console.log($(this).data('id'))
  await delete_item($(this).data('id'), "users",GV.users)
  displayCompanies()

})

   
// onClick('#create_user', async function(){
//   if(!check_form('.form_container'))retrun;
//   await add("users", "#form_users",GV.users) 
//   displayPopup(' Collaborateur ajouté avec success ! ','Un mot de passe a  été généré et envoyé par email à votre collaborateur<br>ce dernier pourra se connecter à son espace B2B','success')

//   displayUsers() 
  
// })

   
onClick('#update_companies', async function(){
  if(!check_form('#form_companies'))return;
  console.log($(this).data('id'))
  await update($(this).data('id'), "companies", "#form_companies" ,GV.companies)
  displayFiltredCompanies()
  displayCompanies()
  
})


function display_company_side_menu(id,object){
  
  var side = {id : "form_companies", title_add: "Ajouter" , title_update: "Modifier compte corporate",  btn_add: "create_companies" , btn_update: "update_companies" }
  var arr = [
    {data_id : 'name', selector : 'input', type : 'text', label : "Nom : ", id : ''},
    {data_id : 'email', selector : 'input', type : 'email', label : "email :", id: '',},   
    {data_id : 'phone', selector : 'input', type : 'number', label : "N° téléphone : ", id: '',},   
    {data_id : 'secteur', selector : 'input', type : 'text', label : "secteur d'activité :", id: '',},   
    {data_id : 'user_limit', selector : 'input', type : 'number', label : "Utilisateurs autorisés :", id: ''},   

  ]
  displaySide(arr, side,id,object)

  $('#overlay , #side_menu').css('display','grid')
  
}

// function display_user_side_menu(){
//   var side = {id : "form_users", title_add: "Ajouter un collaborateur" , title_update: "Modifier collaborteur",  btn_add: "create_user" , btn_update: "update_user" }
//   var arr = [
//     {data_id : 'last_name', selector : 'input', type : 'text', label : "Nom : ", id : ''}
//     ,{data_id : 'first_name', selector : 'input', type : 'text', label : "Prénom :", id: ''},   
//     {data_id : 'phone', selector : 'input', type : 'number', label : "N° téléphone : ", id: '',},   
//     {data_id : 'poste', selector : 'input', type : 'text', label : "poste :", id: '',},   
//     {data_id : 'email', selector : 'input', type : 'email', label : "email :", id: '',},   
//   ]
//   displaySide(arr, side,)
  
// }

function displayCompanies(){
  let html=""
  $('#companies_table_body').html("")

  for(let element of Object.values(GV.companies)){
    let formated_date=moment(element.date).format('YYYY-MM-DD'); 
    html+=`
    <div class="table_item">
    <div class="text_gray bold">${element.name}</div>
    <div class="text_gray bold">${element.phone}</div>
    <div class="text_gray bold">${element.email}</div>
    <div class="text_gray bold">${element.secteur}</div>
    <div class="text_gray bold">${element.user_limit}</div>
    <div class="text_gray bold">${element.status==0?"Désactivé":"Activé"}</div>
    <div class="text_gray bold">${formated_date}</div>
    <div class="text_gray bold edit_profil"><span class="material-symbols-outlined title_bg bold text_black cursor" >more_vert</span>
        <div class="contextual_menu shadow">
            <div class="w100 padding10 cursor line_bottom contextual_item update_item" data-id="${element.id}">
                <div><span class="material-symbols-outlined manage_user">edit</span></div>
                <div class="w100 text">Editer</div>
            </div>
            <div class="w100 padding10 contextual_item cursor delete_item" data-id="${element.id}">
                <span class="material-symbols-outlined">delete_forever </span>
                <div class="w100 text manage_user ">Supprimer</div>
            </div>
          
        </div>
    </div>
</div>
    `
    $('#companies_table_body').html(html)
  }
}


  //! /////////////////////////////////////////////////////////// 
//! //////////////////!  APPOINTMENTS PAGE  //////////////////////////
//! ///////////////////////////////////////////////////////////

GV.initialize_page.appointments_page= async function(){

  displayAppointments()
}


function displayAppointments(){
  var html=""
  for(var element of Object.values(GV.appointment)){
    if(element.status!=1)continue
    var formated_start_hour= moment(element.start).format('HH:mm');
    var formated_date=moment(element.start).format("MMM Do YY")
    html+=`
    <div class="table_item">
      <div class="text_gray bold">${element.id}</div>
      <div class="text_gray bold">${GV.users[element.from_id].last_name} ${GV.users[element.from_id].first_name} <br> ${GV.companies[element.from_company_id].name}</div>
      <div class="text_gray bold">${GV.users[element.to_id].last_name} ${GV.users[element.to_id].first_name} <br> ${GV.companies[element.to_company_id].name}</div>
      <div class="text_gray bold">${formated_start_hour}</div>
      <div class="text_gray bold">${formated_date}</div>
    </div>

    `
  }
  $('#appointments_table_body').html("")
  $('#appointments_table_body').html(html)

}





  //! /////////////////////////////////////////////////////////// 
//! //////////////////!  TUTORIAL   //////////////////////////
//! ///////////////////////////////////////////////////////////
var count_tutorials=0

// var tutorials=[]
onClick(".tutorial_btn", function(){
    
    var displayed_tuto=$(this).data('id')
    displayTutorial(displayed_tuto)


});


async function displayTutorial(displayed_tuto){
    // if(tutorial==1)return

    count_tutorials=displayed_tuto


    var next_tuto=parseInt(count_tutorials+1)

    let  old_target= $(`.tutorial[data-id="${displayed_tuto}"]`).data('target')
    $(`${old_target}`).removeClass("tutorial_focus")
    $(`${old_target}`).removeClass("tutorial_focus_display")

    $('.tutorial').css('display','none')
    if(count_tutorials==5){

        $('#tutorials').css('display','none')
      await update(GV.session_id, "companies", "" ,GV.companies)
        displayUsers()
        return
    }
    $(`.tutorial[data-id="${next_tuto}"]`).css('display','grid')
    
    if($(`.tutorial[data-id="${next_tuto}"]`).data('target')){
        let target=$(`.tutorial[data-id="${next_tuto}"]`).data('target')
        $(`${target}`).addClass("tutorial_focus")
        if( $(`${target}`).css('display').toLowerCase() == 'none') {
             $(`${target}`).addClass("tutorial_focus_display")
        }

        //     $(`${target}`).css('z-index','500')

        // }
    }

    

}

