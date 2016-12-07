function SSMLForAudioURLs( audioURLs ){
    var ssml = "<speak>";
    for (var i = 0; i < audioURLs.length; i++) {
        var audioURL = audioURLs[i];
        ssml += `<audio src="${audioURL}" />`;
    }
    ssml += "</speak>";
    return ssml;
}


function SSMLForSpeechElements( elements ) {
    var ssml = "<speak>";
    
    for (var i = 0; i < elements.length; i++) {
        
        var element = elements[i];
        var type = element[ "type" ];
        var content = element[ "content" ];

        if(type === 'text'){
            ssml += content
        } else if( type === 'audio'){
            ssml += `<audio src="${content}" />`;    
        }
    }
    
    ssml += "</speak>";
    
    return ssml;
}


module.exports = {
    "SSMLForAudioURLs" : SSMLForAudioURLs,
    'SSMLForSpeechElements' : SSMLForSpeechElements
};