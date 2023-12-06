

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
    updateButtonStatus($("#login"), "loading")
    login()
});

onClick('#register', async function() {
  updateButtonStatus($("#register"), "loading")
  register()
});




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
    updateButtonStatus($("#login"), "success","Connexion")
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
    updateButtonStatus($("#login"), "default","Connexion")
  }
  console.log(data)
  
} 




async function register(){
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
    updateButtonStatus($("#register"), "succeess")
    //TODO: Display popup
    $(".form_subscription_container").css("display","none")
    $(".form_login_container").css("display","block")

  }else{
    updateButtonStatus($("#register"), "failed")
  }

}


onClick('#go_to_register',function() {
  $(".form_subscription_container").css("display","block")
  $(".form_login_container").css("display","none")

});

onClick('#go_to_login',function() {
  $(".form_subscription_container").css("display","none")
  $(".form_login_container").css("display","block")


});
