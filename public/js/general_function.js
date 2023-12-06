function sendDataToFlutter(data){
  if(!window.flutter) return;

  window.flutter.postMessage(data);
}


function onClick(selector, callback_function){
    $(document).on('click',selector, callback_function);
};

async function delay(timeout){
	await new Promise(r => setTimeout(r, timeout));
  // alert()
}

function searchBar(selector){
    $(".search_bar").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $(selector).filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  }

function upload_image(file, callback){
    if(callback==undefined){callback=function(){};}
  
    let ajax = new XMLHttpRequest(); 

  ajax.addEventListener("load", function (e) {
        let data = JSON.parse(e.target.response);
      callback(data, 'load');	
  }, false);
  ajax.addEventListener("error", function (e) {
    callback(e, 'error');
  }, false);

  ajax.addEventListener("abort", function (e) {
    callback(e, 'abort');
  }, false);

  ajax.open("POST",'/uploads');

  var formData = new FormData();
  formData.append('file', file);
  ajax.send(formData);
};


// function carousel(selector,passed_options){
// 	try{
// 		$(selector).wrapInner('<div class="swiper-wrapper"></div>');
// 		$(selector).find('.card').addClass('swiper-slide');
	
// 		var options={  slidesPerView: "auto",   freeModeSticky:true, freeModeMomentumRatio:0.4	};
// 		if(passed_options){
// 			$.each(passed_options, function(option_title, option_value){
// 				options[option_title]=option_value;
// 			})
// 		}
		
// 		if(GV.swipers[selector]){	GV.swipers[selector].destroy(true, true); }
// 		GV.swipers[selector]= new Swiper (selector, options);
// 	}catch(e){

// 	}
// }






function carouselVertical(selector,passed_options){
	try{
		// if($(selector).find('.swiper-wrapper'))return
		$(selector).wrapInner('<div class="swiper-wrapper"></div>');
		$(selector).find('.card_carousel_vertical').addClass('swiper-slide');
        var options={ direction: 'vertical',
        loop:false,
        centeredSlides: true,
        slidesPerView: 'auto', 
        freeModeSticky:true,
        initialSlide: 1
       };
		if(passed_options){
			$.each(passed_options, function(option_title, option_value){
				options[option_title]=option_value;
			})
		}
		
		if(GV.swipers[selector]){	GV.swipers[selector].destroy(true, true); }
		GV.swipers[selector]= new Swiper (selector, options);
	}catch(e){

	}
}

function display_card_placeholders($selector, number) {
	if ($selector.length == 0)  return; 
	$selector.find('.empty-card').remove();
	$selector.each(function () {
        
		while ($(this).find('.card').length < number) {
            console.log('card number',$(this).find('.card').length);
			var html = `<div class="card empty-card"></div>`;
			$(this).append(html);
		}
	})

}
function check_form(selector) {
    let res = true;
    $(`${selector} .required`).each(function () {
      console.log($(this).val())
      if ($(this).val() == "" || ($(this).val() == null) ){
        res = false;
        $(this).css('border', '1px solid #ff0000a8');
        return true;
      }
      // $(this).css('border', '1px solid #50b948cc');
    })
    return res;
  }


function check_formulaire(){
    var error="";
  
    $('.required').each(function(){   
        if(!$(this).val()){
            $(this).css('border-bottom','1.5px solid #ff00007d');
            error="Veuillez renseigner tous les champs.";
			html = `<div class="alert">${error}</div>`
			$('.massage').html(html)

        }else{
            $(this).css('border-bottom','1.5px solid black');
            // error="Veuillez renseigner correctement tous les champs.";
			// html = `<div class="alert">${error}</div>`
			// $('.massage').html(html)
			
        }
    });
    $('.require').each(function(){   
        if(!$(this).val()){
            $(this).css('border-color','#ff00007d');
            // error="Veuillez renseigner tous les champs.";
			// html = `<div class="alert">${error}</div>`
			// $('.massage').html(html)
			error="Veuillez renseigner tous les champs.";

        }else{
			
        }
    });

    if($('#phone-number').val() != $('#phone-number-confirmation').val()){
        $('#phone-number, #phone-number-confirmation').css('border','2px solid red');
        error="Veuillez vérifier votre N° de téléphone";
    }else{
        $('#phone-number, #phone-number-confirmation').css('border-bottom','1.5px solid #ff00007d');
    }
    return error;
  }
  
  
  function initialize_observer($selector, callback){
    var options={ threshold: 0.1};
    $selector.each(function(){
        var intersectionObserver = new IntersectionObserver(entries => {
            var is_intersecting=true;
            if(entries[0].intersectionRatio <= 0){
                var is_intersecting=false;
            }
            callback($(entries[0].target),is_intersecting, intersectionObserver);
    },options);
    intersectionObserver.observe(this);

    });
}


