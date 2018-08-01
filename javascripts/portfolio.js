'use strict';

// $('.portfolio-box').hover(boxHoverOn, boxHoverOut);

$(document).ready(() => {
  $('.portfolio-box').hover(boxHoverOn, boxHoverOut);
});

// need to get the id of the box the user hovers over,
// at this point the hover fxn's are applied to portfolio-box class items
// but getting the id of each seperate one is difficult
var boxHoverOn = (ev) => {
  // console.log("js get id", document.getElementById('portfolio-blurb'));
  console.log("jquery get id", $("#portfolio-blurb"));

  // console.log("here", this.document.body);
  var target = $(ev.target);
  // console.log(target);

  var elId = target.attr('id');
  console.log("found", target.has($('#portfolio-blurb')));
  
  if (target.is($('#portfolio-blurb'))) {
    console.log('The mouse was over ' + elId);
  }

};
var boxHoverOut = () => {
  // console.log("there");
}; 