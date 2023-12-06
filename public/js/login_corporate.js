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
   
    var username= $("#username").val()
    var password= $("#password").val()
    var type= "companies"
    var data={username,password,type}
    var option = {
        type: "POST",
        url: `/auth`,
        cache: false,
        data: data,
      };
      console.log(data)
    var receved_data = await $.ajax(option);

    if(receved_data.ok){
      window.location.href =`/corporate`
    }else{
        $(".message").html(receved_data.error)

    }
    console.log(data)
    
} 


//! /////////////////////////////////////////////////////////// 
//! //////////////////!  REGISTER  //////////////////////////
//! ///////////////////////////////////////////////////////////

// await add("users", "#form_users",GV.users)  


onClick('#subscribe',async function() {
    if(!check_form('.form_subscribe_container'))return;
     await add("companies", ".form_subscribe_container",GV.companies)  
     CleanForm(".form_subscribe_container")
     

});

onClick('.notification_btn',async function() {

    location.reload()

});

