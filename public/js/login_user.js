

//! /////////////////////////////////////////////////////////// 
//! //////////////////!   READY   //////////////////////////
//! ///////////////////////////////////////////////////////////

$(document).ready(  async function () {


});






//! /////////////////////////////////////////////////////////// 
//! //////////////////!  LOGIN  //////////////////////////
//! ///////////////////////////////////////////////////////////


onClick('#login',function() {
    if(!check_form('.form_login_container'))return  
    login()
});



// async function login(){
   
//     var username= $("#email").val()
//     var password= $("#password").val()
//     var type= "users"
//     var data={username,password,type}
//     var option = {
//         type: "POST",
//         url: `/auth`,
//         cache: false,
//         data: data,
//       };
//       console.log(data)
//     var receved_data = await $.ajax(option);
//     console.log(receved_data)
//     if( receved_data && receved_data.ok){
//         // alert()
//       window.location.href =`/app`
//     }
//     console.log(data)
    
// } 

async function login(){
   
  var email= $("#email").val()
  var password= $("#password").val()
  var type= "users"
  var data={email,password,type}
  var option = {
      type: "POST",
      url: `/auth`,
      cache: false,
      data: data,
    };
    console.log(data)
  var receved_data = await $.ajax(option);
  console.log(receved_data)
  if(receved_data.ok=='ok'){

    window.location.href = `/app`

  }if(receved_data=='mistak in password'){
    $('.massage').html(" ")
    error="Le mot de passe que vous avez inséré est incorrect.";
    html = `<div class="alert">${error}</div>`
    $('.massage').html(html)

  }if(receved_data=='/'){
      $('.massage').html(" ")
      error="Cet utilisateur n'éxiste pas ou le compte a été désactivé.";
      html = `<div class="alert">${error}</div>`
      $('.massage').html(html)
      
  }else{
    
  }
  console.log(data)
  
} 



onClick('#register', async function() {
  if(!check_form('.form_subscription_container'))return  
  
    let user_data={
      first_name:$("#first_name").val(),
      last_name:$("#last_name").val(),
      phone:$("#phone").val(),
      email:$("#email_register").val(),
      poste:$("#poste").val(),
      password_backup:$("#password_register").val(),
    
    }

    let company_data={
      name:$("#company_name").val(),
      nif:$("#nif").val(),
    }
  

  let res = await ajax('/register',{user_data,company_data}); 
  if(res.success){
    //TODO: Display popup
    $(".form_subscription_container").css("display","none")
    $(".form_login_container").css("display","block")

  }

  
});


