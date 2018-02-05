
function submit_name(obj){
    var name=$('#name-input').val();
    $.ajax({
        url:'/name',
        method:'post',
        data:{'name':name},
        success:function(result){
            console.log(result);
            if(result == "NN"){
                $(obj).parent().children('.err').html("").fadeOut().fadeIn(500).html("&nbsp;Select a name please")
                .delay(2000).fadeOut();
            }
            else {
                $('#current-name').html(name);
                if(result === "Done"){
                    $("#name-select").html($("#name-select").html() + "<option>"+name+"</option>")
                    $('#name-stat').html("this is a new name");
                }
                else 
                    $('#name-stat').html("this name was used before, but you can use it now");
            }        
        }
    });
}

function add_post(post){
    var div = document.createElement('div');
            div.innerHTML = post;
            $('#new-post').after(div);
}

function add_comment(obj,comment){
    var div = document.createElement('div');
            div.innerHTML = comment;
            $(obj).parent().children(".err").after(div);
}

function submit_post(obj){
    var post=$('#post-input').val();
    var name=$('#current-name').html();
    $('#post-input').val('')
    $.ajax({
        url:'/post',
        method:'post',
        data:{'content':post},
        success:function(result){
            if(result != "NS" && result!="NC" ){
                add_post(result);
            }
            else if(result == "NS"){
                $(obj).parent().children('.err').html("").fadeOut().fadeIn(500).html("&nbsp;Select a name please")
                .delay(2000).fadeOut();
            }
            else if(result == "NC"){
                $(obj).parent().children('.err').html("").fadeOut().fadeIn(500).html("&nbsp;Write a post please")
                .delay(2000).fadeOut();
            }
        }
    })
}

function like_post(obj){
    var post=$(obj).parent().children('input[name=id]').val();
    $.ajax({
        url:'/post/like',
        method:'post',
        data:{'id':post},
        success:function(result){
            if(result != "ERR"){
                $(obj).parent().children('.like').html(result);
            }
        }
    })
}


function submit_comment(obj){
    var content=$(obj).parent().children('input[name=comment-input]').val();
    var name=$('#current-name').html();
    var post=$(obj).parent().children('input[name=id]').val();
    $(obj).parent().children('input[name=comment-input]').val('');
    $.ajax({
        url:'/comment',
        method:'post',
        data:{'content':content,'post':post},
        success:function(result){
            if(result != "NC" && result != "NN"){
               add_comment(obj,result);
            }
            else if(result == "NN"){
                $(obj).parent().children('.err').html("").fadeOut().fadeIn(500).html("&nbsp;Select a name please")
                .delay(2000).fadeOut();
            }
            else if(result == "NC"){
                $(obj).parent().children('.err').html("").fadeOut().fadeIn(500).html("&nbsp;Write a comment please")
                .delay(2000).fadeOut();
            }
        }
    })
}

function delete_comment(obj){
    var id=$(obj).parent().children('input[name=comment-id]').val();
    $.ajax({
        url:'/comment',
        method:'delete',
        data:{'id':id},
        success:function(result){
            if(result == "Done"){
               $(obj).parent().remove();
            }
            else if(result == "NS"){
                $('#post-err').html("Select a name please");
            }
        }
    })
}

function delete_post(obj){
    var id=$(obj).parent().children('input[name=id]').val();
    $.ajax({
        url:'/post',
        method:'delete',
        data:{'id':id},
        success:function(result){
            if(result == "Done"){
               $(obj).parent().parent().remove();
            }
            else if(result == "NS"){
                $('#post-err').html("Select a name please");
            }
        }
    })
}

function change_name(){
    var name = $("#name-select").val();
    console.log(name);
    $("#name-input").val(name);
    submit_name($("name-btn"));
}