function launch_animation($target, is_intersecting, intersectionObserver){
    if(!is_intersecting){return;}
    var animation_name=$target.data('animation');
    $target.addClass(animation_name).removeClass('animatable');
    intersectionObserver.unobserve($target[0]);
}


  
async function ajax(url, data) {
  console.log(url)
    return await $.ajax({ type: "POST", url, data });
} 


  
function navigate_to(page_name){
    $(".page, #bars_menu_container, #overlay").css('display','none')
    $(`.page[data-id="${page_name}"]`).css('display','grid')
    if(!GV.initialize_page[page_name]) return;
    GV.initialize_page[page_name]();
    GV.page_name = page_name
    window.history.pushState({}, "Beker", get_next_page_url(page_name));
   
} 

onClick(".link", function(){
    if(!$(this).data('id')) return;
    $('.link').removeClass('selected_link')
    $(this).addClass('selected_link')
    navigate_to($(this).data('id'));
  })
  
  
  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

// async function get_session_name (){
  
//         try{
//           // let data = await ajax('send_session_name');  
            
//               GV.current_user =  getCookie("user_id")
             
//          }catch(e){
//              $('.loading-container').append('<div class="loading-error">Une erreur s\'est produite</div>');
         
//          }
  
//   }

async function get_session_id (){
  
        try{
          let data = await ajax('send_session_name');  
          GV.session_id= data.userid
             
         }catch(e){
             $('.loading-container').append('<div class="loading-error">Une erreur s\'est produite</div>');
         
         }
  
  }


async function get_session_id_cookies (){
  
    try{
      console.log(getCookie("session_id"),"je suis get session id")
      GV.session_id=  getCookie("session_id")
      if(GV.session_id==""){
        display_app_notification("2",`<div class=""><div>Un problème est survenu !</div><div class="text_color4" style="font-size:15px!important">veuillez relancer l'application</div><div>`)

      }
      
     }catch(e){
         $('.loading-container').append('<div class="loading-error">Une erreur s\'est produite</div>');
         console.log(e,"error")
         
         display_app_notification("2",`<div class=""><div>Un problème est survenu !</div><div class="text_color4" style="font-size:15px!important">veuillez relancer l'application</div><div>`)

     }

}

async function load_items_session (name,where,  reload = false){

  $('.loading-error').remove();
  // if(GV[name] && reload){
      try{
        let data = await ajax('load_items',{table_name:name,where});  
           
            index_itemsWithUsername(data.reponses)
            GV.username = data.username
       }catch(e){
           $('.loading-container').append('<div class="loading-error">Une erreur s\'est produite</div>');
          //  setTimeout(function(){ init_page(name); },2000);
          
       }
  // }
}


