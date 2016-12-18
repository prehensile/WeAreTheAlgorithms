const fs = require('fs');

const secrets = require( './config/secrets' );
const bullshit = require( './vocabulary/bullshit');

const Bing = require('node-bing-api')({ accKey: secrets.BingKey });
const Tokenizer = require('sentence-tokenizer');


var tokenizer = new Tokenizer( 'node-sentences' );

var reClauses = new RegExp( /[,\;:\-\–\—\−]/gi );
var reConjunctions = new RegExp( /(\band\b)|(\bor\b)/gi );


function processItem( item, stems ){
    
    var statements = [];
    var d = item.description;
    
    // normalise stems to lowercase
    stems = stems.map( function(stem){
        return stem.toLowerCase();
    });

    // check description contains at least one stem
    var di = item.description.toLowerCase();
    stems.forEach(function(stem){
        
        var i = di.indexOf( stem );

        // bail if stem isn't in description
        if( i < 0 ) return;
        
        // break description into sentences
        tokenizer.setEntry( d );
        sentences = tokenizer.getSentences();

        // iterate over sentences...
        for( var ii in sentences ){
            
            var sentence = sentences[ii];
            
            // now, let's do some checks on the sentence.
            // if any fail, continue to the next sentence
            // without adding to the statements array

            // ditch sentences that contain too much bullshit
            if( bullshit.score( sentence ) > 2)
                continue;

            var stemIndex = sentence.toLowerCase().indexOf( stem );
            
            // only include sentences that include a stem
            if( stemIndex < 0 )
                continue;

            // trim sentence to stem and everything after
            sentence = sentence.substring( stemIndex );

            // if we've found a truncated sentence...
            if( sentence.indexOf( "..." ) > -1 ){
                var firstClause = reClauses.exec( sentence ) || [];
                var firstConjoiner = reConjunctions.exec( sentence ) || [];
                
                // if we haven't matched any conjoiners or clauses in the sentence, bail
                if( firstClause.length + firstConjoiner.length < 1 )
                    continue;

                // if we haven't bailed, use the first conjoiner or clause marker as a break point
                var breakIndex = sentence.length;
                if(firstClause.length > 0) breakIndex = Math.min( breakIndex, firstClause.index );
                if(firstConjoiner.length > 0) breakIndex = Math.min( breakIndex, firstConjoiner.index -1 );

                // chop truncated sentence down to first clause
                sentence = sentence.substring( 0, breakIndex );
            }

            // don't want really short sentences
            // (split on a space to count words)
            if( sentence.split(' ').length < 3 )
                continue;

            // quotations usually turn out weird
            if( sentence.match(/["“”]/gi) )
                continue;

            // as do things with a lot of clauses
            var m = sentence.match( reClauses );
            if( m && m.length > 2 )
                continue;

            // if we're here, the sentence has passed all checks
            // ( no continues have been hit)
            if( statements.indexOf( sentence ) < 0 )
                statements.push( sentence );
        }

    });

    return statements;
}


function processResults( body, stems ){

    var statements = [];
    for( var i in body.value ){
        var thisItem = body.value[i];
        var sentences = processItem( thisItem, stems );
        if( sentences.length > 0 ){
            statements = statements.concat( sentences );
        }
    }

    return statements;
}


function getStatementsWithStemsAndSubject( stems, subject, callback ){

    // construct query
    var queryElements = [];
    stems.forEach( function(stem,index,array){
        queryElements.push( `"${stem}"` );
    });
    var q = queryElements.join( " OR " );

    if( subject ) q = `"${q}" AND "${subject}"`;

    console.log( `bing query: ${q}` );
    var ms = new Date().getTime();

    Bing.news( q , {
        top: 100,  // Number of results (max 15) 
    
    }, function(error, res, body){
        
        ms = new Date().getTime() - ms;
        console.log( `-> bing query completed in ${ms}ms` );
        //console.log( res );

        if( error ){
            return callback( error, null );
        }

        var statements = processResults( body, stems );
        callback( null, statements );

    });
}


const defaultStems = [ 'algorithms are', 'algorithms will' ];

function getStatementsForSubject( subject, callback ){
    getStatementsWithStemsAndSubject( defaultStems, subject, callback );
}


function getOpeningStatements( callback ){
    getStatementsWithStemsAndSubject( defaultStems, null, callback );
}


module.exports = {
    "getOpeningStatements" : getOpeningStatements,
    "getStatementsForSubject" : getStatementsForSubject,
    "processItem" : processItem
};