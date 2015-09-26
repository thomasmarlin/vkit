
var myApp = angular.module('vkit-app', []);

console.log("AfterLoad!");

angular.module('vkit-app').controller('VkitMain', ['$scope',  function($scope) {

    console.log(JSON.stringify(allCardNames));

    $scope.vkitModel = {
      filterText: ""
    };
    $scope.matchingCards = [];
    $scope.cardsForPdf = [];
    $scope.printedCards = [];


    function updateMatchingCards() {
        console.log("Filter Change!: " + $scope.vkitModel.filterText);

        $scope.matchingCards.length = 0;
        for (var i = 0; i < allCardNames.length; i++){
            var matches = false;

            var lowercaseFilterText = $scope.vkitModel.filterText.toLowerCase();

            if ("" == lowercaseFilterText) {
                matches = true;
            } else if (-1 != allCardNames[i].toLowerCase().indexOf(lowercaseFilterText)) {
                matches = true;
            }

            if (matches) {
                $scope.matchingCards.push(allCardNames[i]);
            }
        }

        console.log("Match size: " + $scope.matchingCards.length)
    }

    $scope.filterChanged = function() {
        updateMatchingCards();
    }

    $scope.addSelectedCards = function() {
        // Try to add the cards next to it's duplicates (if exist)
        for (var i = 0; i < $scope.vkitModel.selectedAdds.length; i++) {
            var cardToAdd = $scope.vkitModel.selectedAdds[i];
            var added = false;
            for (var j = 0; j < $scope.cardsForPdf.length; j++) {
                if ($scope.cardsForPdf[j] == cardToAdd) {
                    $scope.cardsForPdf.splice(j, 0, cardToAdd);
                    added = true;
                    break;
                }
            }

            if (!added) {
              $scope.cardsForPdf.push(cardToAdd);
            }
        }
    }

    $scope.removeSelectedCards = function() {
        for (var i = 0; i < $scope.vkitModel.selectedRemoves.length; i++) {
            for (var j = 0; j < $scope.cardsForPdf.length; j++) {
                if ( $scope.cardsForPdf[j] == $scope.vkitModel.selectedRemoves[i]) {
                    $scope.cardsForPdf.splice(j, 1);
                    break;
                }
            }
        }
    }

    function convertImgToBase64(url, callback)
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
          var dataURL = canvas.toDataURL('image/jpeg');
          callback(dataURL, canvas.height / canvas.width);
          canvas = null;
        };
        img.onerror = function() {
            console.log("Failed ot open image: " + url);
            callback(null);
        }

    }

    $scope.generatePdf = function() {
        var doc = new jsPDF('portrait', 'in', 'a4');

        var leftMargin = 0.35;
        var topMargin = 0.35;

        var cardHeight = 3.5;
        var cardWidth = 2.5;

        var cardsInCurrentRow = 0;
        var rowsPrinted = 0;

        function addNextCard(currentCardIndex) {
            if (currentCardIndex == $scope.cardsForPdf.length) {
                doc.output('save', 'vkitPdf.pdf');
            } else {

              cardsInCurrentRow++;
              if (cardsInCurrentRow > 3) {
                  cardsInCurrentRow = 1;
                  rowsPrinted++;

                  if (rowsPrinted > 2) {
                      rowsPrinted = 0;
                      doc.addPage();
                  }
              }

              var left = leftMargin + cardWidth * (cardsInCurrentRow - 1);
              var top = topMargin + cardHeight * (rowsPrinted);

              var cardName = $scope.cardsForPdf[currentCardIndex];
              var cardPath = allCardImages[cardName];
              console.log("image: " + cardPath );

              var imgData = convertImgToBase64(cardPath, function(dataUrl, aspectRatio){

                  var calculatedHeight = cardWidth * aspectRatio;
                  if (dataUrl != null){
                    doc.addImage(dataUrl, 'jpeg', left, top, cardWidth, calculatedHeight);
                  }

                  //$scope.printedCards.push(dataUrl);
                  //$scope.$apply();

                  addNextCard(currentCardIndex+1);
              });
            }
        }

        addNextCard(0);
    }

    updateMatchingCards();

}]);