async function load_items (name,where,  reload = false){
    $('.loading-error').remove();
    // if(GV[name] && reload){
        try{
          let data = await ajax('/load_items',{table_name:name,where});  
          index_items(data.reponses);
         }catch(e){
             $('.loading-container').append('<div class="loading-error">Une erreur s\'est produite</div>');
            //  setTimeout(function(){ init_page(name); },2000);
         }
    // }
  }


  function index_itemsWithUsername(data){
    $.each(data, function(table_name, table_data){
        if( GV[table_name] == undefined ){   GV[table_name]={};  }
        $.each(table_data, function(row_index, row){
            GV[table_name][row.username]=row;
            $.each(row, function(column_name, column_value){
                if(typeof column_value != "string"){return true;}
                if(column_value[0] == '{' || column_value[0] == '['  ){
                    try{GV[table_name][row.username][column_name]=JSON.parse(column_value);}catch(e){console.error(e)}              
                }
            });
        });
    });
  }
  function index_items(data){
    $.each(data, function(table_name, table_data){
        if( GV[table_name] == undefined ){   GV[table_name]={};  }
        $.each(table_data, function(row_index, row){
            GV[table_name][row.id]=row;
            $.each(row, function(column_name, column_value){
                if(typeof column_value != "string"){return true;}
                if(column_value[0] == '{' || column_value[0] == '['  ){
                    try{GV[table_name][row.id][column_name]=JSON.parse(column_value);}catch(e){console.error(e)}              
                }
            });
        });
    });
  }


  
  function uniqueid(){
    var idstr=String.fromCharCode(Math.floor((Math.random()*25)+65));
    do {                
        var ascicode=Math.floor((Math.random()*42)+48);
        if (ascicode<58 || ascicode>64){
            idstr+=String.fromCharCode(ascicode);    
        }                
    } while (idstr.length<32);

    return (idstr);
}


      
  async function addSite(table_name, form_selector,storage){
    var obj = {}
    $(form_selector).find('input, textarea, select').each(function () { 
        if (!$(this).data('id')) {
          return;
        }
          obj[$(this).data('id')] = $(this).val();
      });
    if(table_name == "exposants"){
      obj['logo'] = GV.image_name 
      obj['status'] = "En attente"
    }
    var data = await ajax('/add_to_database', {obj,table_name });
    
    if (data.ok) {
        $('.find_class').find('input, textarea, select').val('')
    }
    else{
        console.log(data.error)
      // alert('ça marche pas!')
    }
  
  }


  function generate_password(word1,word2){
    let  generate_password= GV.session_id+word1+word2
    return generate_password
  }
  
  async function add(table_name, form_selector,storage,obj){
    // let obj={to_id: 27, from_id: "28", start: "2022-11-10 10:00:00", to_company_id: "6", from_company_id: "100"}
    if(window.location.pathname=="/app"){
      display_app_notification("0")
    }
    console.log(obj,"console from add function")
    
    if(form_selector!=""){
    
      var obj = {}
      $(form_selector).find('input, textarea, select').each(function () { 
        if (!$(this).data('id')) {
          return;
        }

          obj[$(this).data('id')] = $(this).val();
          console.log(obj[$(this).data('id')],'hey')
      });
    }

    if(table_name=="users"&& window.location.pathname=="/corporate"){
      console.log(GV.session_id)
        obj['id_company']=GV.session_id
        obj['password_backup']=generate_password(obj["last_name"],obj["phone"])
        
    }
    console.log(obj,"console from add function")
    var data = await ajax('/add_to_database', {obj,table_name });
    
    if (data.ok) {

      if(window.location.pathname=="/app"){
        display_app_notification("1")
        let id=data.id
        storage[id]=data.reponses[id]
        GV.id_memeberStorage = id


      }else if(window.location.pathname=="/login-corporate"){
       $("#login_page").css("display",'none')
        $('.notification_container').css("display","block")
        
        let id=data.id
        storage[id]=data.reponses[id]
        GV.id_memeberStorage = id


      }else if(window.location.pathname=="/corporate"){
        displayPopup(' Ajouté avec succès !','Un mot de passe à été généré et envoyé par email à votre collaborateur, ce dernier pourra ainsi se connecter à son espace B2B dédié ','success')
        $('#side_menu').css('display','none');
        let id=data.id
        storage[id]=data.reponses[id]
        GV.id_memeberStorage = id


      }
      else{ 
        displayPopup(' Ajouté avec succès !','','success')
        $('#side_menu').css('display','none');
          let id=data.id
          storage[id]=data.reponses[id]
          GV.id_memeberStorage = id
  
      }

       
    }else{
      if(window.location.pathname=="/app"){
        display_app_notification("2","Demande de rendez-vous envoyé avec success...")
        console.log(data.error)
      }
      else if(window.location.pathname=="/corporate" && table_name=="users"){
        displayPopup('Un probléme est survenu ! ',data.error,"")
        console.log(data.error,"une erreur")

  
        // alert()


      }else{
        console.log(data.error,"une erreur")
      }
      
    }
    
  
  }
  
  async function  update(id, table_name, form_selector ,storage,obj){
    
    if(window.location.pathname=="/app"){
      display_app_notification("0")

    }

    if(form_selector!=""){
      var obj = {}
      $(form_selector).find('input, textarea, select, .btn_create_link').each(function () {
        if (!$(this).data('id')) {
          return;
        }
          obj[$(this).data('id')] = $(this).val();
          console.log($(this).val())
      });

    }
      if(table_name == 'companies' &&  window.location.pathname=="/corporate"){
        var obj = {}
        obj['tutorial'] = 1
      } else if(table_name == 'companies' &&  window.location.pathname=="/admin"){
        obj['status'] = 1
      }else{
      console.log(table_name, form_selector, obj )
    }
    let data = await ajax('update_to_database', {
        id,
        obj,
        table_name
      });

    if (data.ok) {

      if(table_name == 'companies' &&  window.location.pathname =="/corporate"){

      }else if(window.location.pathname=="/admin"){

          $('#side_menu').css('display','none');
          displayPopup(' Modifié(e) avec succès !','Compte corporate modifié avec succès et un email à été envoyé','success')
         
    
        } else if(window.location.pathname=="/app"){
  
          if(table_name=="appointment" && obj.status==2){
            display_app_notification("1","Rendez-vous décliné avec succés")
            }else{
            display_app_notification("1","Rendez-vous accepté avec success...")
  
           }
  
        }else{
          displayPopup(' Modifié(e) avec succès !','','success')
          $('#side_menu').css('display','none');
    
        }
  
  
      
      let id=data.id
      storage[id]=data.reponses[id]
    }
    else{


      if(window.location.pathname=="/app"){
        display_app_notification("2")
        console.log(data.error)

      }else{
        console.log(data.error)
        displayPopup(' Un probléme est survenu ! ','','fail')

      }

    }
  }
  




  async function delete_item(id , table_name,storage){
    
    let data = await ajax('delete_from_database', {
        id,
        table_name
      });

    if (data.ok) {
      if(window.location.pathname=="/corporate"){

        displayPopup('Supprimé(e) avec succès !','Vous pouvez désormais ajouter un nouvel utilisateur à la place','success')

      }else{
        displayPopup('Supprimé(e) avec succès !','','success')

      }
      $('#side_menu').css('display','none');
      delete storage[id]
    }
    else{
      
        console.log(data.error)
       displayPopup(' Un probléme est survenu ! ','','fail')

    }
    
  }

  // function check_form(selector) {
  //   let res = true;
  //   $(`${selector} .required`).each(function () {
  //     console.log($(this).val())
  //     if ($(this).val() == "") {
  //       res = false;
  //       $(this).css('border', '2px solid red');
  //       return true;
  //     }
  //     // $(this).css('border', '2px solid green');
  //   })
  //   return res;
  // }


  function check_obj_filters(obj, filters){ 
    if(!filters) filters={};
    if(filters.category != obj  && filters.category != "") return false;
    return true;  
  }
      

  function ExportToExcel(selector, fileName, type, fn, dl) {
    
    var elt = document.getElementById(selector);
    var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl ?
      XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
      XLSX.writeFile(wb, fn || ( fileName + (type || 'xlsx')));
 }


 

