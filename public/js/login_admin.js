GV={initialize_page:{},}

//! /////////////////////////////////////////////////////////// 
//! //////////////////!   READY   //////////////////////////
//! ///////////////////////////////////////////////////////////

$(document).ready(  async function () {


});



onClick('.nav_link',function() {
    $(".nav_link").removeClass("nav_link_selected")
    $(this).addClass("nav_link_selected")
    if($(this).data("id")=="subscribe"){
        $('.form_login_container').css("display",'none')
        $('.form_subscribe_container').fadeIn()
        
    }
    else{

        $('.form_subscribe_container').css("display",'none')
        // $('.form_login_container').css("display",'block')
        $('.form_login_container').fadeIn()
    }
});


//! /////////////////////////////////////////////////////////// 
//! //////////////////!  LOGIN  //////////////////////////
//! ///////////////////////////////////////////////////////////


onClick('#login',function() {
    if(!check_form('.form_login_container'))return;
    login()
});



async function login(){
   
    var email= $("#username").val()
    var password= $("#password").val()
    var type= "admin"
    var data={email,password,type}
    var option = {
        type: "POST",
        url: `/auth`,
        cache: false,
        data: data,
      };
      console.log(data)
    var receved_data = await $.ajax(option);

    if(receved_data.ok=='ok'){

        window.location.href = `/admin`
  
      }if(receved_data=='mistak in password'){
        $('.massage').html(" ")
        error="Le mot de passe que vous avez inséré est incorrect.";
        html = `<div class="alert">${error}</div>`
        $('.massage').html(html)
  
      }if(receved_data=='/'){
          $('.massage').html(" ")
          error="Ce nom d'utilisateur n'éxiste pas ou le compte a été désactivé.";
          html = `<div class="alert">${error}</div>`
          $('.massage').html(html)
          
      }else{
        
      }
    console.log(data)
    
} 


//! /////////////////////////////////////////////////////////// 
//! //////////////////!  REGISTER  //////////////////////////
//! ///////////////////////////////////////////////////////////

// await add("users", "#form_users",GV.users)  


onClick('#subscribe',async function() {
    alert()
    if(!check_form('.form_subscribe_container'))retrun;
     await add("companies", ".form_subscribe_container",GV.companies)  
     CleanForm(".form_subscribe_container")
     

});