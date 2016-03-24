// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var example = angular.module('starter', ['ionic']);
var localDB = new PouchDB("testDbLocal"); //TODO maybe this could be on the run

example.run(function ($ionicPlatform, $PouchDBListener) {
  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    $PouchDBListener.sync("http://192.168.1.11:5984/testdb");
  });
}).service('$PouchDBListener', ['$rootScope', function($rootScope) {
  var changeListener;

  /**
   * The base of the service is look for changes on the db, when something changes, sends the rows to the controller to repaint
   */
  this.startListening = function(){
    changeListener = localDB.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', function (change) {
      if(!change.deleted) {
        $rootScope.$broadcast("$PouchDBListener:change", change.doc.rows);
      } else {
        $rootScope.$broadcast("$PouchDBListener:delete", change);
      }
    })
  };

  /**
   * This function do the sync between databases, the retry options is like an interval is looking to connect all the time
   * @param remoteDatabase
   */
  this.sync = function(remoteDatabase) {
    localDB.sync(remoteDatabase, {live: true, retry: true});
  }

}])
.controller('ListController', ['$scope', '$PouchDBListener', function ($scope, $PouchDBListener) {
    $PouchDBListener.startListening();
    localDB.get('plain_text2').then(function (doc) {
      $scope.$apply(function(){
        $scope.items = doc.rows;
      });
    });

    /**
     * Puts the new data when changes
     */
    $scope.$on('$PouchDBListener:change', function(event, data) {
      $scope.items = data;
      $scope.$apply();
    });
}]);
