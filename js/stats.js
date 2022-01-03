function displayStats(){
    $.dialog({
        title : '<i class="icon-wrench" style="color: #138496; font-size: 1.2em;"></i>Stats',
        content : '<stats-window></stats-window>',
        escapeKey: true,
        backgroundDismiss: true,
        useBootstrap : false,
        boxWidth : 470,
        onContentReady: function(){
            riot.mount('stats-window');
        }
    })
}