async function load_itemsSite (name,where, reload = false){
  $('.loading-error').remove();
      try{
        let data = await ajax('/load_items',{table_name:name,where}); 
        index_itemsSite(data.reponses);
       }catch(e){
           $('.loading-container').append('<div class="loading-error">Une erreur s\'est produite</div>');
       }
}

function index_itemsSite(data){
  $.each(data, function(table_name, table_data){
      if( GV[table_name] == undefined ){   GV[table_name]={};  }
      $.each(table_data, function(row_index, row){
          GV[table_name][row.unique_id]=row;
          $.each(row, function(column_name, column_value){
              if(typeof column_value != "string"){return true;}
              if(column_value[0] == '{' || column_value[0] == '['  ){
                  try{GV[table_name][row.unique_id][column_name]=JSON.parse(column_value);}catch(e){console.error(e)}              
              }
          });
      });
  });
}




async function  updateFromForm(id,route, form_selector,storage, error_msg){

  var obj = {}
  $(form_selector).find('input, textarea, select, .btn_create_link').each(function () {
      if (!$(this).data('id')) {
        return;
      }
        obj[$(this).data('id')] = $(this).val();
        console.log($(this).val())
    });
    if(route == '/updatedocument'){
      obj['src'] = GV.document_name
      obj['picture'] = GV.image_name
    } if(route == '/updateuser'){
      obj['picture'] = GV.image_name
    }if(route == '/updateuserAdministration'){
      obj['picture'] = GV.image_name
      obj['id_companies'] = GV.CompaniesArray
  
    }
  let data = await ajax(route, {
      id,
      obj
    });
  
  if (data.ok) {
    $('.popup').css('display','block');
    $('.message').html('Modifié(e) avec succès')
    $('.popup_footer').html('<div class="btn btn-outline-success ok" style="font-weight: 600;"><i class="fa-solid fa-xmark"></i></div>')
  
    $('#side_menu_add_container').css('display','none');
    let id=data.id
    storage[id]=data.reponses[id]
    GV.storageUpdate = storage[id]
    return true
  }
  else{
    if(data.ok == "message d'erreur"){
      $('#error').html(error_msg)
    }else{
        $('.popup_problem, #overlay').css('display','block');
        $('.message').html("Un problème s'est produit")
        $('.popup_footer').html('<div class="btn btn-outline-success ok" style="font-weight: 600;"><i class="fa-solid fa-xmark"></i></div>')
  
        $('#side_menu_add_container').css('display','none');
        console.log(data.error)
        alert('ça marche pas!')
    }
  }
  }
  



