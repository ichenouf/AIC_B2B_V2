

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

  if (!check_form('.form_subscription_container')) {
    $('.massage').html('<div style="color: #F44336">Veuillez remplir tous les champs</div>')
    return
  }
  if ($('#password_register').val() === $('#confirm_password_register').val()) {
    
    updateButtonStatus($("#register"), "loading")
    register()

  } else {
    $('.massage').html('<div style="color: #F44336">Les mots de passe ne concordent pas.</div>')
    $('#password_register,#confirm_password_register').css('border', 'solid 1px red')
  }

});

$( ".type_company" ).on( "change", function() {
    console.log($(this).val())
    if($(this).val() == 'company'){
      console.log(1)
      $('#company_information').html(`
      
      <div class="input_container">
          <div class="label">Entreprise : <span  style="color: rgb(224, 36, 36);">*</span></div>
          <input class="input required" placeholder="Entrez votre Entreprise" id="company_name" type="text" name="" required>
      </div>

      <div class="input_container">
          <div class="label">N° NIF : <span  style="color: rgb(224, 36, 36);">*</span></div>
          <input class="input required" placeholder="Entrez le NIF de votre entreprise " id="nif" type="text" name="" required>

      </div>

      <div class="input_container">
          <div class="label">Poste occupé(e) : <span  style="color: rgb(224, 36, 36);">*</span></div>
          <input class="input required" placeholder="Ex: DRH" id="poste" type="text" name="" required>

      </div>
      `)
    }else if($(this).val() == 'organisme'){
      console.log(2)
      $('#company_information').html(`
      <div class="input_container">
          <div class="label">Entreprise : <span  style="color: rgb(224, 36, 36);">*</span></div>
          <select class="required" id="company_name" >
              <option disabled selected value="">Veuillez selectionner votre institution</option>
              <option value="AAPI">AAPI</option>
              <option value="CEREFE">CEREFE</option>
              <option value="CREA">CREA</option>
              <option value="TABC">TABC</option>
              <option value="CIPA">CIPA</option>
              <option value="CCIAF">CCIAF</option>
              <option value="ONDE">ONDE</option>
              <option value="ALGEX">ALGEX</option>
              <option value="GAAN">GAAN</option>
              <option value="FILAHA INNOV">FILAHA INNOV</option>
              <option value="CNCDPME">CNCDPME</option>
              <option value="CACI">CACI</option>
              <option value="INAPI">INAPI</option>
              <option value="IANOR">IANOR</option>
              <option value="ALGERAC">ALGERAC</option>
              <option value="BASTP">BASTP</option>
              <option value="WTC Algiers">WTC Algiers</option>
          </select>
      </div>
      <div class="input_container">
          <div class="label">Poste occupé(e) : <span  style="color: rgb(224, 36, 36);">*</span></div>
          <input class="input required" placeholder="Ex: DRH" id="poste" type="text" name="" required>
      </div>

      `)
    }else{

    }
} );




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
  
    let user_data={
      first_name:$("#first_name").val(),
      last_name:$("#last_name").val(),
      phone:$("#phone").val(),
      email:$("#email_register").val(),
      poste:$("#poste").val(),
      password_backup:$("#password_register").val(),
    
    }

    let type = {type:$('.type_company').val()}

    let company_data={
      name:$("#company_name").val(),
      nif:$("#nif").val(),
    }
  

  let res = await ajax('/register',{user_data,company_data, type}); 
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
