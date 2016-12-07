function SSMLForAudioURLs( audioURLs ){
    var ssml = "<speak>";
    for (var i = 0; i < audioURLs.length; i++) {
        var audioURL = audioURLs[i];
        ssml += `<audio src="${audioURL}" />`;
    }
    ssml += "</speak>";
    return ssml;
}


module.exports = {
    "SSMLForAudioURLs" : SSMLForAudioURLs
};