function displaySide(arr, side, id, object){

  console.log(id,object)
  var index = 0
  $('#side_menu').html('')

  html = `  
      <div class="header_side_menu line_bottom">
        <div id="skip_btn" class="exit text_color3"><span class="material-symbols-outlined">arrow_back_ios</span></div>
        <div class="title">${id==undefined ? side.title_add : side.title_update}</div>
      </div>
      <div class="body_side_menu">
        <div id="${side.id}" class="form_container">
        </div>        
        <div id="error"></div>
      </div>
      <div class="footer_side_menu padding20 center">
        <div class="buttons_container cursor">
          <div id="${id==undefined ? side.btn_add : side.btn_update}" class="btn text_white  cursor text_center color4  padding10 " data-id="${id==undefined ?  "" : id}">Valider</div>
        </div>
      </div>
      `
  $('#side_menu').html(html)  

  for(element of arr){
    var array = element
    var data_id = array.data_id 
    if(id) {var value = object[data_id]}
   
    
    if(array.selector == "input"){
      
      inputHtml=`
      <div class="input-container">
        <div class="label">${array.label}  <span  style="color: rgb(224, 36, 36);">*</span></div>
        <input class="content_editable required" type="${array.type}" data-id="${array.data_id}" contenteditable="true" value="${id==undefined ? "" : value}"></input>
      </div>
      ` 
      $('.form_container').append(inputHtml)
    }if(array.selector == "textarea"){
      textareaHtml = `
      <div class="input-container">
        <div class="label">${array.label}  <span  style="color: rgb(224, 36, 36);">*</span></div>
        <textarea class="content_editable required" type="${array.text}" data-id="${array.data_id}" contenteditable="true" value="${id==undefined ? "" :  value}">${id==undefined ? "" :  value}</textarea>
      </div>
      `
      $('.form_container').append(textareaHtml)

    }if(array.selector == "select"){
        index++
        selectHtml = `
        <div class="input-container">
          <div class="label">${array.label}  <span  style="color: rgb(224, 36, 36);">*</span></div>
          <select class="display_option${index} content_editable required"  data-id="${array.data_id}" contenteditable="true">
            <option value="${id==undefined ? "" : value}">${id==undefined ? "" : value}</option>
          </select> 
        </div>
        `        
        $('.form_container').append(selectHtml)

        for(element of array.option){
        var option =  element
        optionHtml = `
        <option value="${option.value}">${option.html}</option>
        `

        $(`.display_option${index}`).append(optionHtml)

      }
    }
  }

}


