<?php
/*
Plugin Name: VkitApp
Description: SWCCG VKit
Author: Tom Marlin
Version: 1.0
*/
//add_action('admin_menu', 'test_plugin_setup_menu');

add_shortcode("vkit_app", "initVkit" );

/*
function test_plugin_setup_menu(){
        add_menu_page( 'Test Plugin Page', 'Test Plugin', 'read', 'vkit-app', 'initVkit' );
}
*/

function initVkit(){


  /*
  echo '<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.28/angular.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.28/angular-route.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.28/angular-animate.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>

  <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.0/ui-bootstrap-tpls.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/jspdf/1.1.135/jspdf.min.js"></script>

  <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">';
  */

  //echo '<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.28/angular.js"></script>
  echo '<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/jspdf/1.1.135/jspdf.min.js"></script>
  <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">';

  echo '<script src="' . plugins_url('/vkit-app/js/VkitMain.js') . '"></script>' . "\n";
  echo '<script src="' . plugins_url('/vkit-app/js/whiteBorderizer.js') . '"></script>' . "\n";


  // For SWCCGPC:
  $extraPrefix = "wp/";

  // For Local testing:
  //$extraPrefix = "";


  $cardsPath = '/wp-content/plugins/vkit-app/cards/standard';
  $dir_f = ABSPATH . $cardsPath;
  //echo $dir_f;
  $files = scandir($dir_f);

  echo "<script> var j = 0;</script>";
  echo "<script>";

  echo "var allCardNames = [];";
  echo "var allCardImages = [];";
  foreach ($files as $value) {
    if ($value != '.' && $value != '..') {
      echo "allCardNames.push('" . $value . "');";
      echo "allCardImages['" . $value . "'] = '../" . $extraPrefix . $cardsPath . "/" . $value . "/image.png';";
      echo "allCardImages['" . $value . " (WB)'] = '../" . $extraPrefix . $cardsPath . "/" . $value . "/image.png';";
    }
  }

  echo '</script>';

  echo "<!DOCTYPE html>
    <meta charset='utf-8'>

    <!-- Prerequisites:
    <script src='//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js'></script>

    <script src='//maxcdn.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js'></script>
    <script src='//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.0/ui-bootstrap-tpls.js'></script>
    <script src='//cdnjs.cloudflare.com/ajax/libs/masonry/3.3.1/masonry.pkgd.min.js'></script>

    <link rel='stylesheet' href='//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css'>

    -->

    <div>

        <h2 style='float:left; font-weight:bold; font-size:22px'>Welcome to the new VKit!</h2>

        <!-- Instructions on the right side -->
        <div class='row' style='width:100%'>
          <div class='col-md-5' style='float:right'>
            <h4 style='float:right; text-decoration:underline; font-style:italic' onclick='expandCollapseInstructions()'> + Click For Instructions </h4>
            <div style='clear:both'></div>
          </div>
        </div>

        <div style='clear:both'></div>

        <!-- Instructions (collapsble per above) -->
        <div id='instructionsObj' style='border:thin solid #DADADA;margin:20px; position:relative; display:none'>
            <div style='position:absolute; top: 10px; right: 10px;'  onclick='expandCollapseInstructions()'>[Hide]</div>
            <div style='margin:20px'>
                <div> - The cards on the left are all of the cards available. </div>
                <div> - The cards on the right are all of the cards you have selected to print. </div>
                <div> - Type part of a card name into the 'filter' to limit the cards you see on the left.</div>
                <div> - Select a card on the left and press 'Add >>' to add it to the list on the right. Likewise to remove a card </div>
                <div> - Click 'Generate PDF' when you are ready. </div>
                <div style='text-decoration:underline; font-weight:bold'>The PDF may take a little while to generate. When it is ready, Your download should start automatically</div>
            </div>
        </div>


        <!-- Row: Labels -->
        <div class='row' style='width:100%'>
          <div class='col-md-5'>
              <label>Filter Cards:</label>
              <div style='clear:both'></div>
              <input type='text' id='filterText' onkeypress='queueFilterChange()' onchange='filterChanged()' style='width:100%'>
              <div style='clear:both;height:15px;width:100%'></div>
          </div>
        </div>


        <!-- Row: Actual controls -->
        <div class='row' style='height:100%; width:100%'>
            <div class='col-md-5'>
                <select multiple id='selectAdds' size=20 style='width:100%;'>
                  <!--<option ng-repeat='x in matchingCards' value='{{x}}'>{{x}}</option>-->
                </select>
            </div>

            <!-- Middle Pane:  Add/Remove buttons -->
            <div class='col-md-2'>
                <div>
                    <button class='btn btn-info btn-block' onclick='addSelectedCards(false)'>Add (BB)>></button>
                    <div style='height:10px'></div>
                    <button class='btn btn-info btn-block' onclick='addSelectedCards(true)'>Add (WB)>></button>
                    <div style='height:10px'></div>
                    <button class='btn btn-danger btn-block' onclick='removeSelectedCards()'> &lt;&lt; Remove</button>
                </div>
            </div>

            <!-- Right Pane:  Added Cards -->
            <div class='col-md-5'>
                <select multiple id='selectedRemoves' size=20 style='width:100%;height:100%'>
                  <!--<option ng-repeat='x in cardsForPdf track by $index' value='{{x}}'>{{x}}</option>-->
                </select>
            </div>
        </div>


        <!-- Row: Bottom Buttons -->
        <div class='row' style='width:100%'>
          <div class='col-md-5'>
          </div>
          <div class='col-md-2'>
          </div>
            <div class='col-md-5'>
                <div style='width:100%;height:10px'></div>
                <button class='btn btn-success' style='float:right' onclick='generatePdf()'>Generate PDF</button>
            </div>
        </div>


        <div style='color: red; font-style:italic'>This page is still under construction.  For issues or requests, please post in the forums.</div>

    </div>";
}

?>
