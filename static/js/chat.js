$(document).ready(function(){
    var userId = Math.random().toString(36).substring(7);

    $('#user_input_form').submit(function(event){
        event.preventDefault();
        var userMessage = $('#user_input').val();
        $('#chat_output').append('<div class="user-message">' + userMessage + '</div>');
        $('#user_input').val('');

        $.ajax({
            url: '/chat',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({text: userMessage, user_id: userId}),
            success: function(response){
                var botResponse = response.bot_response;
                $('#chat_output').append('<div class="bot-message">' + botResponse + '</div>');
            }
        });
    });
});