function CleanForm(form_selector){
  $(form_selector).find('input, textarea, select').each(function () { 
    $(this).val("")

  });
}


function display_app_notification(status,message,time){

  if(status=="0"){
    $("#request_failed").css("display","none")
    $('#overlay').css("display","grid")
    $('#request_appointment_check_out').css("display","block")
    $('#request_being_processed').css("display","block")

      
  }else if(status=="1"){
      $("#request_being_processed").css("display","none")
      if(message){
        $(".message_checkout").html("")
        $(".message_checkout").html(`${message}`)
  
      }
      $("#request_succeded").css("display","block")
      setTimeout(function(){
        $('#request_appointment_check_out').css("padding","0px")
        $('#request_appointment_check_out').css("height","0px")
        setTimeout(function(){
          // $('#request_appointment_check_out,#overlay').addClass('m-fadeOut')
          $('#request_appointment_check_out,#overlay,#side_menu_appointment').css("display","none")
          $('#request_appointment_check_out').css("padding","20px")
          $('#request_appointment_check_out').css("height","45vh")      
  
        },400)

      },2500)

  }
  else if(status="2"){
    $("#request_being_processed").css("display","none")
    $('#overlay').css("display","grid")
    $('#request_appointment_check_out').css("display","block")

    $(".message_checkout").html("")
    $(".message_checkout").html(`${message}`)
    $("#request_failed").css("display","block")
    
  }


}


function addMinutesToTime(time, minutesToAdd) {
  var result = moment(time).add(minutesToAdd, 'minutes').format('HH[H]mm');
  return result;
}



function openDrawer(){
  $(".drawer").removeClass("close")
  $(".drawer").addClass("open")
  $("#overlay").fadeIn()

}

function closeDrawer(){
  $('.drawer').addClass('close');
  $("#overlay").fadeOut()
  $('.drawer').on('animationend', function() {
    if ($(".drawer").hasClass('close')) {
      $(".drawer").removeClass('close');
      $(".drawer").removeClass('open');
     
    }
  });
}



async function updateButtonStatus($button, status,default_text){
  if(status === 'loading'){

    $button.prop('disabled', true);
    $button.html(`<span class="button-text">Chargement</span>
    <span class="loading-animation"></span>`).css('cursor', 'not-allowed !important');

  }else if(status === 'success'){

    setTimeout(function() {
      $button.prop('disabled', false);
      $button.html(`${default_text}`).css('background-color', 'var(--clr-primary)').css('cursor', 'pointer !important').css('background-image', 'var(--clr-primary)!important');
      },  500);
      $button.prop('disabled', true);
      $button.html(`<span class="button-text">succès</span>`).css('background-image', 'linear-gradient(98.69deg,#4caf50a3 -32.8%,#4CAF50 153.9%)').css('cursor', 'not-allowed !important');
      
  }else if(status === 'failed'){

    $button.prop('disabled', false);
    $button.html('Problème').css('cursor', 'pointer !important');

  }else if(status === 'default'){
    
    $button.prop('disabled', false);
    $button.html(`${default_text}`).css('cursor', 'pointer !important').css('background-image', 'var(--clr-primary)!important').css('background-color', 'var(--clr-primary)!important');
    

  }else{

  }
}
