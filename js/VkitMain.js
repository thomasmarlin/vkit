
var MARGIN_LEFT = 0.35;
var MARGIN_TOP = 0.35;

var MAX_PAGE_BOTTOM = 11.0 - MARGIN_LEFT;
var MAX_PAGE_RIGHT = 8.5 - MARGIN_TOP;

var CARD_WIDTH = 2.5;


var matchingCards = [];
var cardsForPdf = [];
var printedCards = [];



function expandCollapseInstructions() {
    var displayMode = jQuery('#instructionsObj').css('display');
    if (displayMode == "none") {
        jQuery('#instructionsObj').css('display', 'block');
    } else {
        jQuery('#instructionsObj').css('display', 'none');
    }
}

function getFilterText() {
  var textObj = jQuery('#filterText');
  return textObj.val();
}

function updateMatchingCards() {

    var filterText = getFilterText();
    console.log("Filter Change!: " + filterText);


    matchingCards.length = 0;
    for (var i = 0; i < allCardNames.length; i++){
        var matches = false;

        var lowercaseFilterText = filterText.toLowerCase();

        if ("" == lowercaseFilterText) {
            matches = true;
        } else if (-1 != allCardNames[i].toLowerCase().indexOf(lowercaseFilterText)) {
            matches = true;
        }

        if (matches) {
            matchingCards.push(allCardNames[i]);
        }
    }

    jQuery('#selectAdds').find('option')
      .remove();

    for (var i = 0; i < matchingCards.length; i++) {
        var match = matchingCards[i];
        console.log("Add card: " + match);
        jQuery('#selectAdds').append('<option value="' + match + '">' + match + '</option>');
    }

}

function queueFilterChange() {
    setTimeout(filterChanged, 250);
}

function filterChanged() {
    updateMatchingCards();
}

function addSelectedCards(isWhiteBorder) {

  // Try to add the cards next to it's duplicates (if exist)
  $("#selectAdds").find(":selected").each(function() {
      var cardToAdd = jQuery(this).val()

      if (isWhiteBorder) {
          cardToAdd += " (WB)";
      }

      var added = false;
      for (var j = 0; j < cardsForPdf.length; j++) {
          if (cardsForPdf[j] == cardToAdd) {
              cardsForPdf.splice(j, 0, cardToAdd);
              added = true;
              break;
          }
      }

      if (!added) {
          cardsForPdf.push(cardToAdd);
      }

      jQuery('#selectedRemoves').find('option')
        .remove();

      for (var i = 0; i < cardsForPdf.length; i++) {
          var match = cardsForPdf[i];
          console.log("Add card: " + match);
          jQuery('#selectedRemoves').append('<option value="' + match + '">' + match + '</option>');
      }

  });

}

function removeSelectedCards() {
    $("#selectedRemoves").find(":selected").each(function() {
        var cardToRemove = jQuery(this).val();
        for (var j = 0; j < cardsForPdf.length; j++) {
            if (cardsForPdf[j] == cardToRemove) {
                jQuery(this).remove();
                cardsForPdf.splice(j, 1);
                break;
            }
        }
    });
}


function convertImgToBase64(isWhiteBorder, url, callback)
{
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  img = document.createElement('img'),
  img.src = url;
  img.onload = function() {
    canvas.height = img.height;
    canvas.width = img.width;
    var context = canvas.getContext('2d');

    context.drawImage(img, 0, 0);

    if (isWhiteBorder) {
        convertCanvasToWhiteBorder2(canvas);
    }

    var dataURL = canvas.toDataURL('image/jpeg');
    var aspectRatio = canvas.height / canvas.width;
    callback(dataURL, aspectRatio);
    canvas = null;
  };
  img.onerror = function() {
      console.log("Failed ot open image: " + url);
      callback(null);
  }

}

function sortCards(originalList, fullTemplates, halfSlips){
  for (var i = 0; i < originalList.length; i++) {
      var card = originalList[i];
      if (card.aspectRatio > 1) {
          // Card is taller than wide
          fullTemplates.push(card);
      } else {
          halfSlips.push(card);
      }
  }
}

function setPrintPoint(pointObj, top, left, bottom, right) {
  pointObj.top = top;
  pointObj.left = left;
  pointObj.bottom = bottom;
  pointObj.right = right;
}

