const child_process = require('child_process');

const layrnx = require( "./layrnx" );
const scribe = require( "./scribe" );


function handleSentences( sentences ){
    layrnx.renderSentences( sentences , function(err,filenames){
        console.log( "#EXTM3U" );
        for (var i = 0; i < filenames.length; i++) {
            var fn = filenames[i];
            var sentence = sentences[i];
            console.log( `#EXTINF ${sentence}` )
            console.log( fn );
        }
    });
}


scribe.constructWelcomeSentences( function(err,sentences){
    if( err ) throw err;
    handleSentences( sentences );
});


//console.log( sentences );