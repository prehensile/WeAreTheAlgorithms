
const words = [
    "site",
    "rank",
    "social",
    "platforms",
    "influencer"
];


function bullshitScore( sentence ){
    var score = 0;
    words.forEach( function(word){
        var m = sentence.match( new RegExp(word,'gi') );
        if( m ) score += m.length;
    });
    return score;
}


module.exports = {
    "words" : words,
    "score" : bullshitScore
};