function printCards(doc, cardsToPrint, lastPrintPoint) {

  for (var i = 0; i < cardsToPrint.length; i++) {
      var card = cardsToPrint[i];

      var calculatedHeight = CARD_WIDTH * card.aspectRatio;
      //console.log("calculatedHeight: " + calculatedHeight);

      var nextTop = lastPrintPoint.top;
      var nextLeft = lastPrintPoint.right;
      var addedPageOrRow = false;

      // If this card exceeds the bottom, add a new page
      if ((nextTop + calculatedHeight) > MAX_PAGE_BOTTOM) {
          // Won't fit on page!  Add a new page!
          //console.log("Next bottom would have been off-page. Figuring out to adapt!");
          doc.addPage();
          addedPageOrRow = true;
          nextTop = MARGIN_TOP;
          nextLeft = MARGIN_LEFT;
      }

      // If this card will exceed the width, add a new row OR a new page if needed
      if ((nextLeft + CARD_WIDTH) > MAX_PAGE_RIGHT) {
          //console.log("Next right edge would have been off screen. Figuring out how to adapt!");
          nextTop = lastPrintPoint.bottom;

          // Need to add a new row
          if ((nextTop + calculatedHeight) < MAX_PAGE_BOTTOM) {
              // Card will fit in the page in the next rows
              //console.log("Adding new row!");
              nextTop = lastPrintPoint.bottom;
              nextLeft = MARGIN_LEFT;
              addedPageOrRow = true;
          } else {
              // Need a whole new page
              //console.log("Adding new page!");
              doc.addPage()
              nextTop = MARGIN_TOP;
              nextLeft = MARGIN_LEFT;
          }
      } else {
          // Card will fit in this row on this page!  No adjustments needed.
      }

      if (card.dataUrl != null){
          doc.addImage(card.dataUrl, 'jpeg', nextLeft, nextTop, CARD_WIDTH, calculatedHeight);
      }

      // 'bottom' of last card can't be any higher than the lowest card in the current row
      var bottomOfLastPrintedCard = nextTop + calculatedHeight;
      if (!addedPageOrRow) {
          bottomOfLastPrintedCard = Math.max(bottomOfLastPrintedCard, lastPrintPoint.bottom);
      }
      // Adjust the print-point based on the card we just added
      setPrintPoint(lastPrintPoint, nextTop, nextLeft,
                                    bottomOfLastPrintedCard, nextLeft + CARD_WIDTH);

  }

}


function generatePdf() {

    var doc = new jsPDF('portrait', 'in', 'a4');

    var cardsWithSizes = [];

    function addNextCard(currentCardIndex) {
        if (currentCardIndex == cardsForPdf.length) {

          var halfSlips = [];
          var fullTemplates = [];
          sortCards(cardsWithSizes, fullTemplates, halfSlips);

          var cardsInCurrentRow = 0;
          var rowsPrinted = 0;

          var lastPrintPoint = {
              left: MARGIN_LEFT,
              top: MARGIN_TOP,
              right: MARGIN_LEFT,
              bottom: MARGIN_TOP
          }
          printCards(doc, fullTemplates, lastPrintPoint);
          printCards(doc, halfSlips, lastPrintPoint);

          doc.output('save', 'vkitPdf.pdf');

        } else {

          var cardName = cardsForPdf[currentCardIndex];
          var isWhiteBorder = (-1 != cardName.indexOf(" (WB)"));
          var cardPath = allCardImages[cardName];
          console.log("image: " + cardPath );

          var imgData = convertImgToBase64(isWhiteBorder, cardPath, function(dataUrl, aspectRatio){

              cardsWithSizes.push( {
                cardPath: cardPath,
                dataUrl: dataUrl,
                aspectRatio: aspectRatio
              })

              addNextCard(currentCardIndex+1);
          });
        }
    }

    addNextCard(0);
}


jQuery(document).ready(function(){

    console.log("After Loaded");

    console.log(JSON.stringify(allCardNames));

    updateMatchingCards();

    // Remove the default wordpress entry-header on swccgpc
    jQuery('.entry-header').css('display', 'none');

});
