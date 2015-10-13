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

  echo '<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.28/angular.js"></script>
  <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
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

  echo '<div ng-app="vkit-app" ng-controller="VkitMain" ng-include="\'' . plugins_url('/vkit-app/js/vkit-app.html') . '\'"></div>';

}

?>
