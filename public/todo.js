

//html body onload="Load()" tag
function Load(){
 //alert('My-Todo-List is now loaded, welcome!');
 
 $.ajax({
      url: "/api/items",
      method: "GET"
    }).done(function(msg) {
    
      console.log(msg);
      //DO MAIN GET
      var i=0;
      for(i=0; i<msg.length; i++){
        var userName= msg[i].user_name;
        var taskName= msg[i].task;
        var complete= msg[i].complete;
        
        if(taskName===""){return false;} 
        if(userName===""){return false;}
        var taskHTML = '<li><span class="done">%</span>'
            taskHTML += '<span class="edit">+</span>'
            taskHTML += '<span class="delete">x</span>'
            taskHTML += '<span class="task"></span></li>'
        var $newTask = $(taskHTML);
        $newTask.find('.task').text(taskName+"    "+userName+"    ");
        
        if(complete){
          var $completeTask = $(taskHTML);
          $completeTask.find('.task').text(taskName+"    "+userName+"    "+"*"+"    ");
          $('#completed-list').prepend($completeTask);}
        else{$('#todo-list').prepend($newTask);}
      }
      
      
    }).fail(function(data, status){
    alert(status);
    }); 
 
}



//main
$(document).ready(function(e) {
//for testing purpose to see what is in the server through the console
$('#show').button({icons: {primary: "ui-icon-battery-3"  }});
$('#show').click( function(){
  $.get("/api/items", function(data, status){ console.log(data);})
});


$('#reset').button({icons: {primary: "ui-icon-battery-3"  }});
$('#reset').click( function(){
  location.reload();
  $.ajax({
    method: 'DELETE',
    url: '/api/items/reset',
    success: function () {
       alert("Reseting and clearing database...");
    }
   });
});








  var g;
  //ADD-dialog box (NOT autoOpen)
  $('#new-todo').dialog({ modal : true, autoOpen : false });
  
  //ADD-todo Button (formatting and on-click event)
  $('#add-todo').button({
    icons:{primary: "ui-icon-circle-plus" }}).click(function() {
    $('#new-todo').dialog('open'); 
  });
  
  
  //DIALOG 
  $('#new-todo').dialog({ modal: true, autoOpen:false,
  buttons: {
    "Add task": function() {
    var taskName= $('#task').val();
    var userName= $('#U').val();
    var c= 0;
    if(userName===""){return false;}
    if(taskName.length<3){ document.getElementById("error").style.display = 'block';  return false;} //to check the taskName cannot contain empty String
    var taskHTML = '<li><span class="done">%</span>'
        taskHTML += '<span class="edit">+</span>'
        taskHTML += '<span class="delete">x</span>'
        taskHTML += '<span class="task"></span></li>'
        
    var $newTask = $(taskHTML);
    
    $newTask.find('.task').text(taskName+"    "+userName+"    "); 
    
    $newTask.hide();
    $('#todo-list').prepend($newTask);  //actual add 
    
      
    //AJAX FOR ADD,POST
    $.post("/api/items",{"user_name":userName, "task":taskName, "complete":Boolean(c)} , function(data, status){
    })
    
    $newTask.show('clip', 250).effect('highlight', 1100); //effect
    $(this).dialog('close');
    }, //end of add-new-Task button in the dialog
    
    
    "Cancel": function() { $(this).dialog('close'); }
  },
  
   close:function() {
      $('#new-todo input').val('');              
   }
  });
  
  
  
  
  
  //2-5 mark as complete (TICK-BOX)
   $('#todo-list').on('click', '.done', function() {
   var $taskItem = $(this).parent('li');
   var x= $(this).parent('li').find('.task').text().split("    ");
   var taskEdit= x[0];
   var u_n =x[1];
   
   $taskItem.slideUp(250, function() {
   var $this = $(this);
   
     //Need to call PUT method here to update the complete status:
     $.ajax({
        method: 'PUT',
        url: '/api/items',
        data: {complete:Boolean(10>9), prev_t:taskEdit, user_name: u_n, task: taskEdit},
        success: function addCell() {
           alert("You had completed this task. Drag it back up if it is not yet finished.");
        }
    });  
   $this.detach();
   $('#completed-list').prepend($this);
    $this.slideDown();
   });
    });
 
    
    //sortable 2-6 support drag and drop
    //This drag and drop only allows one-way doing: completed-->todo (NOT todo-->completed)
    //Besides, only dropping the task on the top position will correctly updating database.
    
    $('.sortlist').sortable({
    connectWith: '.sortlist',
    cursor: 'pointer',
    placeholder: 'ui-state-highlight',
    cancel: '.delete, .done',
/** 
    update: function(event, ui){
      var x= ui.item.find('.task').text().split("    ");
       //console.log(ui.item);
       var t_n= x[0];
       var u_n= x[1];
       $.ajax({
        method: 'PUT',
        url: '/api/items',
        data: {complete: false, prev_t: t_n, user_name: u_n, task: t_n},
        success: function () {
           //alert("Drag and drop successfully done!");
        }
    }); 
    },  */
    receive: function(e, ui){
      var x= ui.item.find('.task').text().split("    ");
      var complete= (x[2]=="*");
      var t_n= x[0];
      var u_n= x[1];
      //console.log(complete);
      //console.log(!complete);
      $.ajax({
        method: 'PUT',
        url: '/api/items',
        data: {complete: !complete, prev_t: t_n, user_name: u_n, task: t_n},
        success: function () {
           //alert("Drag and drop successfully done!");
        }
    }); 

      
    }

    });

    
    


    
//     2-8 confirming deletion
//      add a dialog box 
   $('#confirm-delete').dialog({ modal : true, autoOpen : false }); 
   
   
   //activate #confirm-delete dialog box when clicking on the cross button.
    $(' .sortlist ').on('click', '.delete', function() {
    $('#confirm-delete').dialog('open'); 
    g = $(this)
  });
  
  

    $('#confirm-delete').dialog({ 
    modal: true, autoOpen:false,
    buttons: {
    "Confirm": function() {
     $(this).dialog('close')
     g.parent('li').effect('puff', function(){ g.parent('li').remove() })
     
     var target= g.parent('li').find('.task').text().split("    ");
     var t= target[0];
     var n= target[1];
    
     $.ajax({
        method: 'DELETE',
        url: '/api/items',
        data: {user_name: n , task: t},
        success: function addCell() {
           //alert("Successfully deleted.");
        }
       }); 

    }, //end of Confirm deletion button in the dialog
    
    "Cancel": function() { $(this).dialog('close'); }
  }
  });
  
  
  
  //-----------------------
  //2-9
  //edit-todo
  $('#edit-todo').dialog({ modal: true, autoOpen: false});
  
    $('.sortlist').on('click', '.edit', function () {
    $('#edit-todo').dialog('open')
    g = $(this)
  })
  
  
  $(' #edit-todo').dialog({
    modal: true, autoOpen: false,
    buttons:{
       Confirm: function(){
         var ed= $('#ed').val()
         var name= $('#u').val()
         if(ed===""){document.getElementById("err").style.display = 'block';  return false;}
         if(name===""){document.getElementById("err").style.display= 'block';  return false;}
         
         var x= g.parent('li').find('.task').text().split("    ");
         var taskEdit= x[0];
         var nameEdit= x[1];
         
         
       $.ajax({
        method: 'PUT',
        url: '/api/items',
        data: {prev_n: nameEdit, prev_t:taskEdit, user_name: name, task:ed, complete:false},
        success: function addCell() {
           alert("Successfully edited.");
        }
    });         
         
         $(this).dialog('close')
         //var num= g.parent('li').find('.task').text().charAt(0)
         var previousText = g.parent('li').find('.task').text(ed+"    "+name+"    ")
       },
       
       Cancel: function(){
       $(this).dialog('close');
       }
    }
  })
  

}); // end ready



