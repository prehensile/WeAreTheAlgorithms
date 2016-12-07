const layrnx = require( "./layrnx" );
const scribe = require( "./scribe" );


function handleSentences( sentences, callback ){
    layrnx.renderSentences( sentences , function( err, urls ){
        if (err) return callback( err );
        else callback( null, urls );
    });
}


function getWelcome( callback ){
    scribe.constructWelcomeSentences(
        function( err,sentences ){
            if (err) return callback( err );
            else handleSentences( sentences, callback );
        }
    );
}


module.exports = {
    "getWelcome" : getWelcome
};