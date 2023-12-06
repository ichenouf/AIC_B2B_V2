GV={initialize_page:{},}

//! /////////////////////////////////////////////////////////// 
//! //////////////////!   READY   //////////////////////////
//! ///////////////////////////////////////////////////////////

$(document).ready(  async function () {

    get_session_id_cookies ()

    await load_items ('companies',{id:GV.session_id},  reload = false)

    await load_items ('users',{id_company:GV.session_id},  reload = false)
    setTimeout(function(){
      $('#loading_page').hide();
    },1400)
  

    check_tutorial_status()
    searchBar("#users_table_body")

 
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


function check_tutorial_status(){
  if(GV.companies[GV.session_id].tutorial=="0"){
      $("#tutorials").css('display','block')
    }
  else{
    displayUsers()
  
  }

}


function check_creation_user_limit(){

    var limit= GV.companies[GV.session_id].user_limit
    var number_of_users=$("#users_table_body > div").length
    if(number_of_users >= limit)return false 
    return true
}









onClick(".nav_link", function(){
    // if(!$(this).data('id')) return;
    $('.nav_link_container').removeClass('selected_nav_link')
    
    $(this).parent('.nav_link_container').addClass('selected_nav_link')
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
//! //////////////////!  HOME  //////////////////////////
//! ///////////////////////////////////////////////////////////


onClick('.logout', async function(){
  

  var options = {
    type: "POST",
    url: `/logOut`,
    cache: false,
  };
  var received_data = await $.ajax(options);
  if(received_data.success){
    window.location.href='/login-corporate'
  }
  
});


onClick("#create_user_btn", function(){
  if(!check_creation_user_limit()){
    displayPopup('Le nombre de collaborateur autorisé à  été atteint !','','fail')


  

    return 

  }
  $('#overlay , #side_menu').css('display','grid')
  display_user_side_menu()
})

onClick('.edit_profil', function(){

  $('.edit_profil').find('.contextual_menu').css("display","none")
  $(this).find('.contextual_menu').css("display","block")


})
onClick('.update_item',  function(){
  console.log($(this).data('id'))
  display_user_side_menu($(this).data('id'),GV.users[$(this).data('id')])


})

onClick('.delete_item', async function(){
  console.log($(this).data('id'))
  await delete_item($(this).data('id'), "users",GV.users)
  displayUsers()

})

   
onClick('#create_user', async function(){
  if(!check_form('.form_container'))retrun;
  await add("users", "#form_users",GV.users) 

  displayUsers() 
  
})

   
onClick('#update_user', async function(){
  if(!check_form('.form_container'))retrun;
  console.log($(this).data('id'))
  await update($(this).data('id'), "users", "#form_users" ,GV.users)
  displayUsers()
  
})


function display_user_side_menu(id,object){
  
  var side = {id : "form_users", title_add: "Ajouter un collaborateur" , title_update: "Modifier collaborateur",  btn_add: "create_user" , btn_update: "update_user" }
  var arr = [
    {data_id : 'last_name', selector : 'input', type : 'text', label : "Nom : ", id : ''}
    ,{data_id : 'first_name', selector : 'input', type : 'text', label : "Prénom :", id: ''},   
    {data_id : 'phone', selector : 'input', type : 'number', label : "N° téléphone : ", id: '',},   
    {data_id : 'poste', selector : 'input', type : 'text', label : "poste :", id: '',},   
    {data_id : 'email', selector : 'input', type : 'email', label : "email :", id: '',},   
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

function displayUsers(){
  let html=""
  $('#users_table_body').html("")

  for(element of Object.values(GV.users)){
    console.log(element.poste)
    html+=`
    <div class="table_item">
    <div class="text_gray bold">${element.last_name}</div>
    <div class="text_gray bold">${element.first_name}</div>
    <div class="text_gray bold">${element.phone}</div>
    <div class="text_gray bold">${element.email}</div>
    <div class="text_gray bold">${element.poste}</div>
    <div class="text_gray bold edit_profil"><span class="material-symbols-outlined title_bg bold text_black cursor" >more_vert</span>
        <div class="contextual_menu shadow">
            <div class="w100 padding10 line_bottom contextual_item update_item" data-id="${element.id}">
                <div><span class="material-symbols-outlined manage_user">edit</span></div>
                <div class="w100 text">Editer</div>
            </div>
            <div class="w100 padding10 contextual_item delete_item" data-id="${element.id}">
                <span class="material-symbols-outlined">delete_forever </span>
                <div class="w100 text manage_user ">Supprimer</div>
            </div>
          
        </div>
    </div>
</div>
    `
    $('#users_table_body').html(html)
  }
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

